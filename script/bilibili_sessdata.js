/**
 * ^https:\/\/api\.vc\.bilibili\.com\/? url script-request-header bilibili_sessdata_getter.js
 */

const msps = mspUtils()

const user_id = 0
const version = '0.2.10'

const _rres = new RegExp(/SESSDATA=([^;]+)/).exec($request.headers['Cookie'])
if (_rres) {
    const sessdata = _rres[1]
    if (sessdata != msps.getVal('bilibili_cookie_sessdata')) {
        const options = {
            url: 'https://cchook.youraddress',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                _cc_hook_user_id: 'USERID',
                _cc_hook_action_name: 'bilibili_sessdata',
                sessdata: sessdata,
                user_id: user_id,
            }),
        }
        console.log('---------------------------------')
        console.log('> BILIBILI SESSDATA GETTER STARTED')
        console.log('  VERSION: ' + version)
        msps.setVal('bilibili_cookie_sessdata', sessdata)
        $task.fetch(options).then(
            (response) => {
                $notify(
                    'SESSDATA FETCH SUCCESS',
                    sessdata,
                    'return telegram to continue'
                )
            },
            (reason) => {
                console.log('> Post to hook server failed.')
                console.error(reason.error)
            }
        )
    } else {
        //
    }
}

function mspUtils() {
    _isQuanX = typeof $task != 'undefined'
    _isSurge = typeof $httpClient != 'undefined'

    const getVal = (key) => {
        if (_isQuanX) return $prefs.valueForKey(key)
        if (_isSurge) return $persistentStore.read(key)
    }
    const setVal = (key, value) => {
        if (_isQuanX) return $prefs.setValueForKey(value, key)
        if (_isSurge) return $persistentStore.write(value, key)
    }
    const notify = (title, subtitle, message) => {
        if (_isQuanX) $notify(title, subtitle, message)
        if (_isSurge) $notification.post(title, subtitle, message)
    }
    const done = () => {
        if (_isQuanX || _isSurge) $done()
    }
    return { getVal, setVal, notify }
}
