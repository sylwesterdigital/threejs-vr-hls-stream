#!/bin/sh
cd /Users/misiak/Desktop/2021/vrspace/cinema/ &&
npm run build &&

rsync -av -e ssh --exclude='*.map' /Users/misiak/Desktop/2021/vrspace/cinema/dist/ root@sylwester.tech:/var/www/workwork.fun/vr/cinema
