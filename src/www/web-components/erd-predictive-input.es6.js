// <erd-predictive-input></erd-predictive-input>

import { ErdBaseElement } from './erd-base-element.es6.js';

/** A base class for inputs */
export class ErdPredictiveInputElement extends ErdBaseElement {
  static name = 'erd-predictive-input';

  async connectedCallback() {
    await super.connectedCallback();

    this.el = {
      input: this.shadow.querySelector('input'),
      suggestions: this.shadow.querySelector('#suggestions'),
    };

    this.el.input.addEventListener('keyup', ErdBaseElement.debounce(() => this.onChange()));
  }

  disconnectedCallback() {
    this.el.input.removeEventListener('keyup', ErdBaseElement.debounce(() => this.onChange()));
  }

  async onChange(e) {
    let suggestions;
    this.el.input.disabled = true;
    this.el.suggestions.innerText = '';

    // Send to server
    // Server shall normalise this.value
    // Populate selection
    // Emit response

    const res = await fetch(this.url);
    suggestions = await res.json();

    suggestions.forEach(
      text => {
        const el = document.createElement('option');
        el.value = text;
        this.el.suggestions.appendChild(el);
      });

    // this.shadow.dispatchEvent(
    //   new CustomEvent('ready', {
    //     bubbles: true,
    //     detail: this.value,
    //   })
    // );

    this.el.input.disabled = false;
  }
}

window.customElements.define(ErdPredictiveInputElement.name, ErdPredictiveInputElement);
