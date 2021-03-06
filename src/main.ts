import { BotUtils } from 'telegram-bot-utils/dist/bot'
import { readFileSync } from 'fs'
import { Client } from 'cchook'
import { RuleEngine, Rule, RuleFnMap } from 'ms-rules'
import * as moment from 'moment-timezone'

import { safeMDv2, safeTag, stringFormatter, wait } from './utils'
import { API, CardInfoParsed } from './request'
import * as bilibili from './bilibili'

export const OPT = {
    name: 'bilibili-notify',
    interval: 300000,
    scriptPath: './script/bilibili_sessdata.js',
    logPath: './logs',
    logAPIErrRes: true,
    sendLogToUser: false,
    hookCliOptions: {
        enable: false,
        user: 'USERID',
        address: 'https://cchook.youraddress',
        port: 8030,
        password: 'password',
        action: 'bilibili_sessdata',
    },
    commands: {
        script: {
            str: 'bilibili_sessdata_script',
            description: '',
        },
        update: {
            str: 'bilibili_sessdata_update',
            description: 'Update SESSDATA session info',
        },
        start: {
            str: 'bilibili_notif',
            description: 'Start notification service',
        },
        stop: {
            str: 'bilibili_notif_stop',
            description: 'Stop notification service',
        },
        status: {
            str: 'bilibili_notif_status',
            description: 'Print current status of notification service',
        },
        debug_resend: {
            str: 'bilibili_debug_resend',
            description: 'Resend last {?} messages',
        },
        upload_rules: {
            str: 'bilibili_upload_rules',
            description: 'Upload notification filter rules (in JSON',
        },
    },
    messageActions: {
        updateSESSDATA: {
            name: 'bilibili_notif_update_sessdata',
        },
        uploadRules: {
            name: 'bilibili_upload_rules',
        },
    },
    tasks: {
        getUpdate: {
            str: 'getUpdate',
            description: 'Fetch update from bilibili API',
        },
    },
    momentLocale: 'en',
    momentTimezone: 'Asia/Shanghai',
    text: {
        titleSESSDATAMissing: '*\\[ SESSDATA Not Found \\]*',
        titleSESSDATAinvalid: '*\\[ SESSDATA Invalid \\]*',
        titleSESSDATAUnknownERR: '*\\[ SESSDATA Unknown Error \\]*',
        titleARGUMENTMissing: '*\\[ ARGUMENT MISSING \\]*',
        updateSESSDATAWithCmd:
            '1⃣️ Update sessdata with command\n${_}\nlearn how to get `SESSDATA` manually with [page](https://github.com/MamoruDS/bilibili-notify-telegram-bot/blob/master/README.md#how-to-get-cookie)\\.',
        updateSESSDATAWithScript:
            '2⃣️ Fetch `SESSDATA` automatically with `QuantumultX` script \\(iOS only\\), using command\n${_}\nto get script',
        updateFormat: [
            'Update format example:',
            '```',
            '${_} 403b3c2a%bC1601334589%2C9c817*51',
            '```',
        ].join('\n'),
        updateWaiting: 'Waiting for input ...',
        fetchSuccess: '`SESSDATA` fetch success',
        lastUpdate: 'Last update at: ',
        lastStart: 'Started since: ',
        lastStop: 'Stopped since: ',
        userMention: 'This script only for user: ',
        version: 'version: ',
        taskAlreadyStarted: 'Task already runing.',
        taskAlreadyStopped: 'Task is not running.',
        taskStarted: 'Task started.',
        taskStopped: 'Task stopped.',
        noParser: 'missing parser for type ${_}',
        tag1: 'UP_Forward',
        tag2: 'UP_Post',
        tag8: 'UP_Upload',
        tag512: 'Bangumi_Update',
        episode: 'Episode: ${_}',
        episodeUnknown: '??',
        rawResponse: 'raw_response',
        debug_resend:
            '[DEBUG] Resend ${_} historical notifications on next update',
        ruleUploadListener: 'Waiting for rule to be uploaded ...',
        ruleLoadErr: 'Error occurred when rules were loaded into RuleEngine:',
        ruleParseErr: 'Can not parse uploaded rules',
        ruleFormatErr: 'Bad format of uploaded rules',
        ruleUploadSuccess: 'Rules have been updated',
        ruleUploadFailed: 'Upload failed.\nRetry with the command /${_}',
    },
    _bilibiliSpace: 'https://space.bilibili.com/${_}',
    _bilibiliVideo: 'https://www.bilibili.com/video/${_}',
    _bilibiliBangumiSE: 'https://bangumi.bilibili.com/anime/${_}',
    _bilibiliBangumiEP: 'https://www.bilibili.com/bangumi/play/ep${_}',
}

const getCards = async (sessdata: string, type?: bilibili.PostType[]) => {
    const _a = new API(sessdata)
    return await _a.getCards(type)
}

const CardActions = ['PUSH', 'DISCARD'] as const
type CardRuleType = 'user_id' | 'keyword'
type CardRuleAct = typeof CardActions[number]

const CardRuleFnMap: RuleFnMap<CardRuleType> = {
    user_id: {
        fn: (input: CardInfoParsed, value: number) => {
            return input.user_id == value
        },
        valType: 'number',
        inputType: (input: CardInfoParsed) => {
            return typeof input?.user_id == 'number'
        },
    },
    keyword: {
        fn: (input: CardInfoParsed, value: string) => {
            return (
                `${input.title || ''} ${input.description || ''}`.indexOf(
                    value
                ) != -1
            )
        },
        valType: 'string',
        inputType: (input: CardInfoParsed) => {
            return (
                typeof input?.title == 'string' ||
                typeof input?.description == 'string'
            )
        },
    },
}

const cardFilter = (
    card: CardInfoParsed,
    rules: Rule<CardRuleAct, CardRuleType>[] = []
): CardRuleAct => {
    const ruleEngine = new RuleEngine<CardRuleAct, CardRuleType>(
        CardRuleFnMap,
        'PUSH'
    )
    ruleEngine.actions = [...CardActions] // this line will take no effects
    for (const r of rules) {
        ruleEngine.load(r)
    }
    const res = ruleEngine.exec(card)
    return res.action
}

const cardRulesTest = (
    rules: Rule<CardRuleAct, CardRuleType>[] = []
): string[] => {
    const ruleEngine = new RuleEngine<CardRuleAct, CardRuleType>(
        CardRuleFnMap,
        'PUSH'
    )
    ruleEngine.actions = [...CardActions]
    const errs = []
    for (const r of rules) {
        ruleEngine.load(r, false, true).forEach((e) => {
            errs.push(e)
        })
    }
    return errs
}

const messageParser = (card: CardInfoParsed): string => {
    if (card.type) {
        if (card.type == 8)
            return [
                `*\\[ ${safeTag(card.user_name)} ${safeTag(
                    OPT.text.tag8
                )} \\]*`,
                `[${safeMDv2(card.title)}](${stringFormatter(
                    OPT._bilibiliVideo,
                    [card.bvid || card.avid]
                )})`,
                safeMDv2(card.description),
                `[@${safeMDv2(
                    card.user_name
                )}](${stringFormatter(OPT._bilibiliSpace, [
                    card.user_id + '',
                ])})`,
            ].join('\n')

        if (card.type == 512)
            return [
                `*\\[ ${safeTag(OPT.text.tag512)} ${safeTag(card.title)} \\]*`,
                `[${stringFormatter(OPT.text.episode, [
                    card.index || OPT.text.episodeUnknown,
                ])}](${stringFormatter(OPT._bilibiliBangumiEP, [
                    card.episode_id + '',
                ])}) ${
                    card.description ? `*${safeMDv2(card.description)}*` : ''
                }`,
                `[@${safeMDv2(
                    card.title
                )}](${stringFormatter(OPT._bilibiliBangumiSE, [
                    card.season_id + '',
                ])})`,
            ].join('\n')
    }
    return stringFormatter(OPT.text.noParser, [card.type + ''])
}

const taskStart = (bot: BotUtils, chatId: number, userId: number): string => {
    const taskId = bot.task.new(OPT.tasks.getUpdate.str, chatId, userId, true)
    const userData = bot.app.get(OPT.name).dataMan({
        user_id: userId,
        chat_id: chatId,
    })
    userData.set(taskId, ['task_id'])
    userData.set(Date.now(), ['task_start_at'])
    bot.api.sendMessage(chatId, [OPT.text.taskStarted].join('\n'))
    return taskId
}

const taskStop = (bot: BotUtils, chatId: number, userId: number): void => {
    const userData = bot.app.get(OPT.name).dataMan({
        user_id: userId,
        chat_id: chatId,
    })
    const taskId = bot.task.record.renewId(userData.get(['task_id']))
    bot.task.record.delete(taskId)
    userData.set(undefined, ['task_id'])
    userData.set(Date.now(), ['task_stop_at'])
    bot.api.sendMessage(chatId, [OPT.text.taskStopped].join('\n'))
    return
}

const taskExec = (bot: BotUtils, chatId: number, userId: number): void => {
    const userData = bot.app.get(OPT.name).dataMan({
        user_id: userId,
        chat_id: chatId,
    })
    const taskId = bot.task.record.renewId(userData.get(['task_id']))
    if (taskId) {
        bot.task.forceExec(taskId)
    }
    return
}

const bilibiliNotif = (bot: BotUtils, options: Optional<typeof OPT>) => {
    assign(OPT, options)
    moment.locale(OPT.momentLocale)
    bot.application.add(OPT.name, {
        is_group_need_bind: true,
        data_bind_with_chat: false,
        data_bind_with_user: true,
    })
    bot.task.add(
        OPT.tasks.getUpdate.str,
        async (inf) => {
            const userData = inf.data.user_data
            const sessdata = userData.get(['sessdata'])
            if (typeof sessdata == 'undefined') {
                bot.api.sendMessage(
                    inf.data.chat_id,
                    [
                        OPT.text.titleSESSDATAMissing,
                        stringFormatter(OPT.text.updateSESSDATAWithCmd, [
                            safeMDv2('/' + OPT.commands.update.str),
                        ]),
                        stringFormatter(OPT.text.updateSESSDATAWithScript, [
                            safeMDv2('/' + OPT.commands.script.str),
                        ]),
                    ].join('\n'), //
                    {
                        disable_web_page_preview: true,
                        parse_mode: 'MarkdownV2',
                    }
                )
                taskStop(bot, inf.data.chat_id, inf.data.user_id)
                return
            }

            const types = userData.get(['filter']) || [8, 512]
            const { apiErr, unknownErr, skip, raw, cards } = await getCards(
                sessdata,
                types
            )
            if (apiErr) {
                bot.api.sendMessage(
                    inf.data.chat_id,
                    [
                        OPT.text.titleSESSDATAinvalid,
                        stringFormatter(OPT.text.updateSESSDATAWithCmd, [
                            safeMDv2('/' + OPT.commands.update.str),
                        ]),
                        stringFormatter(OPT.text.updateSESSDATAWithScript, [
                            safeMDv2('/' + OPT.commands.script.str),
                        ]),
                    ].join('\n'), //
                    {
                        disable_web_page_preview: true,
                        parse_mode: 'MarkdownV2',
                    }
                )
                taskStop(bot, inf.data.chat_id, inf.data.user_id)
                return
            }
            if (unknownErr && OPT.sendLogToUser) {
                bot.api.sendDocument(
                    inf.data.chat_id,
                    Buffer.from(
                        typeof raw == 'object' ? JSON.stringify(raw) : raw
                    ),
                    {
                        caption: [OPT.text.titleSESSDATAUnknownERR].join('/n'),
                        parse_mode: 'MarkdownV2',
                    },
                    {
                        filename: OPT.text.rawResponse + '.txt',
                    }
                )
            }
            if (skip) {
                return
            }

            let resendCount = userData.get(['task_resend']) || 0

            userData.set(Date.now(), ['task_update_at'])
            userData.set(undefined, ['task_resend'])

            let i = 0
            let ignoreTs = false
            while (true) {
                const card = cards[i]
                if (typeof card == 'undefined') {
                    if (!ignoreTs && resendCount) {
                        ignoreTs = true
                        i -= resendCount
                        continue
                    }
                    break
                }
                if (ignoreTs) {
                    //
                } else {
                    if (card.post_ts <= (userData.get(['latest_ts']) || 999)) {
                        i++
                        continue
                    } else {
                        if (resendCount > 0) {
                            ignoreTs = true
                            i -= resendCount
                            continue
                        }
                    }
                }

                userData.set(card.post_ts, ['latest_ts'])

                const caption = messageParser(card)

                const rules = JSON.parse(userData.get(['rules']) || '[]')

                if (cardFilter(card, rules) == 'PUSH') {
                    if (card.cover_url.length == 0) {
                        bot.api.sendMessage(inf.data.chat_id, caption, {
                            parse_mode: 'MarkdownV2',
                        })
                    }
                    if (card.cover_url.length == 1) {
                        bot.api.sendPhoto(inf.data.chat_id, card.cover_url[0], {
                            caption: caption,
                            parse_mode: 'MarkdownV2',
                        })
                    }
                    if (
                        card.cover_url.length >= 2 &&
                        card.cover_url.length <= 10
                    ) {
                        bot.api.sendMediaGroup(
                            inf.data.chat_id,
                            card.cover_url.map((url) => {
                                return {
                                    type: 'photo',
                                    media: url,
                                    caption: caption,
                                    parse_mode: 'MarkdownV2',
                                }
                            })
                        )
                    }
                    await wait(1000)
                } else if (ignoreTs) {
                    // TODO: display discard message in 'resend' mode
                }
                i++
            }
        },
        OPT.interval,
        Infinity,
        {
            description: OPT.tasks.getUpdate.description,
            import_policy: 'curr-ignore',
        },
        {
            application_name: OPT.name,
        }
    )
    bot.command.add(
        OPT.commands.start.str,
        (inf) => {
            const useData = inf.data.user_data
            if (useData.get(['task_id'])) {
                bot.api.sendMessage(
                    inf.data.chat_id,
                    [OPT.text.taskAlreadyStarted].join('\n'),
                    {
                        parse_mode: 'MarkdownV2',
                    }
                )
            } else {
                taskStart(bot, inf.message.chat.id, inf.message.from.id)
            }
        },
        { description: OPT.commands.start.description, filter: 'public' },
        {
            application_name: OPT.name,
        }
    )
    bot.command.add(
        OPT.commands.script.str,
        (inf) => {
            //
            const msg = inf.message
            const script = readFileSync(OPT.scriptPath).toString()
            const version =
                new RegExp(/const\sversion\s=\s'([\w|\.]{1,})'/, 'gm').exec(
                    script
                )[1] || 'unknown'
            bot.api.sendDocument(
                msg.from.id,
                Buffer.from(
                    script.replace(
                        'const user_id = 0',
                        `const user_id = ${msg.from.id}`
                    )
                ),
                {
                    caption: [
                        OPT.text.version + version,
                        OPT.text.userMention + msg.from.first_name,
                    ].join('\n'),
                    // parse_mode: 'MarkdownV2'
                },
                { filename: 'bilibili_sessdata_getter.js' }
            )
        },
        {
            filter: 'public',
            description: OPT.commands.script.description,
        },
        {
            application_name: OPT.name,
        }
    )
    bot.messageAction.add(
        OPT.messageActions.updateSESSDATA.name,
        async (inf) => {
            const SESSDATA = inf.message.text
            inf.data.user_data.set(SESSDATA, ['sessdata'])
            taskStart(bot, inf.message.chat.id, inf.message.from.id)
            return true
        },
        {
            max_exec_counts: 1,
            pass_to_other_action: false,
            pass_to_command: false,
        },
        {
            application_name: OPT.name,
        }
    )
    bot.command.add(
        OPT.commands.update.str,
        (inf) => {
            const SESSDATA = inf.arguments[1]
            inf.data.user_data.set(SESSDATA, ['sessdata'])
            taskStart(bot, inf.message.chat.id, inf.message.from.id)
        },
        {
            filter: 'public',
            description: OPT.commands.update.description,
            argument_check: [
                {
                    type: 'string',
                },
            ],
            argument_error_function: (msg) => {
                bot.api.sendMessage(
                    msg.chat.id,
                    [safeMDv2(OPT.text.updateWaiting)].join('\n'),
                    {
                        parse_mode: 'MarkdownV2',
                    }
                )
                bot.messageAction.new(
                    OPT.messageActions.updateSESSDATA.name,
                    msg.chat.id,
                    msg.from.id
                )
            },
        },
        {
            application_name: OPT.name,
        }
    )
    bot.command.add(
        OPT.commands.stop.str,
        (inf) => {
            if (inf.data.user_data.get(['task_id'])) {
                taskStop(bot, inf.data.chat_id, inf.data.user_id)
            } else {
                bot.api.sendMessage(
                    inf.data.chat_id,
                    OPT.text.taskAlreadyStopped
                )
            }
        },
        {
            filter: 'public',
            description: OPT.commands.stop.description,
        },
        {
            application_name: OPT.name,
        }
    )
    // bot.inlineKYBD.add() TODO:
    bot.command.add(
        OPT.commands.status.str,
        (inf) => {
            const userData = inf.data.user_data
            const msg_a = [
                `${OPT.text.lastUpdate}${moment(
                    userData.get(['task_update_at']) || 0
                )
                    .tz(OPT.momentTimezone)
                    .fromNow()}`,
            ]
            if (userData.get(['task_id'])) {
                msg_a.push(
                    `${OPT.text.lastStart}${moment(
                        userData.get(['task_start_at']) || 0
                    )
                        .tz(OPT.momentTimezone)
                        .fromNow()}`
                )
            } else {
                msg_a.push(
                    `${OPT.text.lastStop}${moment(
                        userData.get(['task_stop_at']) || 0
                    )
                        .tz(OPT.momentTimezone)
                        .fromNow()}`
                )
            }
            bot.api.sendMessage(inf.data.chat_id, msg_a.join('\n'), {
                parse_mode: 'MarkdownV2',
            })
        },
        {
            filter: 'public',
            description: OPT.commands.status.description,
        },
        {
            application_name: OPT.name,
        }
    )
    bot.command.add(
        OPT.commands.debug_resend.str,
        async (inf) => {
            const userData = inf.data.user_data
            const args = inf.arguments
            const count = args[1]
            userData.set(count, ['task_resend'])
            taskExec(bot, inf.data.chat_id, inf.data.user_id)
            bot.api.sendMessage(
                inf.data.chat_id,
                `${stringFormatter(OPT.text.debug_resend, [count])}`
            )
        },
        {
            filter: 'public',
            description: OPT.commands.debug_resend.description,
            argument_check: [
                {
                    type: 'integer',
                    default_value: 1,
                },
            ],
            // argument_error_function: () => {},
        },
        {
            application_name: OPT.name,
        }
    )
    bot.messageAction.add(
        OPT.messageActions.uploadRules.name,
        async (inf) => {
            const msg = inf.message
            let errMsg: string
            let rules: any
            try {
                rules = JSON.parse(msg.text)
                if (Array.isArray(rules)) {
                    const errs = cardRulesTest(rules)
                    if (errs.length) {
                        errMsg = OPT.text.ruleLoadErr
                        errMsg += errs.join('\n')
                    }
                } else {
                    errMsg = OPT.text.ruleFormatErr
                }
            } catch (e) {
                if (e instanceof SyntaxError) {
                    errMsg = OPT.text.ruleParseErr
                }
            }
            if (typeof errMsg == 'undefined') {
                const userData = inf.data.user_data
                userData.set(msg.text, ['rules'])
                bot.api.sendMessage(msg.chat.id, OPT.text.ruleUploadSuccess)
                return true
            } else {
                errMsg += '\n'
                errMsg += stringFormatter(OPT.text.ruleUploadFailed, [
                    OPT.commands.upload_rules.str,
                ])
                bot.api.sendMessage(msg.chat.id, errMsg)
            }
            return false
        },
        {
            max_exec_counts: 1,
            pass_to_command: false,
            pass_to_other_action: false,
        },
        {
            application_name: OPT.name,
        }
    )
    bot.command.add(
        OPT.commands.upload_rules.str,
        async (inf) => {
            const msg = inf.message
            bot.api.sendMessage(msg.chat.id, OPT.text.ruleUploadListener)
            bot.messageAction.new(
                OPT.messageActions.uploadRules.name,
                msg.chat.id,
                msg.from.id
            )
        },
        {
            filter: 'public',
            description: OPT.commands.upload_rules.description,
        },
        {
            application_name: OPT.name,
        }
    )
    bot.event.on('ready', () => {
        if (OPT.hookCliOptions.enable) {
            const cli = new Client({
                user: OPT.hookCliOptions.user,
                address: OPT.hookCliOptions.address,
                port: OPT.hookCliOptions.port,
                password: OPT.hookCliOptions.password,
            })
            cli.start()
            cli.on('request', (o) => {
                //
            })
            cli.action.on(OPT.hookCliOptions.action, (data) => {
                const _data = { ...data } as {
                    request: {
                        body: {
                            [key: string]: string | number | boolean | null
                        }
                        headers: {
                            [key: string]: string
                        }
                    }
                }
                const sessdata = _data.request.body['sessdata']
                const userId = _data.request.body['user_id']
                if (typeof userId !== 'number') {
                    return
                }
                const userData = bot.application.get(OPT.name).dataMan({
                    user_id: userId,
                })
                userData.set(sessdata, ['sessdata'])
                bot.api.sendMessage(
                    userId, // TODO: replace with chat id
                    OPT.text.fetchSuccess,
                    {
                        parse_mode: 'MarkdownV2',
                    }
                )
                if (userData.get(['task_id'])) {
                    return
                } else {
                    taskStart(bot, userId, userId)
                    // TODO: replace with chat id
                }
            })
        }
    })
}

export { bilibiliNotif as run, OPT as options }

type Optional<T extends object> = {
    [key in keyof T]?: T[key] extends object ? Optional<T[key]> : T[key]
}

const assign = <T extends object>(
    target: Required<T>,
    input: Optional<T>
): void => {
    for (const key of Object.keys(target)) {
        const _val = input[key]
        if (typeof _val != 'undefined') {
            if (_val == null) {
                target[key] = null
                continue
            }
            if (Array.isArray(_val)) {
                for (const i in target[key]) {
                    const __val = _val[i]
                    if (typeof __val == 'undefined') continue
                    if (
                        typeof target[key][i] == 'object' &&
                        !Array.isArray(target) &&
                        target != null
                    ) {
                        assign(target[key][i], _val[i])
                    } else {
                        target[key][i] = __val
                    }
                }
                continue
            }
            if (typeof _val == 'object' && _val != {}) {
                assign(target[key], _val)
                continue
            }
            target[key] = _val
            continue
        }
    }
}
