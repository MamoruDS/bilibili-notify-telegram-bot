FROM node:11-alpine
RUN apk add --no-cache git

ENV conf /app/cfg/conf.json
ENV interval_sec 50
ENV timeout 1200
ENV timeout-notis 36000
WORKDIR /app

RUN git clone https://github.com/MamoruDS/bilibili-notify-telegram-bot.git .
RUN npm install && mkdir cfg
RUN npm run compile

CMD npm run start -- -f ${conf} -i ${interval_sec} -t ${timeout} --timeout-notis ${timeout-notis}