const fs = require('fs')
const axios = require('axios')
const schedule = require('node-schedule')

let conf = undefined

if (fs.existsSync('conf.json')) {
    conf = readConf()
    // writeConf(conf)
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

function getNotification(cookies, type) {
    let data = {}
    axios.request('https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new', {
            // timeout: 1000,
            params: {
                uid: 0,
                type: type,
            },
            headers: {
                Cookie: cookies,
            },
            proxy: false
        })
        .then(function (res) {
            data = res.data
            console.log('success')
        })
        .catch(function (err) {
            console.log(err)
        })
    return data
}

function cardParse(card) {
    card = card.replace(new RegExp('\\\\', 'g'), '')
    card = card.replace(new RegExp('\\"', 'g'), '"')
    card = JSON.parse(card)
    return card
}

// var j = schedule.scheduleJob('30 * * * * *', function () {
    // console.log(Date.now())
    let user_info = conf['user_info']
    for (user in user_info) {
        user_cookie = user_info[user].cookie
        user_notify = user_info[user].notify
        user_last_notify_ts = user_info[user].notify_ts
        for (let i = 0; i < user_notify.length; i++) {
            let res_data = getNotification(user_cookie, user_notify[i])
            let notis = getLastNotis(res_data.data.cards, user_last_notify_ts[i])
        }
    }
// })