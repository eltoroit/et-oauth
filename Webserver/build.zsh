#!/bin/zsh
clear
cp .env ../OAuth.env
npm run build:client
# npm run build:client 
# heroku local web=1
npm run ELTOROIT_SERVE
# npm run ELTOROIT_DEBUG
