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

    this.addEventListener('reset', () => this.el.input.value = '');
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
      console.debug('erd-predictive-input fetch', url);
      const res = await fetch(url);
      const resClone = res.clone();
      let json;

      try {
        json = await res.json();
      } catch (e) {
        console.error(`JSON parsing error: ${await resClone.text()}`);
        throw e;
      }

      console.debug(json);
      console.debug(this.constructor.suggestionsJsonKey, this.constructor.suggestionsJsonTextIn);

      json[this.constructor.suggestionsJsonKey].forEach(verbOrEntity => {
        const el = document.createElement('option');
        el.value = verbOrEntity[this.constructor.suggestionsJsonTextIn]; // should cache the latest n
        this.el.suggestions.appendChild(el);
      });

    } catch (e) {
      console.error(e);
    }
  }
}

window.customElements.define(ErdPredictiveInputElement.elName, ErdPredictiveInputElement);
