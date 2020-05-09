process.env.NTBA_FIX_319 = 'true'
process.env.NTBA_FIX_350 = 'true'

const BotUtils = require('telegram-bot-utils')
const BotAPI = require('node-telegram-bot-api')

const bilibiliNotif = require('../dist/main')

BotUtils.options.botAPIConstructor = BotAPI

const bot = BotUtils.bots.add('bilibili_notify_bot', {
    api: {
        token: process.env.BOT_TOKEN,
        options: {
            polling: true,
        },
    },
})

bilibiliNotif.run(bot)
