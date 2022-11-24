import { LightningElement, api } from 'lwc';

export default class Settings extends LightningElement {
    list = [];
    _keys = [];
    _settings = {};

    @api
    get settings() {
        return this._settings;
    }
    set settings(value) {
        this._settings = { ...value };
        this.makeList();
    }

    @api
    get keys() {
        return this._keys;
    }
    set keys(value) {
        this._keys = value;
        this.makeList();
    }

    get disabled() {
        let output = false;
        if (this.keys) {
            output = this.keys.length > 0;
        }
        return output;
    }

    makeList() {
        this.list = [];
        if (this.settings && this.keys) {
            for (let key in this.settings) {
                if ({}.hasOwnProperty.call(this.settings, key)) {
                    this.list.push({ key, ...this.settings[key] });
                }
            }
            if (this.keys.length > 0) {
                this.list = this.list.filter(item => this.keys.includes(item.key));
            }
            // console.log(this.list);
        }
    }

    onValueChange(event) {
        let key = event.target.attributes["data-key"].value;
        let item = { ...this.settings[key] };
        item.value = event.target.value;
        this.settings[key] = item;
        this.dispatchEvent(new CustomEvent("settingschange", { bubbles: true, composed: true, detail: this.settings }));
    }

    onClick(event) {
        if (event.target.disabled) {
            let value = event.target.value;
            navigator.clipboard.writeText(value).then(() => {
                alert(`Copied: ${value}`);
            }).catch(err => {
                alert("Error copying to the clipboard");
            });
        }
    }
}