#!/bin/sh
cd /Users/misiak/Desktop/2021/threejs-vr-hls-stream/room/ &&
npm run build &&

rsync -av -e ssh --exclude='*.map' /Users/misiak/Desktop/2021/threejs-vr-hls-stream/room/dist/ root@sylwester.tech:/var/www/workwork.fun/vr/room
