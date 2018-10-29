const fs = require('fs')
const axios = require('axios')
const schedule = require('node-schedule')

let conf = undefined

if (fs.existsSync('conf.json')) {
    conf = readConf()
    // writeConf(conf)
} else {
    writeConf()
}

let tg_bot_api = 'https://api.telegram.org/bot' + conf.bot_token

function readConf() {
    return JSON.parse(fs.readFileSync('conf.json', 'utf8'))
}

function writeConf(data) {
    if (!data) {
        data = {
            bot_token: undefined
        }
    }
    data = JSON.stringify(data)
    fs.writeFileSync('conf.json', data, 'utf8')
}

function updateUserCookie(user, cookie){
    let _conf = readConf()
    _conf.user_info[user].cookie = cookie
    writeConf(_conf)
}

function updateUserNotiTS(user, type, ts) {
    let typeSet = conf.user_info[user].notify
    let typeIndex = typeSet.indexOf(type)
    if (typeIndex === -1) {
        ts = Math.round(Date.now() / 1000)
        conf.user_info[user].notify.push(type)
        conf.user_info[user].notify_ts.push(ts)
    } else {
        conf.user_info[user].notify_ts[typeIndex] = ts
    }
    writeConf(conf)
}

function getNotification(user, cookies, type, ts) {
    let data = {}
    axios.request('https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new', {
            // timeout: 1000,
            params: {
                uid: 0,
                type: type,
            },
            headers: {
                Cookie: cookies,
            },
            proxy: false
        })
        .then(function (res) {
            data = res.data
            if (data.msg === 'error' || data.message === 'error') {
                userCookieExpired(user)
            } else {
                getLastNotis(user, data.data.cards, type, ts)
            }
        })
    return data
}

function userCookieExpired(user) {
    axios({
            baseURL: tg_bot_api,
            url: '/sendMessage',
            params: {
                chat_id: user,
                text: '<b>Cookie已过期</b>\n请上传新的Cookie。如何获取Cookie请查看' +
                    getTagA('https://github.com/MamoruDS/bilibili-notify-telegram-bot/blob/master/README_CN.md#%E5%A6%82%E4%BD%95%E8%8E%B7%E5%8F%96cookie', '文档') +
                    '。\n',
                parse_mode: 'HTML',
                disable_web_page_preview: true
            },
            method: 'get',
            proxy: false
        })
        .then(function (res) {
            conf.user_info[user].cookie = undefined
            writeConf(conf)
        })
        .catch(function (err) {
            // console.log(err)
        })

}

function getLastNotis(chat_id, cards, notify_type, last_ts) {
    for (let i = cards.length - 1; i >= 0; i--) {
        let c_info = cards[i]
        let c_desc = c_info.desc
        let c_card = c_info.card
        if (c_desc.timestamp > last_ts) {
            // last_ts = c_desc.timestamp
            let card_obj = cardParse(c_card)
            let tg_method_obj = cardStylize(card_obj, notify_type)
            tg_method_obj.chat_id = chat_id

            updateUserNotiTS(chat_id, notify_type, c_desc.timestamp)
            // console.log(tg_method_obj)
            axios.request(tg_bot_api + tg_method_obj.route, {
                    params: tg_method_obj,
                    proxy: false
                })
                .then(function (res) {
                    console.log(`${logDate()} sent to "${chat_id}"`)
                    // console.log(res.data)
                })
                .catch(function (err) {
                    console.log(err)
                })
        }
    }
}

function logDate() {
    let event = new Date(Date.now());
    let options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        'hour': 'numeric',
        minute: 'numeric',
        second: 'numeric'
    };
    return event.toLocaleDateString('zh-CN', options)
}

function cardParse(card) {
    card = card.replace(new RegExp('\\\\', 'g'), '')
    card = card.replace(new RegExp('\\"', 'g'), '"')
    card = JSON.parse(card)
    return card
}

function cardStylize(card_obj, notify_type) {
    let tgm_obj = {
        route: undefined,
        text: '',
        photo: '',
        audio: '',
        caption: '',
        duration: 0,
        performer: '',
        title: '',
        document: '',
        thumb: '',
        video: '',
        animation: '',
        width: '',
        height: '',
        supports_streaming: false,
        parse_mode: 'HTML',
    }
    switch (notify_type) {
        case "8":
            tgm_obj.route = '/sendPhoto'
            tgm_obj.photo = card_obj.pic
            tgm_obj.caption = '<b>[关注UP 投稿视频]</b>\n' +
                '# ' + card_obj.owner.name +
                ' <b>投稿</b>：<a href="' + getBilibiliAidUrl(card_obj.aid) + '">' +
                card_obj.title + '</a>\n' +
                '<i>' + card_obj.desc + '</i>\n' +
                dynamicInfoParser(card_obj.dynamic)
            tgm_obj.parse_mode = 'HTML'
            break
        case "16":
            tgm_obj.route = '/sendVideo'
            tgm_obj.video = card_obj.item.video_playurl
            tgm_obj.duration = card_obj.item.video_time
            tgm_obj.thumb = card_obj.item.cover.default
            tgm_obj.caption = getTagBold("[关注UP 发布小视频]") + '\n' +
                '# ' + card_obj.user.name + '\n' + card_obj.item.description
            tgm_obj.parse_mode = 'HTML'
            break
        case "512":
            tgm_obj.route = '/sendPhoto'
            tgm_obj.photo = card_obj.cover
            tgm_obj.caption = '<b>[番剧更新]</b>\n' +
                '# ' + card_obj.apiSeasonInfo.title + '\n' +
                '<b>第' + card_obj.index + '话</b> ' +
                '<a href="' + card_obj.url + '">' + card_obj.index_title + '</a>'
            tgm_obj.parse_mode = 'HTML'
            break
    }
    return tgm_obj
}

function getBilibiliAidUrl(aid) {
    return `https://www.bilibili.com/video/av${aid}`
}

function getBilibiliTagUrl(tagName) {
    return `https://www.bilibili.com/tag/name/${tagName}/feed`
}

function getTagA(url, value) {
    return `<a href="${url}">${value}</a>`
}

function getTagBold(value) {
    return `<b>${value}</b>`
}

function getTagItalic(value) {
    return `<i>${value}</i>`
}

function dynamicInfoParser(d_info) {
    let re = /\#.{1,}?#/g
    let links = d_info.match(re)
    let d_info_str = d_info
    if (links !== null) {
        d_info_str = d_info.replace(re, '')
        for (let i = 0; i < links.length; i++) {
            let tagName = links[i].replace(/^\#/g, '@').replace('\#', '')
            d_info_str += ' ' + getTagA(getBilibiliTagUrl(tagName.replace('@', '')), tagName)
        }
    }
    return d_info_str
}

function notiCheck() {
    conf = readConf()
    tg_bot_api = 'https://api.telegram.org/bot' + conf.bot_token

    let user_info = conf['user_info']
    for (user in user_info) {
        user_cookie = user_info[user].cookie
        if (!user_cookie) {
            continue
        }
        user_notify = user_info[user].notify
        user_last_notify_ts = user_info[user].notify_ts
        for (let i = 0; i < user_notify.length; i++) {
            let res_data = getNotification(user, user_cookie, user_notify[i], user_last_notify_ts[i])
            // let notis = getLastNotis(user, res_data.data.cards, user_notify[i], user_last_notify_ts[i])
        }
    }
}

function updateCheck() {
    conf = readConf()
    last_update_id = conf.update_id
    tg_bot_api = 'https://api.telegram.org/bot' + conf.bot_token
    axios({
            baseURL: tg_bot_api,
            route: '/getUpdates',
            proxy: false,
            method: 'get'
        })
        .then(function (res) {
            console.log(res.data)
            res_array = res.data.result
            for (let i = 0; i < res_array.length; i++) {
                current_update_id = res_array[i].update_id
                if (current_update_id > last_update_id) {
                    last_update_id = current_update_id
                    let res_single = res_array[i]
                    let user = res_single.from.id
                    let update_text = res_single.message.text.split(' ')
                    switch (update_text[0]) {
                        case "/setCookie":
                            updateUserCookie(user, update_text[1])
                            break
                    }
                }
            }
        })
        .catch(function (err) {
            // console.log(err)
        })
}

// var j = schedule.scheduleJob('30 * * * * *', function () {

// })