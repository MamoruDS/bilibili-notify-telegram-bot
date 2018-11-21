import axios from 'axios'

import * as conf from './conf'
import * as format from './format'
import {
    logGen,
    AxiosErrHandle
} from './log'
import {
    cookie_warn,
    tg_bot_api
} from './main'

export const getNotification = (user, cookies) => {
    let data = {}
    axios.request('https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new', {
            // timeout: 1000,
            params: {
                uid: 0,
                type: 268435455,
            },
            headers: {
                Cookie: cookies,
            },
            proxy: false
        })
        .then((res) => {
            let _conf = conf.readConf()
            let cookie_valid = _conf.user_info[user].cookie_valid
            data = res.data
            if (data.msg === 'error' || data.message === 'error') {
                if (cookie_valid) {
                    conf.updateUserCookieValid(user, false)
                    logGen(`'${user}' cookie may have expired.`, 'warn', cookie_warn)
                } else {
                    logGen(`'${user}' cookie info has expired.`, 'warn')
                    userCookieExpired(user, true)
                }
            } else {
                if (!cookie_valid) {
                    conf.updateUserCookieValid(user, true)
                    logGen(`'${user}' cookie confirm has not expired.`, 'info', cookie_warn)
                }
                if (data.data.cards) {
                    // let c_info = data.data.cards[0]
                    getLastNotis(user, data.data.cards)
                }
            }
        })
        .catch((err) => {
            AxiosErrHandle(err, `fetching notifications of '${user}'`)
        })
    return data
}


export const getLastNotis = (chat_id, cards, conf_update = true) => {
    let _conf = conf.readConf()
    let type_range = _conf.user_info[chat_id].type_range
    let update_ts = _conf.user_info[chat_id].update_ts
    if (!update_ts) update_ts = format.getTimestamp(true)
    for (let i = cards.length - 1; i >= 0; i--) {
        let c_info = cards[i]
        let c_desc = c_info.desc
        let c_card = c_info.card
        if (c_desc.timestamp > update_ts) {
            if (conf_update) conf.updateUserUpdateTS(chat_id, c_desc.timestamp)
            if (c_desc.timestamp < format.getTimestampNotis(true)) continue
            if (type_range.indexOf(c_desc.type.toString()) === -1 && type_range.indexOf(c_desc.type) === -1) continue

            let card_obj = format.cardParse(c_card)
            let tg_method_obj = format.cardStylize(card_obj, c_desc.type.toString())
            tg_method_obj.chat_id = chat_id

            if (tg_method_obj.route === undefined) continue
            axios.request(tg_bot_api + tg_method_obj.route, {
                    params: tg_method_obj,
                    proxy: false
                })
                .then((res) => {
                    logGen(`notification has been sent to '${chat_id}'`, 'normal')
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.status === 400) {
                            getLastNotis(chat_id, cards, false)
                        } else {
                            AxiosErrHandle(err, `sending notification to '${chat_id}'`)
                        }
                    } else {
                        AxiosErrHandle(err, `sending notification to '${chat_id}'`)
                    }
                })
        }
    }
}


export const notiCheck = () => {
    let _conf = conf.readConf()
    let user_info = _conf['user_info']
    for (let user in user_info) {
        let user_cookie = user_info[user].cookie
        if (!user_cookie) {
            continue
        }
        if (user_info[user].cookie_valid === undefined) {
            conf.updateUserCookieValid(user, true)
        }
        getNotification(user, user_cookie)
    }
}


export const updateCheck = (last_update_id) => {
    axios({
            baseURL: tg_bot_api,
            url: '/getUpdates',
            proxy: false,
            method: 'get'
        })
        .then((res) => {
            let res_array = res.data.result
            for (let i = 0; i < res_array.length; i++) {
                let current_update_id = res_array[i].update_id
                if (current_update_id > last_update_id) {
                    last_update_id = current_update_id
                    let res_single = res_array[i]
                    let user = res_single.message.from.id
                    let update_text = res_single.message.text.split(' ')
                    let date_timeout = format.getTimestamp(true)
                    if (date_timeout >= res_single.message.date) {
                        logGen(`ignored one message sent from '${user}' because timeout.`, 'warn')
                        continue
                    }
                    switch (update_text[0]) {
                        case "/set_cookie":
                            logGen(`'${user}' has post a new cookie.`, 'user')
                            conf.updateUserCookie(user, update_text[1])
                            conf.updateUserCookieValid(user, true)
                            userCookieUpdated(user)
                            break
                        case "/start":
                            logGen(`'${user}' reset/create profile by bot command.`, 'user')
                            conf.createUserInfo(user, false)
                            break
                    }
                }
            }
            conf.updateLastUpdateId(last_update_id)
        })
        .catch((err) => {
            AxiosErrHandle(err, `fetching updates from telegramAPI`)
        })
}


export const userCookieExpired = (user, send_to_user) => {
    let _conf = conf.readConf()
    if (_conf.user_info[user].cookie) {
        conf.updateUserCookie(user, undefined)
        // send_to_user = false
        if (send_to_user) {
            axios({
                    baseURL: tg_bot_api,
                    url: '/sendMessage',
                    params: {
                        chat_id: user,
                        text: '<b>[Cookie已失效]</b>\n请上传新的Cookie。如何获取Cookie请查看' +
                            format.getTagA('https://github.com/MamoruDS/bilibili-notify-telegram-bot/blob/master/README_CN.md#%E5%A6%82%E4%BD%95%E8%8E%B7%E5%8F%96cookie', '文档') +
                            '。\n',
                        parse_mode: 'HTML',
                        disable_web_page_preview: true
                    },
                    method: 'get',
                    proxy: false
                })
                .then((res) => {
                    logGen(`cookie expired message has been sent to '${user}'.`, 'info')
                })
                .catch((err) => {
                    AxiosErrHandle(err, `sending cookie expired message to '${user}'`)
                })
        }
    }
}

export const userCookieUpdated = (user) => {
    axios({
            baseURL: tg_bot_api,
            url: '/sendMessage',
            params: {
                chat_id: user,
                text: '<b>[Cookie已更新]</b>',
                parse_mode: 'HTML',
                disable_web_page_preview: true
            },
            method: 'get',
            proxy: false
        })
        .then((res) => {
            logGen(`cookie updated message has been sent to '${user}'.`, 'info')
        })
        .catch((err) => {
            AxiosErrHandle(err, `sending cookie updated message to '${user}'`)
        })
}