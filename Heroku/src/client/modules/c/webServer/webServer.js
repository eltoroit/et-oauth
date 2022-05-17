import { LightningElement, api } from 'lwc';
export default class WebServer extends LightningElement {
    @api settings;

    get actualURL() {
        let output = "";
        let responseType = "code";
        if (this.settings?.LOGIN_URL?.value) {
            output = `${this.settings.LOGIN_URL.value}/services/oauth2/authorize?response_type=${responseType}&client_id=${this.settings.CONSUMER_KEY.value}&redirect_uri=${this.settings.CALLBACK.value}`;
        }
        return output;
    }
}