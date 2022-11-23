import { LightningElement, api } from 'lwc';

export default class Callback extends LightningElement {
    _settings = {};
    _actualURL = null;

    URL = "";
    newTab = true;
    oauthData = {};
    forceLogin = true;
    forceConsent = true;
    keys = ["UN", "PW"];

    @api
    get settings() {
        return this._settings;
    }
    set settings(value) {
        this._settings = value;
        this._makeURL();
        this._showData();
    }

    @api
    get actualUrl() {
        return this._actualURL;
    }
    set actualUrl(actualUrl) {
        this._actualURL = actualUrl;
    }

    onLoginClick() {
        this.oauthData = {
            data: null,
            OpenID: null
        };
        localStorage.removeItem("OAuthCallback");
        setTimeout(() => {
            if (this.newTab) {
                window.open(this.URL, "_blank");
            } else {
                window.location = this.URL;
            }
        }, 0);
    }

    onLoginChange(event) {
        this.forceLogin = event.target.checked;
        this._makeURL();
    }

    onConsentChange(event) {
        this.forceConsent = event.target.checked;
        this._makeURL();
    }

    onNewTabChange(event) {
        this.newTab = event.target.checked;
    }

    _makeURL() {
        this.URL = "";
        if (this.settings?.LOGIN_URL) {
            this.URL = this._actualURL;
            if (this.forceConsent || this.forceLogin) {
                this.URL += `&prompt=`;
                if (this.forceLogin) {
                    this.URL += `login`;
                }
                if (this.forceConsent && this.forceLogin) {
                    this.URL += `%20`;
                }
                if (this.forceConsent) {
                    this.URL += `consent`
                }
            }
        }
    }

    _showData() {
        this.oauthData = {
            data: null,
            OpenID: null
        };
        let strData = localStorage.getItem("OAuthCallback");
        if (strData) {
            try {
                let data = JSON.parse(strData);
                this.dispatchEvent(new CustomEvent("results", { bubbles: true, composed: true, detail: { data } }))
                // if (data.id_token) {
                //     let IdToken = data.id_token;
                //     let strOpenID = atob(IdToken.split(".")[1]);
                //     let OpenID = JSON.parse(strOpenID);
                //     this.oauthData.OpenID = this._getText(OpenID);
                // } else {
                //     this.oauthData.OpenID = null;
                // }
                // this.oauthData.data = this._getText(data);
                setTimeout(() => {
                    localStorage.removeItem("OAuthCallback");
                    console.log("Cleared [OAuthCallback]")
                }, 5e2);
            } catch (ex) {
                localStorage.removeItem("OAuthCallback");
            }
        }
    }
}