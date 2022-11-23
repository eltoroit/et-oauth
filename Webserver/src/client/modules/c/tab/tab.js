import { LightningElement, api } from 'lwc';

export default class Tab extends LightningElement {
	@api label;
	@api tabClass;
	@api isHidden;

	get classHidden() {
		return `${this.tabClass} ${this.isHidden ? 'slds-hide' : ''}`;
	}
}
