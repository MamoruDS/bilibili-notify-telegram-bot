import schedule from 'node-schedule'
import {
    argv as argv
} from 'yargs'

import * as conf from './conf'
import * as requests from './requests'
import {
    logGen
} from './log'

export const conf_path = argv['f'] ? argv['f'] : 'conf.json'
//TODO: set safe range and type for parameters
const interval_sec = argv['i'] ? argv['i'] : 10
export const timeout = argv['t'] ? argv['t'] : 600
export const cookie_warn = argv['cookie-warn'] ? true : false

export let tg_bot_api = undefined

logGen('bot started. interval(sec):'.bold + interval_sec.toString().bold.green + ' timeout:'.bold + timeout.toString().bold.red, 'info')
conf.confFormatCheck()

schedule.scheduleJob(`*/${interval_sec} * * * * *`, () => {
    let _conf = conf.readConf()
    let last_update_id = _conf.update_id
    tg_bot_api = 'https://api.telegram.org/bot' + _conf.bot_token

    requests.notiCheck()
    requests.updateCheck(last_update_id)
})