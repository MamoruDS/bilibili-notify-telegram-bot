import fs from 'fs'
import beautify from 'js-beautify'

import {
    logGen
} from './log'
import {
    conf_path
} from './main'
import * as format from './format'

export const readConf = () => {
    return JSON.parse(fs.readFileSync(conf_path, 'utf8'))
}

export const writeConf = (data) => {
    if (!data) {
        data = {
            user_info: {},
            update_id: 0,
            bot_token: undefined
        }
        logGen('default conf.json has been ganerated.', 'info')
    }
    data = JSON.stringify(data)
    data = beautify(data, {
        indent_size: 4
    })
    fs.writeFileSync(conf_path, data, 'utf8')
}

export const confFormatCheck = () => {
    let _conf = undefined
    if (fs.existsSync(conf_path)) {
        _conf = readConf()

        let user_info = _conf.user_info
        if (user_info) {
            for (let user in user_info) {
                let user_detail = user_info[user]
                let user_re = {
                    cookie: user_detail.cookie,
                    cookie_valid: user_detail.cookie_valid,
                    type_range: user_detail.type_range,
                    update_ts: user_detail.update_ts
                }
                if (user_detail.notify !== undefined) {
                    if (!user_detail.type_range) {
                        user_re.type_range = user_detail.notify
                    }
                }
                if (user_detail.notify_ts !== undefined) {
                    if (!user_detail.update_ts) {
                        user_re.update_ts = Math.max(...user_detail.notify_ts)
                    }
                }
                if (user_detail.cookie_valid === undefined) {
                    user_re.cookie_valid = false
                }
                if (!user_detail.type_range) {
                    user_re.type_range = ["8", "16", "512"]
                }
                if (!user_detail.update_ts) {
                    user_re.update_ts = format.getTimestamp(true)
                }
                _conf.user_info[user] = user_re
            }
        }
        writeConf(_conf)
    } else {
        writeConf()
    }
}

export const createUserInfo = (user, overwrite) => {
    let _conf = readConf()
    let default_userInfo = {
        type_range: ["8", "16", "512"],
        update_ts: format.getTimestamp(true),
        cookie: "undefined"
    }
    if (!_conf.user_info[user] || overwrite) {
        _conf.user_info[user] = default_userInfo
    }
    writeConf(_conf)
}

export const updateUserCookie = (user, cookie) => {
    let _conf = readConf()
    _conf.user_info[user].cookie = cookie
    writeConf(_conf)
}

export const updateUserCookieValid = (user, valid) => {
    let _conf = readConf()
    _conf.user_info[user].cookie_valid = valid
    writeConf(_conf)
}

export const updateLastUpdateId = (update_id) => {
    let _conf = readConf()
    _conf.update_id = update_id
    writeConf(_conf)
}

export const updateUserNotiTS = (user, type, ts) => {
    let _conf = readConf()
    let typeSet = _conf.user_info[user].notify
    let typeIndex = typeSet.indexOf(type)
    if (typeIndex === -1) {
        ts = format.getTimestamp()
        _conf.user_info[user].notify.push(type)
        _conf.user_info[user].notify_ts.push(ts)
    } else {
        _conf.user_info[user].notify_ts[typeIndex] = ts
    }
    writeConf(_conf)
}

export const updateUserUpdateTS = (user, ts) => {
    let _conf = readConf()
    _conf.user_info[user].update_ts = ts
    writeConf(_conf)
}