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
    this.el.input.removeEventListener('change', this.onChange);
  }

  async onChange(e) {
    this.el.input.disabled = true;

    // Send to server
    // Server shall normalise this.value
    // Populate selection
    // Emit response

    console.log(this.el.suggestions);

    this.el.suggestions.innerText = '';

    ['foo', 'bar'].forEach(
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
