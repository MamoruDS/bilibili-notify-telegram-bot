const TypeReserved = ['add', 'or']

type Rule = {
    type: string
    list?: Rule[]
    value?: any
    comment?: string
}
type RuleFn = (input: any, value?: any) => boolean
type RuleFnMap = {
    [type: string]: RuleFn
}

class RuleSet {
    private ruleFnMap: RuleFnMap
    private rules: Rule
    constructor(fnMap: RuleFnMap) {
        this.ruleFnMap = fnMap
    }
    private _check(ruleSet: Rule): { err: boolean; errMsg: string } {
        const res = { err: false, errMsg: '' }
        const err = (msg: string) => {
            res.err = true
            res.errMsg = msg
            return res
        }
        const type = ruleSet['type'] || ''
        if (TypeReserved.indexOf(type) !== -1) {
            if (Array.isArray(ruleSet['list'])) {
                for (const i of ruleSet['list']) {
                    const _res = this._check(i)
                    if (_res.err) err(_res.errMsg)
                }
            } else {
                err(`list not exist under reserved type rule`)
            }
        } else if (Object.keys(this.ruleFnMap).indexOf(type) !== -1) {
            // try {
            //     this.ruleFnMap[type]('random')
            // } catch (e) {
            //     err(e)
            // }
        } else {
            err(`unbind type: '${type}'`)
        }
        return res
    }
    public load(ruleSet: Rule): void {
        const c = this._check(ruleSet)
        if (c.err) {
            throw new Error(c.errMsg)
        }
        this.rules = ruleSet
    }
    // return: matched - true
    private _test(rule: Rule, input: string): number {
        if (TypeReserved.indexOf(rule.type) !== -1) {
            let match: number = undefined
            for (const r of rule['list']) {
                const m = this._test(r, input)
                if (typeof match == 'undefined') {
                    match = m
                } else {
                    if (rule.type == 'or') {
                        match = match | m
                    }
                    if (rule.type == 'and') {
                        match = match & m
                    }
                }
            }
            return match
        } else {
            return this.ruleFnMap[rule.type](input, rule.value) ? 1 : 0
        }
    }
    public test(input: string): boolean {
        const match: boolean = this._test(this.rules, input) == 1 ? true : false
        return match
    }
}

export { Rule, RuleFn, RuleFnMap }
export { RuleSet }
