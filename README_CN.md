<p align="center" style="align:center;height:250px;"><img width="250" src="https://github.com/MamoruDS/bilibili-notify-telegram-bot/raw/master/res/bilibili-noti-bot.png" alt="logo"></p>

# bilibili notification telegram bot

一个基于哔哩哔哩网页版 API 的转发消息推送的 Telegram bot.

[English README](README.md)

## 如何使用

```shell
npm i bilibili-notify-telegram-bot
```

通过[telegram_bot_utils](https://github.com/MamoruDS/telegram_bot_utils)部署应用

````javascript
const bot = BotUtils.bots.get('yourbot') // telegram-bot-utils instance

bilibiliNotif.run(bot, {
        momentLocale: 'zh-cn',
        text: {
            titleSESSDATAMissing: '*\\[ SESSDATA 不存在 \\]*',
            titleSESSDATAinvalid: '*\\[ SESSDATA 已过期 \\]*',
            titleARGUMENTMissing: '*\\[ 缺少参数 \\]*',
            updateSESSDATAWithCmd:
                '1⃣️ 使用命令\n${_}\n更新`SESSDATA`, 阅读[文档](https://github.com/MamoruDS/bilibili-notify-telegram-bot/blob/master/README.md#how-to-get-cookie)了解如何手动获取`SESSDATA`',
            updateSESSDATAWithScript:
                '2⃣️ 通过`QuantumultX`脚本自动抓取`SESSDATA` \\(仅限iOS\\), 通过命令\n${_}\n获取脚本',
            updateFormat: [
                '更新命令格式示例:',
                '```',
                '${_} 403b3c2a%bC1601334589%2C9c817*51',
                '```',
            ].join('\n'),
            fetchSuccess: '自动获取成功 🎉 `SESSDATA`已更新',
            lastUpdate: '最后更新于: ',
            lastStart: '当前开始于: ',
            lastStop: '最后停止于: ',
            userMention: '本脚本仅适用于用户: ',
            version: '版本: ',
            taskAlreadyStarted: '任务已经在运行',
            taskAlreadyStopped: '任务没有在运行',
            taskStarted: '任务已经启动',
            taskStopped: '任务已经停止',
            noParser: '无法解析类型为${_}的动态消息',
            tag1: '转发消息',
            tag2: '发布动态',
            tag8: '投稿视频',
            tag512: '番剧更新',
            episode: '第${_}话',
            episodeUnknown: '未知',
        },
    }
})

````

## 如何获取 Cookie

使用该 API 需要提供名为`SESSDATA`的 cookie, 为`HttpOnly` cookie, 无法通过 Javascript 获取, 故需要借助浏览器的调试工具获取. 更多关于`HttpOnly`的详情请查看此[页面](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Cookies#Cookie%E7%9A%84Secure_%E5%92%8CHttpOnly_%E6%A0%87%E8%AE%B0).

### 通过浏览器查看网页 Cookie 获取

-   访问网页版[哔哩哔哩](https://www.bilibili.com)后登录你的账号;
-   查看域名`bilibili.com`下的 Cookie, 具体方法可通过搜索`浏览器 查看 cookie`获取;
-   查看名称为`SESSDATA`的 Cookie 项, 复制内容到剪贴板
    ```
    403b3c2a%bC1601334589%2C9c817*51
    ```

### 通过浏览器发送请求获取

-   访问网页版[哔哩哔哩](https://www.bilibili.com)后登录你的账号;
-   打开浏览器调试工具的**Network**面板;
-   在打开调试工具页面直接访问获取动态的 API [链接](https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=0&type=512);
-   在**Network**面板中找到名称为`dynamic_new`开头的请求, 查看详情;
-   从`Request Headers`或`Request`的`Cookie`中找到类似如下的字段, 复制到剪贴板
    ```
    SESSDATA=403b3c2a%bC1601334589%2C9c817*51;
    ```

### 通过 MITM 工具

## License

MIT © MamoruDS
