<p align="center" style="align:center;height:250px;"><img width="250" src="https://github.com/MamoruDS/bilibili-notify-telegram-bot/raw/master/res/bilibili-noti-bot.png" alt="logo"></p>

# bilibili notification telegram bot
一个基于bilibili网页版API的转发消息推送的Telegram bot。 

[English README](README.md)
## 如何获取Cookie
使用该API需要提供名为`SESSDATA`的cookie，为`HttpOnly` cookie，无法通过Javascript获取，故需要借助浏览器的调试工具获取。更多关于`HttpOnly`的详情请查看此[页面](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Cookies#Cookie%E7%9A%84Secure_%E5%92%8CHttpOnly_%E6%A0%87%E8%AE%B0)。  
- 访问网页版[bilibili](https://www.bilibili.com)后登录你的账号；
- 打开浏览器调试工具的**Network**面板；
- 在打开调试工具页面直接访问获取动态的API [链接](https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=0&type=512)；
- 在**Network**面板中找到名称为`dynamic_new`开头的请求，查看详情；
- 从`Request Headers`或`Request`的`Cookie`中找到类似如下的字段，复制到剪贴板；
    ```
    SESSDATA=ea56c6%34C14155%C46a257;
    ```
- 向bot发送指令；
    ```
    /setCookie SESSDATA=ea56c6%34C14155%C46a257;
    ```
- 等待bot返回cookie更新成功的消息。