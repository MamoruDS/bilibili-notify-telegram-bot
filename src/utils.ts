export const safeMDv2 = (input: string): string => {
    // https://core.telegram.org/bots/api#markdownv2-style
    return input.replace(
        /(?<!\\)[\_\*\[\]\(\)\~\`\>\#\+\-\=\|\{\}\.\!]/gm,
        (match, ...M) => {
            return '\\' + match
        }
    )
}

export const safeTag = (input: string): string => {
    input = input.replace(/[\ |\.|\-|\|]/gm, '_')
    input = input.replace(
        /[\ |\!|\#|\$|\&|\'|\"|\(|\)|\*|\+|\,|\/|\\|\:|\;|\=|\?|\@\[|\]|\%|\^|\！|\？|\’|\‘|\“|\”|\，|\。|\（|\）|\【|\】]/gm,
        ''
    )
    return '#' + input
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
