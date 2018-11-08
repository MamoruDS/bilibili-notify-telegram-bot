import beautify from 'js-beautify'
import colors from 'colors'
import moment from 'moment'

export const AxiosErrHandle = (err, req_msg = 'sending request') => {
    let err_msg = undefined
    if (err.response) {
        err_msg = 'response.data: \n'.white + beautify(JSON.stringify(err.response.data)).dim + '\n' +
            'response.status: '.white + beautify(JSON.stringify(err.response.status)).dim
        // 'response.headers: \n'.white + beautify(JSON.stringify(err.response.headers)).dim + '\n'
    } else {
        err_msg = 'axios err-message: '.white + err.message.dim
    }

    let msg = 'axios-error when ' + req_msg.bold + ', ERRMSG:\n' + err_msg
    logGen(msg, 'error')
}


export const logGen = (info, type, display = true) => {
    let typeStr = ''
    switch (type) {
        case 'info':
            typeStr = 'INFO'.green.bold
            break
        case 'normal':
            typeStr = 'NORMAL'.cyan.bold
            break
        case 'user':
            typeStr = 'USER'.blue.bold
            break
        case 'warn':
            typeStr = 'WARN'.yellow.bold
            break
        case 'error':
            typeStr = 'ERROR'.red.bold
            break
        default:
            typeStr = 'UNKNOWN'.grey.bold
    }
    if (display) {
        console.log(`[${typeStr}] ${moment().format('YY-MM-DD_HH:mm:ss_X').white} ${info.bold}`)
    }
}