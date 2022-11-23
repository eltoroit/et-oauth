import { LightningElement, api } from 'lwc';

export default class UsernamePassword extends LightningElement {
    @api settings;
    keys = ["UN", "PW"];

    onLoginClick() {
        let urlencoded = new URLSearchParams();
        urlencoded.append("grant_type", "password");
        urlencoded.append("client_id", this.settings.CONSUMER_KEY.value);
        urlencoded.append("client_secret", this.settings.CONSUMER_SECRET.value);
        urlencoded.append("username", this.settings.UN.value);
        urlencoded.append("password", this.settings.PW.value);

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
                this.dispatchEvent(new CustomEvent("results", { bubbles: true, composed: true, detail: { data } }))
            })
            .catch(error => console.error('error', error));
    }
}