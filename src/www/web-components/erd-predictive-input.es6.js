// <erd-predictive-input></erd-predictive-input>

import { ErdBaseElement } from './erd-base-element.es6.js';

/** A base class for inputs */
export class ErdPredictiveInputElement extends ErdBaseElement {
  static elName = 'erd-predictive-input';
  apiurl = undefined;

  async connectedCallback() {
    await super.connectedCallback();

    this.el = {
      input: this.shadow.querySelector('input'),
      suggestions: this.shadow.querySelector('#suggestions'),
    };

    this.el.input.addEventListener('keyup', ErdBaseElement.debounce(this.onChange.bind(this)));
  }

  disconnectedCallback() {
    this.el.input.removeEventListener('keyup', ErdBaseElement.debounce(this.onChange.bind(this)));
  }

  async onChange() {
    this.dispatchEvent(
      new CustomEvent('change', { detail: this.el.input.value })
    );

    let input = this.el.input.value;
    if (input.length) {
      input = input.toLocaleLowerCase().trim();
    }

    if (input.length < 2 || input === this._storedInputValue) {
      return;
    }

    this.el.input.value === input;

    this.el.suggestions.innerText = '';

    const url = this.apiurl + encodeURIComponent(input);

    try {
      console.log('GET', url);
      const res = await fetch(url);
      const json = await res.json();

      json[this.constructor.suggestionsJsonKey].forEach(verb => {
        const el = document.createElement('option');
        el.value = verb.name; // should cache the latest n for IDs
        this.el.suggestions.appendChild(el);
      });

    } catch (e) {
      console.error(e);
    }
  }
}

window.customElements.define(ErdPredictiveInputElement.elName, ErdPredictiveInputElement);
