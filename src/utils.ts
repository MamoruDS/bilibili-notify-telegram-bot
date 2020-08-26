export const safeMDv2 = (input: string): string => {
    // https://core.telegram.org/bots/api#markdownv2-style
    return input.replace(
        /(?<!\\)[\_\*\[\]\(\)\~\`\>\#\+\-\=\|\{\}\.\!]/gm,
        (match, ...M) => {
            return '\\' + match
        }
    )
}

export const safeTag = (input: string, nonMD?: boolean): string => {
    input = input.replace(/[\ |\.|\-|\|:|：]/gm, '_')
    input = input.replace(/[\uff00-\uffff|\u0000-\u00ff]/g, (m: string) => {
        return /\w/.exec(m) == null ? '' : m
    })
    const output = '#' + input
    return nonMD ? output : safeMDv2(output)
}

export const stringFormatter = (
    input: string,
    params: { [key: string]: string } | string[]
): string => {
    return input.replace(/\${([^}]+)}/gm, (match, ...M): string => {
        if (Array.isArray(params)) {
            return params.shift()
        } else {
            return params[M[0]]
        }
    })
}

export const wait = async (timeout: number): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, timeout)
    })
}
