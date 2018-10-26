const fs = require('fs')
const axios = require('axios')
const schedule = require('node-schedule')

let conf = undefined

if (fs.existsSync('conf.json')) {
    conf = readConf()
    writeConf(conf)
} else {
    writeConf()
}

let tg_bot_api = 'https://api.telegram.org/bot' + conf.bot_token

// axios.request(tg_bot_api +
//         '/sendMessage', {
//             // timeout: 1000,
//             params: {
//                 chat_id: 1,
//                 text: "https://www.bilibili.com/bangumi/play/ep251079",
//             },
//             proxy: false
//         })
//     .then(function (res) {
//         console.log(res.data)
//     })
//     .catch(function (err) {
//         console.log(err)
//     })

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

var j = schedule.scheduleJob('30 * * * * *', function () {
    console.log(Date.now())
})