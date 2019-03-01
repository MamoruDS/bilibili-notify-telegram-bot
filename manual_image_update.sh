#!/bin/sh
SCID=$(git rev-parse --short HEAD)
echo "removing docker image mamoruio/bilibili-noti-bot:latest ..."
docker image rm mamoruio/bilibili-noti-bot:latest
echo "\nbuilding docker image mamoruio/bilibili-noti-bot:$SCID ..."
docker build -f docker/Dockerfile -t mamoruio/bilibili-noti-bot:$SCID --build-arg CACHE_DATE=$(date +%s) .
echo "\npushing docker image mamoruio/bilibili-noti-bot:$SCID as latest image to docker hub ..."
docker tag mamoruio/bilibili-noti-bot:$SCID mamoruio/bilibili-noti-bot:latest
docker push mamoruio/bilibili-noti-bot:$SCID
docker push mamoruio/bilibili-noti-bot:latest