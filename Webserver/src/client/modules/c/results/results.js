import { LightningElement, api, track } from 'lwc';

export default class Results extends LightningElement {
    @api settings;
    @track _oauthData = {};

    @api
    get oauthData() {
        return this._oauthData;
    }
    set oauthData(value) {
        if (value.data) {
            this._oauthData = { ...value };
            this.getRefreshtoken();
            this.getAccounts();
            this.getUser();
            this.getLoginUrl();
        }
    }

    onLogoutClick() {
        if (this.oauthData?.data?.access_token) {
            fetch(`${this.oauthData.data.instance_url}/services/oauth2/revoke?token=${this.oauthData.data.access_token}`)
                .then(result1 => {
                    console.log(result1);
                    return result1.text();
                })
                .then((result2) => {
                    console.log(result2);
                    if (this.oauthData?.data?.refresh_token) {
                        fetch(`${this.oauthData.data.instance_url}/services/oauth2/revoke?token=${this.oauthData.data.refresh_token}`)
                            .then(result3 => {
                                console.log(result3);
                                return result3.text();
                            })
                            .then((result4) => {
                                console.log(result4);
                                // eslint-disable-next-line @lwc/lwc/no-api-reassignments
                                this.oauthData = { data: {} };
                            })
                    } else {
                        // eslint-disable-next-line @lwc/lwc/no-api-reassignments
                        this.oauthData = { data: {} };
                    }
                })
        }
    }

    onRefreshClick() {
        if (this.oauthData?.data?.refresh_token) {
            let urlencoded = new URLSearchParams();
            urlencoded.append("grant_type", "refresh_token");
            urlencoded.append("refresh_token", this.oauthData.data.refresh_token);
            urlencoded.append("client_id", this.settings.CONSUMER_KEY.value);
            urlencoded.append("client_secret", this.settings.CONSUMER_SECRET.value);

            // let Authorization = btoa(`${this.settings.CONSUMER_KEY.value}:${this.settings.CONSUMER_SECRET.value}`);
            // Authorization = `Basic ${Authorization}`;
            fetch(`${this.oauthData.data.instance_url}/services/oauth2/token`, {
                method: 'POST',
                headers: {
                    // Authorization, << Disabling autorization because that affects cors
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: urlencoded,
                redirect: 'follow'
            })
                .then(response => response.json())
                .then(data => {
                    // eslint-disable-next-line @lwc/lwc/no-api-reassignments
                    this.oauthData = { data };
                })
                .catch(error => console.error('error', error));
        }
    }

    getLoginUrl() {
        if (this.oauthData?.data?.instance_url && this.oauthData?.data?.access_token) {
            this.oauthData.loginUrl = `${this.oauthData.data.instance_url}/secur/frontdoor.jsp?sid=${this.oauthData.data.access_token}`;
        }
    }

    getRefreshtoken() {
        if (this.oauthData?.data?.refresh_token) {
            this.oauthData.strRefreshToken = this.oauthData.data.refresh_token;
        }
    }

    getAccounts() {
        if (this.oauthData?.data?.access_token) {
            let SOQL = `SELECT Id, Name, Phone, Type FROM Account WHERE Type != null ORDER BY Name`;

            fetch(`${this.oauthData.data.instance_url}/services/data/v51.0/query?q=${SOQL}`, this._getOptions())
                .then(response => {
                    if (response.status !== 200) throw new Error(response);
                    return response.json();
                })
                .then(result => {
                    this.oauthData.accounts = result;
                    this.oauthData.strAccounts = JSON.stringify(result, null, 2);
                })
                .catch(error => console.log('error', error));
        }
    }

    getUser() {
        if (this.oauthData?.data?.id) {
            // Make this request form the server, because I can't figure out the CORS issue :-)
            fetch(`/getUser`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(this.oauthData.data)
            })
                .then(response => response.json())
                .then(data => {
                    this.oauthData.user = data.body;
                    this.oauthData.strUser = JSON.stringify(data.body, null, 2);
                })
                .catch(error => console.error('error', error));
        }
    }

    _getOptions() {
        return {
            method: 'GET',
            headers: { Authorization: `Bearer ${this.oauthData.data.access_token}` },
            mode: 'cors',
            redirect: 'follow'
        }
    }
}
