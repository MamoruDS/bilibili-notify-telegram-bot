import * as fs from 'fs'
import * as path from 'path'

import { OPT as options } from './main'

export const save2file = (
    content: string | object,
    filename?: string
): void => {
    const _logPath = options.logPath
    const _extname = typeof content == 'string' ? 'txt' : 'json'
    if (_extname == 'json') content = JSON.stringify(content)
    filename = filename ? filename : `logs_${Date.now()}.${_extname}`
    if (!fs.existsSync(_logPath)) {
        fs.mkdirSync(_logPath)
    } else if (!fs.lstatSync(_logPath).isDirectory()) {
        process.exit(1)
    }
    fs.writeFileSync(path.join(_logPath, filename), content, {
        encoding: 'utf-8',
    })
}
