import {
    timeout,
    timeoutNotis
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
        logGen('cardParse: ' + err.toString(), 'error')
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
        case "1":
            // forward
            break
        case "2":
            // message with photo
            tgm_obj.route = '/sendPhoto'
            tgm_obj.photo = card_obj.item.pictures.img_src
            tgm_obj.caption = `${getTagByName('b','[')} ${getHashTag('关注UP')} ${getHashTag('发布动态')} ${getTagByName('b',']')}\n${getHashTag(card_obj.user.name)}\n${card_obj.item.description}`
            tgm_obj.parse_mode = 'HTML'
            break

        case "8":
            // message with submit
            tgm_obj.route = '/sendPhoto'
            tgm_obj.photo = card_obj.pic
            tgm_obj.caption = `${getTagByName('b', '[')} ${getHashTag('关注UP')} ${getHashTag('投稿视频')} ${getTagByName('b',']')}\n${getHashTag(card_obj.owner.name)} 投稿：${getTagByName('a', card_obj.title, getBilibiliAidUrl(card_obj.aid))}\n${getTagByName('i', card_obj.desc)}\n${dynamicInfoParser(card_obj.dynamic)}`
            tgm_obj.parse_mode = 'HTML'
            break
        case "16":
            // message with clip
            tgm_obj.route = '/sendVideo'
            tgm_obj.video = card_obj.item.video_playurl
            tgm_obj.duration = card_obj.item.video_time
            tgm_obj.thumb = card_obj.item.cover.default
            tgm_obj.caption = `${getTagByName('b', '[')} ${getHashTag('关注UP')} ${getHashTag('发布小视频')} ${getTagByName('b',']')}\n${getHashTag(card_obj.user.name)}\n${card_obj.item.description}`
            tgm_obj.parse_mode = 'HTML'
            break
        case "512":
            // bangumi update
            tgm_obj.route = '/sendPhoto'
            tgm_obj.photo = card_obj.cover
            tgm_obj.caption = `${getTagByName('b','[')} ${getHashTag('番剧更新')} ${getTagByName('b',']')}\n${getHashTag(card_obj.apiSeasonInfo.title)}\n${getTagByName('b',`第${card_obj.index}话`)} ${getTagByName('a',card_obj.index_title,card_obj.url)}`
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
            d_info_str += ' ' + getTagByName('a', tagName, getBilibiliTagUrl(tagName.replace('@', '')))
        }
    }
    return d_info_str
}

export const getBilibiliSpaceUrl = (mid) => {
    return `https://space.bilibili.com/${mid}`
}

export const getBilibiliAidUrl = (aid) => {
    return `https://www.bilibili.com/video/av${aid}`
}

export const getBilibiliTagUrl = (tagName) => {
    return `https://www.bilibili.com/tag/name/${tagName}/feed`
}

export const getTagByName = (name, value, url) => {
    return `<${name} href="${url}">${value}</${name}>`
}

export const getHashTag = (tag) => {
    if (!tag) return 'NaN'
    tag = tag.replace(/[\ |\.|\-|\|]/g, '_')
    tag = tag.replace(/[\ |\!|\#|\$|\&|\'|\"|\(|\)|\*|\+|\,|\/|\\|\:|\;|\=|\?|\@\[|\]|\%|\^|\！|\？|\’|\‘|\“|\”|\，|\。|\（|\）|\【|\】]/g, '')
    return `#${tag}`
}

export const getTimestamp = (timeout_bool = false) => {
    let cur_ts = Math.round(Date.now() / 1000)
    if (timeout_bool) {
        return cur_ts - timeout
    } else {
        return cur_ts
    }
}

export const getTimestampNotis = (timeout_bool = false) => {
    let cur_ts = getTimestamp()
    if (timeout_bool) {
        return cur_ts - timeoutNotis
    } else {
        return cur_ts
    }
}

export const getCookie = (cookie) => {
    if (typeof cookie !== 'string') return undefined
    cookie = cookie.replace(/\s/g, '')
    if (!/^SESSDATA=/.test(cookie)) {
        cookie = `SESSDATA=${cookie}`
    }
    if (!/;$/.test(cookie)) {
        cookie = `${cookie};`
    }
    return cookie
}