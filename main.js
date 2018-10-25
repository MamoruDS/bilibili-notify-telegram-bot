const fs = require('fs')

if (fs.existsSync('conf.json')) {
    let user_info = readConf()
    console.log(typeof user_info)
    writeConf(user_info)
} else {
    writeConf({})
}

function readConf() {
    return JSON.parse(fs.readFileSync('conf.json', 'utf8'))
}

function writeConf(data) {
    data = JSON.stringify(data)
    fs.writeFileSync('conf.json', data, 'utf8')
}