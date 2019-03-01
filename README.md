<p align="center" style="align:center;height:250px;"><img width="250" src="https://github.com/MamoruDS/bilibili-notify-telegram-bot/raw/master/res/bilibili-noti-bot.png" alt="logo"></p>

# bilibili notification telegram bot
A Telegram bilibili-noti forwarding bot base on bilibili's web API.  

[中文README](README_CN.md)

## How to use
### via node
```shell
git clone https://github.com/MamoruDS/bilibili-notify-telegram-bot.git && cd bilibili-notify-telegram-bot
npm install
npm run compile
npm run start
```
### via docker
Use our image on docker store. [Here](https://store.docker.com/community/images/mamoruio/bilibili-noti-bot) is the image's page.
```shell
docker pull mamoruio/bilibili-noti-bot:latest
docker run -d -t --name bilibili-noti-bot -v /mnt/cfg:/app/cfg mamoruio/bilibili-noti-bot:latest
```
#### build from Dockerfile
```
git clone https://github.com/MamoruDS/bilibili-notify-telegram-bot.git && cd bilibili-notify-telegram-bot
docker build -t yourname/bilibili-noti-bot .
```

## How to get Cookie
### via web browser
We need to provide a cookie called `SESSDATA` for using this API. Since this `SESSDATA` is a `HttpOnly` cookie, it can't get by running Javascript in browser console, so we need help with other DevTool.  
- Visit [bilibili](https://www.bilibili.com)'s home page and sign in;
- Open **Network** panel in DevTools of browser on the page;
- Send a request to bilibili's API by [url](https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=0&type=512);
- Find request's name start with `dynamic_new` in **Network** panel, check the request detail;
- Find a string similar to the following which can be found in `Cookie` of `Request` or `Request Headers`, then copy to your clipboard;
    ```
    SESSDATA=ea56c6%34C14155%C46a257;
    ```
- Send set cookie command with your `SESSDATA` info;
    ```
    /set_cookie SESSDATA=ea56c6%34C14155%C46a257;
    ```
- Wait for bot's response.
### via MitM
