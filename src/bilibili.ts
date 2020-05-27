import { jsonstr, TIMESTAMP, Url, UrlScheme } from './type'

type Card = {
    desc: {
        uid: number
        type: number
        rid: number
        acl: number
        view: number
        repost: number
        comment: number
        like: number
        is_liked: 0 | 1
        dynamic_id: number
        timestamp: number
        pre_dy_id: number
        orig_dy_id: number
        orig_type: number
        user_profile: {
            info: {
                uid: number
                uname: string
                face: string
            }
            card: {
                official_verify: {
                    type: number
                    desc: string
                }
            }
            vip: Vip
            pendant: {
                pid: number
                name: string
                image: string
                expire: number
                image_enhance: string
            }
            decorate_card: {
                mid: number
                id: number
                card_url: string
                card_type: number | 1
                name: string
                expire_time: 0
                card_type_name: string
                uid: number
                item_id: number | 36
                item_type: number | 2
                big_card_url: string
                jump_url: string
                fan: {
                    is_fan: 0
                    number: 0
                    color: ''
                    num_desc: ''
                }
                image_enhance: string
            }
            rank: string
            sign: string
            level_info: LevelInfo
        }
        uid_type: number | 1
        stype: number | 0
        r_type: number | 1
        inner_id: number | 0
        status: number | 1
        dynamic_id_str: string
        pre_dy_id_str: string
        orig_dy_id_str: string
        rid_str: string
        bvid?: string
        origin?: {
            uid: number
            type: number | 8
            rid: number
            acl: number | 0
            view: number
            repost: number | 4
            like: number | 0
            dynamic_id: number
            timestamp: number
            pre_dy_id: number
            orig_dy_id: number
            uid_type: number | 1
            stype: number | 0
            r_type: number | 1
            inner_id: number
            status: number | 1
            dynamic_id_str: string
            pre_dy_id_str: string
            orig_dy_id_str: string
            rid_str: string
            bvid: string
        }
    }
    card: jsonstr<CardInfo1> | jsonstr<CardInfo2>
    extend_json: jsonstr<Extend>
    display: {
        origin: {
            relation: Relation
        }
        emoji_info: {
            emoji_details?: []
        }
        usr_action_txt: string
        relation: Relation
    }
}

export type CardInfo1 = {
    user: { uid: number; uname: string; face: string }
    item: {
        rp_id: number
        uid: number
        content: string
        orig_dy_id: number
        pre_dy_id: number
        timestamp: number
        reply: number
        orig_type: number
    }
    origin?: jsonstr<Origin>
    origin_extend_json?: jsonstr<Extend>
    origin_user?: {
        info: {
            uid: number
            uname: string
            face: string
        }
        card: {
            officical_verify: {
                type: number
                desc: string
            }
        }
        vip: Vip
    }
}

export type CardInfo2 = {
    item: {
        id: number
        title: ''
        description: string
        category: string | 'daily'
        role: any[]
        source: any[]
        pictures: Picture[]
        pictures_count: number
        upload_time: number
        at_control: string | ''
        reply: number
        settings: { copy_forbidden: 0 | 1 }
        is_fav: 0 | 1
    }
    user: {
        uid: number
        head_url: string
        name: string
        vip: Vip
    }
}

export type CardInfo8 = {
    aid: number
    attribute: number
    cid: number
    comment_jump_url: UrlScheme
    copyright:
        | 1 // origin
        | 2 // forward
    ctime: TIMESTAMP
    desc: string
    dimension: { height: number; rotate: number | 0; width: number }
    duration: number
    dynamic: string // tags #tag#
    jump_url: UrlScheme
    owner: {
        face: Url
        mid: number
        name: string
    }
    pic: Url
    player_info: null
    pubdate: TIMESTAMP
    rights: {
        autoplay: 0 | 1
        bp: 0 | 1
        download: 0 | 1
        elec: 0 | 1
        hd5: 0 | 1
        is_cooperation: 0 | 1
        movie: 0 | 1
        no_background: 0 | 1
        no_reprint: 0 | 1
        pay: 0 | 1
        ugc_pay: 0 | 1
        ugc_pay_preview: 0 | 1
    }
    share_subtitle?: string
    stat: {
        aid: number
        coin: number
        danmaku: number
        dislike: number
        favorite: number
        his_rank: number
        like: number
        now_rank: number
        reply: number
        share: number
        view: number
    }
    state: 0
    tid: number
    title: string
    tname: string | '综艺' | '手机游戏' | '音乐现场'
    videos: number | 1
}

export type CardInfo512 = {
    aid: number
    apiSeasonInfo: {
        bgm_type: 0 | 1
        cover: Url
        is_finish: 0 | 1
        season_id: number
        title: string
        total_count: number // total episode counts
        ts: TIMESTAMP
        type_name: '番剧'
    }
    bullet_count: number
    cover: Url
    episode_id: number
    index: string
    index_title: string // subtitle
    new_desc: string
    online_finish: number | 1
    play_count: number
    reply_count: number
    url: Url
}

type Picture = {
    img_src: string
    img_width: number
    img_height: number
    img_size: number
}

type Vip = {
    vipType: number | 2
    vipDueDate: number
    dueRemark: string
    accessStatus: number | 0
    vipStatus: number | 1
    vipStatusWarn: string
    themeType: number | 0
    label: {
        path: string
    }
    pendant?: {
        pid: number
        name: string
        image: string
        expire: number
        image_enhance: string
    }
    rank?: string
    sign?: string
    level_info?: LevelInfo
}

type Origin = {
    aid: number
    attribute: number
    cid: number
    comment_jump_url: string
    copyright: 2
    ctime: number
    desc: string
    dimension: {
        height: number
        rotate: number
        width: number
    }
    duration: number
    dynamic: string
    jump_url: string
    owner: {
        face: string
        mid: number
        name: string
    }
    pic: string
    player_info: null
    pubdate: number
    redirect_url: string
    rights: {
        autoplay: number
        bp: number
        download: number
        elec: number
        hd5: number
        is_cooperation: number
        movie: number
        no_background: number
        no_reprint: number
        pay: number
        ugc_pay: number
        ugc_pay_preview: number
    }
    share_subtitle: string
    stat: {
        aid: number
        coin: number
        danmaku: number
        dislike: number
        favorite: number
        his_rank: number
        like: number
        now_rank: number
        reply: number
        share: number
        view: number
    }
    state: number
    tid: number
    title: string
    tname: string
    videos: number
}

type Extend = {
    from?: { verify: { cc: { nv: number | 1 } } }
    like_icon: {
        action: string
        action_url: string
        end: string
        end_url: string
        start: string
        start_url: string
    }
}

type LevelInfo = {
    current_level: number
    current_min: number
    current_exp: number
    next_exp: string | '0'
}

type Relation = {
    status: number | 1 | 2
    is_follow: 0 | 1
    is_followed: 0 | 1
}

export type Updates = {
    code: 0 | -6 | -8 | 500003 | 500201 | -999999
    msg: string
    message: string
    data: {
        new_num: number
        exist_gap: number
        update_num: number
        open_rcmd: number
        archive_up_num: number
        up_num: {
            archive_up_num: number
            bangumi_up_num: number
        }
        extra_flag: {
            great_dynamic: number
        }
        cards: Card[]
    }
    attentions?: {
        uids: number[]
        bangumis: [{ season_id: number; type: number }[]]
    }
    max_dynamic_id?: number
    history_offset?: number
    _gt_?: number
}

export type PostType =
    | 1 // repost
    | 2 // post
    | 8 // upload
    | 64 // article
    | 512 // bangumi
    | 4097
    | 4098 // movie (anime
    | 4099
    | 4100
    | 4101
    | 268435455 // all
