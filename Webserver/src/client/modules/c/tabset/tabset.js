import { LightningElement, api } from 'lwc';

const CLASSES = {
	standard: {
		div: 'slds-tabs_default',
		ul: 'slds-tabs_default__nav',
		li: 'slds-tabs_default__item',
		span: 'slds-tabs_default__link',
		body: 'slds-p-horizontal_medium',
		tab: 'slds-tabs_default__content'
	},
	scoped: {
		div: 'slds-tabs_scoped',
		ul: 'slds-tabs_scoped__nav',
		li: 'slds-tabs_scoped__item',
		span: 'slds-tabs_scoped__link',
		body: 'fullArea',
		tab: 'slds-tabs_scoped__content'
	},
	vertical: {
		div: 'slds-vertical-tabs',
		ul: 'slds-vertical-tabs__nav',
		li: 'slds-vertical-tabs__nav-item',
		span: 'slds-vertical-tabs__link',
		body: 'slds-p-horizontal_medium fullArea',
		tab: 'slds-vertical-tabs__content'
	}
};

export default class Tabset extends LightningElement {
	tabs = [];
	classes = {};
	_variant = 'standard'; // standard, scoped, and vertical
	@api defaultTab = 'NONE';

	@api
	get variant() {
		return this._variant;
	}
	set variant(value) {
		this._variant = value;
		this.setVariant();
	}

	onSlotChange() {
		const slot = this.template.querySelector(`[data-id="slot"]`);
		if (slot) {
			let tabs = slot.assignedNodes();
			this.tabs = tabs.map((tab, idx) => ({ idx: idx, label: tab.label }));
			Promise.resolve().then(() => {
				let idx = this.tabs.findIndex((tab) => tab.label === this.defaultTab);
				idx = idx < 0 ? 0 : idx;
				this.showTab(idx);
			});
		}
	}

	onSwitchTab(event) {
		let tabIdx = event.currentTarget.getAttribute('data-idx');
		this.showTab(Number(tabIdx));
	}

	@api showTab(tabIdx) {
		let tabs;

		// Update classes used
		this.setVariant();

		// Tabs
		tabs = Array.from(this.template.querySelectorAll('li[data-idx]'));
		tabs.forEach((tab) => {
			if (Number(tab.attributes['data-idx'].value) === tabIdx) {
				tab.classList.add('slds-is-active');
				if (this.variant === "scoped") {
					window.history.replaceState({}, "", `/?page=${tab.children[0].innerHTML}`); // eslint-disable-line
				}		
				this.dispatchEvent(
					new CustomEvent('switch', {
						detail: {
							index: tab.dataset.idx,
							label: tab.dataset.label
						}
					})
				);
			} else {
				tab.classList.remove('slds-is-active');
			}
		});

		// Pages
		tabs = Array.from(this.template.querySelector('slot[data-id="slot"]').assignedNodes());
		tabs.forEach((tab, idx) => {
			tab.isHidden = idx !== tabIdx;
		});
	}

	setVariant() {
		this.classes = CLASSES[this.variant];

		Promise.resolve().then(() => {
			let tabs = Array.from(this.template.querySelector('slot[data-id="slot"]').assignedNodes());
			tabs.forEach((tab) => {
				tab.tabClass = this.classes.tab;
			});
		});
	}
}
