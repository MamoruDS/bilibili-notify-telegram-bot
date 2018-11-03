FROM node:11-alpine
RUN apk add --no-cache git

ENV conf /app/cfg/conf.json
WORKDIR /app
RUN git clone https://github.com/MamoruDS/bilibili-notify-telegram-bot.git .
RUN npm install && mkdir cfg

CMD node main.js -f $conf