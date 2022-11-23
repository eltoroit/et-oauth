import { LightningElement, api } from 'lwc';

export default class JWT extends LightningElement {
    @api settings;
    keys = null;

    onLoginClick() {
        fetch(`/jwt`)
            .then(response => response.json())
            .then(data => {
                this.dispatchEvent(new CustomEvent("results", { bubbles: true, composed: true, detail: { data } }))
            })
            .catch(error => console.error('error', error));
    }
}