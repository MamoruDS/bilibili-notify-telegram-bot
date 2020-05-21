import axios from 'axios'

import { jsonstr, Url, TIMESTAMP } from './type'

import { OPT as options } from './main'
import { save2file } from './log'
import * as bilibili from './bilibili'
const BilibiliAPIURL = 'https://api.vc.bilibili.com'

const jsonParse = <T extends object>(input: jsonstr<T>): T => {
    try {
        return JSON.parse(input)
    } catch (e) {
        return undefined
    }
}

export type CardInfoParsed = {
    type: bilibili.PostType
    tags: string[]
    user_id?: number
    user_name?: string
    post_ts: TIMESTAMP
    season_id?: number
    episode_id?: number
    index?: string
    title?: string
    description?: string
    cover_url: Url[]
    bvid?: string
    avid?: string
}

const cardParses = (
    type: bilibili.PostType,
    cardStr: string
): CardInfoParsed => {
    const card = {
        type: type,
        tags: [],
        cover_url: [],
    } as CardInfoParsed
    if (type == 1) {
        // const _card = jsonParse<CardInfo1>(cardStr)
        // card.user_name = _card.user.uname
        // card.user_id = _card.user.uid
        // card.description = _card.item.content
    }
    if (type == 2) {
        const _card = jsonParse<bilibili.CardInfo2>(cardStr)
        card.user_name = _card.user.name
        card.user_id = _card.user.uid
        card.description = _card.item.description
        if (_card.item.pictures_count > 0) {
            for (const _pic of _card.item.pictures) {
                card.cover_url.push(_pic.img_src)
            }
        }
    }
    if (type == 8) {
        const _card = jsonParse<bilibili.CardInfo8>(cardStr)
        // card.tags = _card.dynamic
        const tags = _card.dynamic
        const tagRegex = new RegExp(/#([^#]+)#/, 'g')
        while (true) {
            const _res = tagRegex.exec(tags)
            if (_res == null) {
                break
            } else {
                card.tags.push(_res[1])
            }
        }
        card.user_name = _card.owner.name
        card.user_id = _card.owner.mid
        card.title = _card.title
        card.description = _card.desc
        card.cover_url.push(_card.pic)
    }
    if (type == 64) {
        // const _card = jsonParse<CardInfo64>(cardStr)
    }
    if (type == 512) {
        const _card = jsonParse<bilibili.CardInfo512>(cardStr)
        card.season_id = _card.apiSeasonInfo.season_id
        card.episode_id = _card.episode_id
        card.index = _card.index
        card.title = _card.apiSeasonInfo.title
        card.description = _card.index_title
        card.cover_url.push(_card.cover)
    }
    if (type == 4098) {
        // const _card = jsonParse<CardInfo4098>(cardStr)
    }
    return card
}

export class API {
    private _SESSDATA: string
    constructor(SESSDATA: string) {
        this._SESSDATA = SESSDATA
    }

    // async get
    async getCards(
        typeFilter: bilibili.PostType[] = [8, 512]
    ): Promise<{
        networkErr: boolean
        apiErr: boolean
        unknownErr: boolean
        skip: boolean
        raw: object | string
        cards: CardInfoParsed[]
    }> {
        const res = {
            networkErr: false,
            apiErr: false,
            unknownErr: false,
            skip: false,
            raw: {},
            cards: [] as CardInfoParsed[],
        }
        try {
            res.raw = await this._getUpdates(typeFilter)
            const updates: bilibili.Updates =
                typeof res.raw == 'object'
                    ? res.raw
                    : typeof res.raw == 'string'
                    ? JSON.parse(res.raw)
                    : { code: -999999, localMsg: 'parse failed' }
            if (updates.code != 0) {
                if (updates.code == -8) {
                    res.unknownErr = true
                    res.skip = true
                } else if (updates.code == 500201) {
                    res.skip = true
                } else if (updates.code == -999999) {
                    res.unknownErr = true
                    res.skip = true
                } else {
                    res.apiErr = true
                }
                if (options.logAPIErrRes) save2file(updates)
            } else {
                const _cards = updates.data.cards
                for (const _c of _cards) {
                    const _t = _c.desc.type as bilibili.PostType
                    if (!typeFilter.includes(_t)) {
                        continue
                    } else {
                        const _card = cardParses(_t, _c.card)
                        // 1 origin.bvid
                        _card.bvid = _c.desc.bvid
                        _card.post_ts = _c.desc.timestamp * 1000 || Date.now()
                        res.cards.unshift(_card)
                    }
                }
            }
        } catch (e) {
            //
        }
        return res
    }
    private async _getUpdates(
        type: bilibili.PostType[] = [268435455]
    ): Promise<bilibili.Updates> {
        return new Promise((resolve, reject) => {
            axios({
                baseURL: BilibiliAPIURL,
                url: '/dynamic_svr/v1/dynamic_svr/dynamic_new',
                method: 'GET',
                params: {
                    uid: '0',
                    type_list: type.join(','),
                    from: 'header',
                },
                headers: {
                    cookie: 'SESSDATA=' + this._SESSDATA,
                },
            })
                .then((res) => {
                    resolve(res.data)
                })
                .catch((e) => {
                    reject(e)
                })
        })
    }
}
