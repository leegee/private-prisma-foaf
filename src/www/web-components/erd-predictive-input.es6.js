// <erd-predictive-input></erd-predictive-input>

import { ErdBaseElement } from './erd-base-element.es6.js';

/** A base class for inputs */
export class ErdPredictiveInputElement extends ErdBaseElement {
  static name = 'erd-predictive-input';
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

  async onChange(e) {
    if (this.el.input.value.length === 0) {
      return;
    }

    this.el.input.disabled = true;
    this.el.suggestions.innerText = '';

    const url = this.apiurl + encodeURIComponent(
      this.el.input.value.toLocaleLowerCase().trim()
    );

    const res = await fetch(url, { mode: 'no-cors' });

    const json = await res.json();

    json.suggestions.forEach(text => {
      const el = document.createElement('option');
      el.value = text;
      this.el.suggestions.appendChild(el);
    });

    this.el.input.disabled = false;
  }
}

window.customElements.define(ErdPredictiveInputElement.name, ErdPredictiveInputElement);
