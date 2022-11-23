import { LightningElement, api } from 'lwc';
export default class UserAgent extends LightningElement {
    @api settings;
    
    get actualURL() {
        let output = "";
        if (this.settings?.LOGIN_URL?.value) {
            output = `${this.settings.LOGIN_URL.value}/services/oauth2/authorize`;
            output += `?client_id=${this.settings.CONSUMER_KEY.value}&redirect_uri=${this.settings.CALLBACK.value}`;
            output += `&response_type=token id_token&&nonce=true`;
        }
        return output;
    }
}