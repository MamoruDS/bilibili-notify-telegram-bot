import {
    timeout
} from './main'
import {
    logGen
} from './log'

export const cardParse = (card) => {
    card = card.replace(new RegExp('\\\\\\"', 'g'), `'`)
    card = card.replace(new RegExp('\\\\', 'g'), ``)
    try {
        card = JSON.parse(card)
    } catch (err) {
        logGen('cardParse: ' + err.toString(),'warn')
    }
    return card
}

export const cardStylize = (card_obj, notify_type) => {
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

export const dynamicInfoParser = (d_info) => {
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

export const getBilibiliAidUrl = (aid) => {
    return `https://www.bilibili.com/video/av${aid}`
}

export const getBilibiliTagUrl = (tagName) => {
    return `https://www.bilibili.com/tag/name/${tagName}/feed`
}

export const getTagA = (url, value) => {
    return `<a href="${url}">${value}</a>`
}

export const getTagBold = (value) => {
    return `<b>${value}</b>`
}

export const getTagItalic = (value) => {
    return `<i>${value}</i>`
}

export const getTimestamp = (timeout_bool = false) => {
    let cur_ts = Math.round(Date.now() / 1000)
    if (timeout_bool) {
        return cur_ts - timeout
    } else {
        return cur_ts
    }
}