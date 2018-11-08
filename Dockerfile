FROM node:11-alpine
# RUN apk add --no-cache git

ENV conf /app/cfg/conf.json
ENV interval_sec 30
ENV timeout 300
WORKDIR /app
COPY package.json ./
# RUN git clone https://github.com/MamoruDS/bilibili-notify-telegram-bot.git .
RUN npm install && mkdir cfg
COPY . .
RUN npm run compile

CMD npm run start -- -f ${conf} -i ${interval_sec} -t ${timeout}