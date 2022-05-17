"use strict";
const fs = require('fs');
const ejs = require('ejs');
const cors = require('cors');
const path = require('path');
const qs = require(`querystring`);
const express = require('express');

module.exports = class WebServer {
    app = null;
    util = null;
    redis = null;
    config = null;
    workQueue = null;
    lwcFolder = './dist';

    constructor({ util }) {
        this.util = util;
        this.util.webserver = this;
    }

    initialize(config) {
        console.log(JSON.stringify(config));
        this.util.logInfo({ message: 'Creating Web server...' });
        this.config = config;
        this.app = express();
        this.app.set('view engine', 'ejs');
        this.app.set('views', path.resolve('src/views'));
        // this.lwcFolder = path.resolve(this.lwcFolder);

        this.makeServer();
        this.app.use(express.json());
        this.app.use(cors(this._CORS()));
        this.createRoutes();

        this.app.use(express.static(this.lwcFolder));
        this.util.logInfo({ message: `HTTPS web server fully configured (${this.lwcFolder})` });
    }

    createRoutes() {
        this.app.get('/home', this.renderLWC.bind(this));
        this.app.get('/jwt', this.oauthJWT.bind(this));
        this.app.post('/getUser', this.getUser.bind(this));
        this.app.get('/callback', this.callback.bind(this));
        this.app.get('/settings', this.getSettings.bind(this));
    }

    async renderLWC(req, res) {
        res.sendFile(path.resolve(this.lwcFolder, 'index.html'));
    }

    async callback(req, res) {
        let code = req.query.code;
        if (code) {
            let request = {
                method: `POST`,
                url: `${process.env.OAUTH_LOGIN_URL}/services/oauth2/token`,
                contentType: `FORM`,
                postData: qs.stringify({
                    grant_type: `authorization_code`,
                    code,
                    client_id: process.env.OAUTH_CONSUMER_KEY,
                    client_secret: process.env.OAUTH_CONSUMER_SECRET,
                    redirect_uri: process.env.OAUTH_CALLBACK
                })
            };
            this.util.makeCallout(request)
                .then(response => {
                    res.render("WebServerCallback", { data: JSON.stringify(response.body, null, 2) });
                })
                .catch(err => {
                    this.util.logError({ message: "Error obtaining Access Token", value: err })
                    res.render("WebServerCallback", { data: JSON.stringify(err, null, 2) });
                })
        } else {
            res.render("UserAgentCallback", { data: "NOTHING" });
        }
    }

    async oauthJWT(req, res) {
        let privateKey = null;
        if (this.config.isLocalhost) {
            privateKey = fs.readFileSync(path.resolve('../Cert', 'private.key')).toString('utf8');
        } else {
            privateKey = process.env.JWT_PRIVATE_JEY;
        }
        privateKey = privateKey.trim();
        let data = await this.util.oauthJWT.authorize({ clientId: process.env.OAUTH_CONSUMER_KEY, username: process.env.OAUTH_UN, audience: process.env.OAUTH_AUDIENCE, privateKey });
        res.json(data);
    }

    async getUser(req, res) {
        let data = req.body;
        this.util.makeCallout({ method: "GET", url: data.id, authorization: `Bearer ${data.access_token}` })
            .then(results => res.json(results))
            .catch(err => res.json(err))
    }

    async getSettings(req, res) {
        let output = {
            UN: { label: "Username", value: process.env.OAUTH_UN },
            PW: { label: "Password", value: process.env.OAUTH_PW },
            LOGIN_URL: { label: "Login Url", value: process.env.OAUTH_LOGIN_URL },
            CONSUMER_KEY: { label: "Consumer Key", value: process.env.OAUTH_CONSUMER_KEY },
            CONSUMER_SECRET: { label: "Consumer Secret", value: process.env.OAUTH_CONSUMER_SECRET },
            // SECURITY_TOKEN: { label: "Security Token", value: process.env.OAUTH_SECURITY_TOKEN },
            CALLBACK: { label: "Callback", value: process.env.OAUTH_CALLBACK },
        };
        res.status(200).json(output)
    }

    // #region WEB SERVER
    _CORS() {
        return {
            origin: (origin, callback, ...other) => {
                // if (origin) {
                //     if (origin.endsWith(".lightning.force.com")) {
                //         debugger;
                //         // Any salesforce org, which is not cool
                //         callback(null, true);
                //     } else if (origin.endsWith(".herokuapp.com")) {
                //         // This is any heroku app, which is not cool!
                //         debugger;
                //         callback(null, true);
                //     } else if (origin.endsWith("localhost")) {
                //         debugger;
                //         callback(null, true);
                //     } else {
                //         debugger;
                //         callback(new Error('Not allowed by CORS'));
                //     }
                // } else {
                //     debugger;
                //     // No CORS requested, just accept it :-)
                //     callback(null, true);
                // }
                //Accept whatever!
                callback(null, true);
            },
            methods: ['GET', 'POST']
        };
    }

    makeServer() {
        if (this.config.isLocalhost) {
            const serverHTTPS = require('https').createServer(
                {
                    key: fs.readFileSync(
                        path.resolve('../Cert', 'private.key')
                    ),
                    cert: fs.readFileSync(
                        path.resolve('../Cert', 'public.crt')
                    )
                },
                this.app
            );
            serverHTTPS.listen(this.config.HTTPS_PORT, () => {
                // Keep this icon, so not doing a this.util.logInfo
                console.log(
                    `✅ HTTPS web server initialized: https://localhost:${this.config.HTTPS_PORT}/`
                );
            });
        } else {
            this.app.listen(process.env.PORT, () => console.log(`✅   - Heroku server created`));
        }
    }
    // #endregion WEB SERVER
}