<p align="center" style="align:center;height:250px;"><img width="250" src="https://github.com/MamoruDS/bilibili-notify-telegram-bot/raw/master/res/bilibili-noti-bot.png" alt="logo"></p>

# bilibili notification telegram bot
一个基于哔哩哔哩网页版API的转发消息推送的Telegram bot.  

[English README](README.md)

## 功能
- 转发哔哩哔哩的部分动态推送包括：
    + 关注UP 投稿视频
    + 关注UP 发布动态
    + 关注UP 投稿小视频
    + 追番更新
- 通过HashTag标记不同类别

## 如何部署
### 通过Node
```shell
git clone https://github.com/MamoruDS/bilibili-notify-telegram-bot.git && cd bilibili-notify-telegram-bot
npm install
npm run compile
npm run start
```
### 通过Docker镜像
Use our image on docker store. [Here](https://store.docker.com/community/images/mamoruio/bilibili-noti-bot) is the image's page.
```shell
docker pull mamoruio/bilibili-noti-bot:latest
docker run -d -t --name bilibili-noti-bot -v /mnt/cfg:/app/cfg mamoruio/bilibili-noti-bot:latest
```
#### Build Dockerfile
```
git clone https://github.com/MamoruDS/bilibili-notify-telegram-bot.git && cd bilibili-notify-telegram-bot
build -t yourname/bilibili-noti-bot .
```

## 如何使用Bot
### 启用Bot并初始化/重置用户资料
- 向bot发送下述指令
    ```
    /start
    ```
- 等待bot返回cookie过期的消息
### 向Bot发送你的Cookie信息
[查看如何获取Cookie](#如何获取cookie)
- 向bot发送下述指令
    ```
    /set_cookie f5d83fb1%2C1548472847%2C9127a0c1
    ```
    或
    ```
    /set_cookie SESSDATA=f5d83fb1%2C1548472847%2C9127a0c1;
    ```
- 等待bot返回cookie更新成功的消息

## 如何获取Cookie
使用该API需要提供名为`SESSDATA`的cookie, 为`HttpOnly` cookie, 无法通过Javascript获取, 故需要借助浏览器的调试工具获取. 更多关于`HttpOnly`的详情请查看此[页面](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Cookies#Cookie%E7%9A%84Secure_%E5%92%8CHttpOnly_%E6%A0%87%E8%AE%B0). 
### 通过浏览器查看网页Cookie获取
- 访问网页版[哔哩哔哩](https://www.bilibili.com)后登录你的账号;
- 查看域名`bilibili.com`下的Cookie, 具体方法可通过搜索`浏览器 查看 cookie`获取;
- 查看名字为`SESSDATA`的Cookie项, 复制内容到剪贴板
    ```
    f5d83fb1%2C1548472847%2C9127a0c1
    ```
### 通过浏览器发送请求获取
- 访问网页版[哔哩哔哩](https://www.bilibili.com)后登录你的账号;
- 打开浏览器调试工具的**Network**面板;
- 在打开调试工具页面直接访问获取动态的API [链接](https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=0&type=512);
- 在**Network**面板中找到名称为`dynamic_new`开头的请求, 查看详情;
- 从`Request Headers`或`Request`的`Cookie`中找到类似如下的字段, 复制到剪贴板
    ```
    SESSDATA=f5d83fb1%2C1548472847%2C9127a0c1;
    ```
