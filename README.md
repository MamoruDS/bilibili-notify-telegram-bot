<p align="center" style="align:center;height:250px;"><img width="250" src="https://github.com/MamoruDS/bilibili-notify-telegram-bot/raw/master/res/bilibili-noti-bot.png" alt="logo"></p>

# bilibili notification telegram bot

A Telegram bilibili-noti forwarding bot base on bilibili's web API.

[中文 README](README_CN.md)

## Usage

```shell
npm i bilibili-notify-telegram-bot
```

Deploy with [telegram_bot_utils](https://github.com/MamoruDS/telegram_bot_utils)

```javascript
const bot = BotUtils.bots.get('yourbot') // telegram-bot-utils instance

bilibiliNotif.run(bot, {
        scriptPath: './script/bilibili_script.js',
        hookCliOptions: {
            enable: true,
            user: 'USER-ID',
            address: 'http://hook.server.com',
            port: 8030,
            password: 'password',
        },
        momentLocale: 'zh-cn',
    }
})

```

## How to get Cookie

### via web browser

We need to provide a cookie called `SESSDATA` for using this API. Since this `SESSDATA` is a `HttpOnly` cookie, it can't get by running Javascript in browser console, so we need help with other DevTool.

-   Visit [bilibili](https://www.bilibili.com)'s home page and sign in;
-   Open **Network** panel in DevTools of browser on the page;
-   Send a request to bilibili's API by [url](https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=0&type=512);
-   Find request's name start with `dynamic_new` in **Network** panel, check the request detail;
-   Find a string similar to the following which can be found in `Cookie` of `Request` or `Request Headers`, then copy to your clipboard;
    ```
    SESSDATA=403b3c2a%bC1601334589%2C9c817*51;
    ```
-   Send set cookie command with your `SESSDATA` info;
    ```
    /bilibili_sessdata_update 403b3c2a%bC1601334589%2C9c817*51
    ```
-   Wait for bot's response.

### via MitM tools
