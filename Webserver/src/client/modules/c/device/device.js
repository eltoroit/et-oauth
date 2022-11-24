import { LightningElement, api } from 'lwc';

export default class JWT extends LightningElement {
    @api settings;
    keys = null;
    prompt = null;
    authWindow = null;
    timer = {
        interval: null,
        last: null,
        msg: null
    };

    connectedCallback() {
        setInterval(() => {
            this.timer.msg = null;
            if (this.timer.interval) {
                this.timer.msg = `checked ${Math.round((new Date() - this.timer.last) / 100) / 10} seconds ago`;
                this.timer = { ...this.timer };
            }
        }, 100);
    }

    onLoginClick() {
        debugger;
        this.prompt = null;
        let urlencoded = new URLSearchParams();
        urlencoded.append("response_type", "device_code");
        urlencoded.append("client_id", this.settings.CONSUMER_KEY.value);

        fetch(`${this.settings.LOGIN_URL.value}/services/oauth2/token`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: urlencoded,
            redirect: 'follow'
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(`${data.error} | ${data.error_description}`);
                } else {
                    this.prompt = {
                        url: data.verification_uri,
                        code: data.user_code
                    }
                    this.makeQRCode(data);
                    this.authWindow = window.open(data.verification_uri, "_blank", "width=400,height=600");
                    clearInterval(this.timer.interval);
                    this.timer.last = new Date();
                    this.timer.interval = setInterval(() => {
                        this.checkAuthorization(data.device_code);
                    }, (2 * data.interval) * 1000);
                }
            })
            .catch(error => console.error('error', error));
    }

    checkAuthorization(deviceCode) {
        let urlencoded = new URLSearchParams();
        urlencoded.append("grant_type", "device");
        urlencoded.append("client_id", this.settings.CONSUMER_KEY.value);
        urlencoded.append("code", deviceCode);

        this.timer.last = new Date();
        fetch(`${this.settings.LOGIN_URL.value}/services/oauth2/token`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: urlencoded,
            redirect: 'follow'
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.access_token) {
                    this.authWindow.close();
                    clearInterval(this.timer.interval);
                    this.timer.interval = null;
                    setTimeout(() => {
                        this.dispatchEvent(new CustomEvent("results", { bubbles: true, composed: true, detail: { data } }))
                    }, 0);
                }
            })
            .catch(error => {
                clearInterval(this.timer.interval);
                this.timer.interval = null;
                console.error('error', error)
            });
    }

    makeQRCode(data) {
        setTimeout(() => {
            let _QRCode = QRCode; // eslint-disable-line
            let div = this.template.querySelector(`div[data-qr="QRCode"]`);
            let qrcode = new _QRCode(div, {
                text: data.verification_uri,
                width: 300,
                height: 300,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: _QRCode.CorrectLevel.H
            });
        }, 0);
    }
}