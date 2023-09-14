import { debounce } from './debounce';
import { fetchHeaders } from './fetch-headers';
export default class TsAutocomplete {
    constructor(selector, onSelect, onReset) {
        console.log('using ts autocomplete');
        this.selector = selector;
        this.inputElement = document.querySelector(selector);
        this.items = this.inputElement.dataset.items !== undefined ? this.inputElement.dataset.items : null;
        this.uri = this.inputElement.dataset.uri !== undefined ? this.inputElement.dataset.uri : null;
        if (this.items) {
            this.items = typeof this.inputElement.dataset.items === 'string' ? JSON.parse(this.inputElement.dataset.items) : this.inputElement.dataset.items;
        }
        this.onSelect = onSelect;
        this.onReset = onReset;
        this.setupAutocomplete();
        this.attachEventHandlers();
    }
    setupAutocomplete() {
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
        if (!this.items) {
            this.makeSearchCall = debounce((value) => {
                this.loaderElement.classList.remove('hidden');
                TsAutocomplete.performAsyncRequest(this.uri, { term: this.inputElement.value }, (data) => {
                    this.loaderElement.classList.add('hidden');
                    this.generateItemsList(data, value);
                });
            }, 300);
        }
        if (this.inputElement.value) {
            this.lockSearch();
            this.showResetButton();
        }
    }
    attachEventHandlers() {
        this.inputElement.addEventListener('input', () => {
            const value = this.inputElement.value;
            this.currentFocus = -1;
            this.closeAllLists(null);
            if (!value) {
                return false;
            }
            if (this.items) {
                this.generateItemsList(this.items, value);
            }
            else {
                this.makeSearchCall(value);
            }
        });
        this.inputElement.addEventListener('keydown', (ev) => {
            let elements = this.wrapperElement.querySelectorAll('.autocomplete-items > li');
            if (ev.code === 'ArrowDown') {
                this.currentFocus++;
                this.addActive(elements);
            }
            else if (ev.code === 'ArrowUp') {
                this.currentFocus--;
                this.addActive(elements);
            }
            else if (ev.code === 'Enter') {
                ev.preventDefault();
                if (this.currentFocus > -1) {
                    if (elements) {
                        elements[this.currentFocus].click();
                    }
                }
            }
        });
        document.addEventListener('click', (ev) => this.closeAllLists(ev.target));
        this.resetButtonElement.addEventListener('click', (ev) => {
            ev.preventDefault();
            this.inputElement.value = '';
            this.hideResetButton();
            this.unlockSearch();
            this.onReset();
        });
    }
    generateItemsList(items, value) {
        let item;
        const itemsWrapperElement = document.createElement('ul');
        itemsWrapperElement.classList.add('autocomplete-items');
        this.wrapperElement.appendChild(itemsWrapperElement);
        Object.keys(items)
            .forEach((key) => {
            if (items[key].substring(0, value.length).toUpperCase() == value.toUpperCase()) {
                item = document.createElement('li');
                item.innerHTML = '<strong>' + items[key].substring(0, value.length) + '</strong>';
                item.innerHTML += items[key].substring(value.length);
                item.innerHTML += '<input type="hidden" value="' + key + '" data-label="' + items[key] + '">';
                item.addEventListener('click', (ev) => {
                    const $input = ev.target.querySelector('input');
                    this.inputElement.value = ($input ? $input.dataset.label : '');
                    this.onSelect(ev.target.querySelector('input').value);
                    this.showResetButton();
                    this.closeAllLists(null);
                });
                itemsWrapperElement.appendChild(item);
            }
        });
    }
    showResetButton() {
        this.resetButtonElement.classList.remove('hidden');
    }
    hideResetButton() {
        this.resetButtonElement.classList.add('hidden');
    }
    lockSearch() {
        this.inputElement.setAttribute('readonly', 'readonly');
    }
    unlockSearch() {
        this.inputElement.removeAttribute('readonly');
    }
    addActive(elements) {
        if (!elements) {
            return false;
        }
        TsAutocomplete.removeActive(elements);
        if (this.currentFocus >= elements.length) {
            this.currentFocus = 0;
        }
        if (this.currentFocus < 0) {
            this.currentFocus = (elements.length - 1);
        }
        elements[this.currentFocus].classList.add('autocomplete-active');
    }
    static removeActive(elements) {
        elements.forEach(item => item.classList.remove('autocomplete-active'));
    }
    closeAllLists(element) {
        this.wrapperElement
            .querySelectorAll('.autocomplete-items')
            .forEach((item) => {
            if (this.inputElement != item && element != item) {
                item.parentNode.removeChild(item);
            }
        });
    }
    static performAsyncRequest(url, data, callback) {
        fetch(url + '?' + new URLSearchParams(data), {
            headers: fetchHeaders(),
            method: 'GET',
            credentials: 'same-origin',
        })
            .then(response => response.json())
            .then((data) => callback(data))
            .catch((error) => console.error(error));
    }
}
