import { debounce } from './debounce';
import { fetchHeaders } from './fetch-headers';

export default class TsAutocomplete {

	private selector: string;
	private wrapperElement: HTMLElement;
	private inputElement: HTMLInputElement;
	private resetButtonElement: HTMLButtonElement;
	private items: any;
	private uri: string;
	private currentFocus: number;
	private makeSearchCall: any;
	private loaderElement: HTMLElement;
	private onSelect: Function;
	private onReset: Function;


	constructor(selector: string, onSelect?: Function, onReset?: Function) {
		console.log('using ts autocomplete')
		this.selector     = selector;
		this.inputElement = document.querySelector(selector);

		this.items = this.inputElement.dataset.items !== undefined ? this.inputElement.dataset.items : null;
		this.uri   = this.inputElement.dataset.uri !== undefined   ? this.inputElement.dataset.uri   : null;

		if ( this.items ) {
			this.items = typeof this.inputElement.dataset.items === 'string' ? JSON.parse(this.inputElement.dataset.items) : this.inputElement.dataset.items;
		}

		this.onSelect = onSelect;
		this.onReset  = onReset;

		this.setupAutocomplete();
		this.attachEventHandlers();
	}


	private setupAutocomplete() {
		this.wrapperElement = document.createElement('div');
		this.wrapperElement.classList.add('autocomplete-wrapper');
		this.wrapperElement.appendChild(this.inputElement.cloneNode());

		this.inputElement.replaceWith(this.wrapperElement);
		this.inputElement = this.wrapperElement.querySelector(this.selector);

		this.loaderElement = document.createElement('div');
		this.loaderElement.classList.add('autocomplete-loader', 'hidden');
		this.wrapperElement.appendChild(this.loaderElement);

		this.resetButtonElement = document.createElement('button');
		this.resetButtonElement.classList.add('autocomplete-reset', 'hidden');
		this.resetButtonElement.innerHTML = 'Reset';
		this.wrapperElement.appendChild(this.resetButtonElement);

		if ( !this.items ) {
			this.makeSearchCall = debounce((value: string) => {

				this.loaderElement.classList.remove('hidden');

				TsAutocomplete.performAsyncRequest(this.uri, { term: this.inputElement.value }, (data: any) => {
					this.loaderElement.classList.add('hidden');
					this.generateItemsList(data, value);
				});

			}, 300);
		}

		if ( this.inputElement.value ) {
			this.lockSearch();
			this.showResetButton();
		}

	}


	private attachEventHandlers() {

		this.inputElement.addEventListener('input', () => {
			const value = this.inputElement.value;

			this.currentFocus = -1;

			this.closeAllLists(null);

			if ( !value ) {
				return false;
			}

			if ( this.items ) {
				this.generateItemsList(this.items, value);
			} else {
				this.makeSearchCall(value);
			}
		});


		this.inputElement.addEventListener('keydown', (ev: KeyboardEvent) => {
			let elements: NodeListOf<HTMLElement> = this.wrapperElement.querySelectorAll('.autocomplete-items > li');

			if ( ev.code === 'ArrowDown' ) {
				this.currentFocus++;
				this.addActive(elements);
			} else if ( ev.code === 'ArrowUp' ) {
				this.currentFocus--;
				this.addActive(elements);
			} else if ( ev.code === 'Enter' ) {
				ev.preventDefault();

				if ( this.currentFocus > -1 ) {
					if ( elements ) {
						elements[this.currentFocus].click();
					}
				}
			}
		});


		document.addEventListener('click', (ev: MouseEvent) => this.closeAllLists(<HTMLElement>ev.target));


		this.resetButtonElement.addEventListener('click', (ev: MouseEvent) => {
			ev.preventDefault();

			this.inputElement.value = '';
			this.hideResetButton();
			this.unlockSearch();
			this.onReset();
		});
	}


	private generateItemsList(items: any, value: string) {
		let item: HTMLElement;

		const itemsWrapperElement = document.createElement('ul');
		itemsWrapperElement.classList.add('autocomplete-items');
		this.wrapperElement.appendChild(itemsWrapperElement);

		Object.keys(items)
			.forEach((key: string) => {

				if ( items[key].substring(0, value.length).toUpperCase() == value.toUpperCase() ) {
					item           = document.createElement('li');
					item.innerHTML = '<strong>' + items[key].substring(0, value.length) + '</strong>';
					item.innerHTML += items[key].substring(value.length);
					item.innerHTML += '<input type="hidden" value="' + key + '" data-label="' + items[key] + '">';

					item.addEventListener('click', (ev: MouseEvent) => {
						const $input = (<HTMLInputElement>ev.target).querySelector('input');
						this.inputElement.value = ( $input? $input.dataset.label : '' );
						this.onSelect((<HTMLInputElement>ev.target).querySelector('input').value);
						this.showResetButton();
						this.closeAllLists(null);
					});

					itemsWrapperElement.appendChild(item);
				}

			});

	}


	private showResetButton() {
		this.resetButtonElement.classList.remove('hidden');
	}

	private hideResetButton() {
		this.resetButtonElement.classList.add('hidden');
	}

	private lockSearch() {
		this.inputElement.setAttribute('readonly', 'readonly');
	}

	private unlockSearch() {
		this.inputElement.removeAttribute('readonly');
	}


	private addActive(elements: NodeListOf<HTMLElement>) {
		if ( !elements ) {
			return false;
		}

		TsAutocomplete.removeActive(elements);

		if ( this.currentFocus >= elements.length ) {
			this.currentFocus = 0;
		}

		if ( this.currentFocus < 0 ) {
			this.currentFocus = (elements.length - 1);
		}

		elements[this.currentFocus].classList.add('autocomplete-active');
	}


	private static removeActive(elements: NodeListOf<HTMLElement>) {
		elements.forEach(item => item.classList.remove('autocomplete-active'));
	}


	private closeAllLists(element: HTMLElement | null) {
		this.wrapperElement
			.querySelectorAll('.autocomplete-items')
			.forEach((item: HTMLElement) => {
				if ( this.inputElement != item && element != item ) {
					item.parentNode.removeChild(item);
				}
			});
	}


	public static performAsyncRequest(url: string, data: any, callback: Function) {
		fetch(url + '?' + new URLSearchParams(data), {
			headers    : fetchHeaders(),
			method     : 'GET',
			credentials: 'same-origin',
		})
			.then(response => response.json())
			.then((data) => callback(data))
			.catch((error) => console.error(error));
	}

}
