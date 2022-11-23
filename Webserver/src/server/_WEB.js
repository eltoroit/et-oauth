"use strict";
require('dotenv').config();
const UTIL = require('./Util');
const OAUTH_JWT = require('./OAuth_JWT');
const WEB_SERVER = require('./WebServer');

const HTTP_PORT = process.env.PORT || 4000;
const HTTPS_PORT = Number(HTTP_PORT) + 1;

async function intializeServer() {
    const util = new UTIL();
    const oauthJWT = new OAUTH_JWT({ util });
    const webserver = new WEB_SERVER({ util });

    await webserver.initialize({ isLocalhost: process.env.SERVER === 'Local', HTTPS_PORT });
}
intializeServer();
