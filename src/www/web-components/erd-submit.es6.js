// <erd-submit>

import { ErdBaseElement } from './erd-base-element.es6.js';

class ErdSubmit extends ErdBaseElement {
  static elName = 'erd-submit';
  static get observedAttributes() { return ['disabled']; }

  set disabled(val) {
    if (val === 'true' || val === true) {
      this.el.setAttribute('disabled', true);
    } else {
      this.el.removeAttribute('disabled');
    }
  }

  el = undefined;

  async connectedCallback() {
    await super.connectedCallback();
    this.apiurl = this.getAttribute('apiurl').replace(/\/+$/, '/predicate');
    this.el = this.shadow.querySelector('button');
    this.el.addEventListener('click', this.submit.bind(this));
    this.disabled = true;
  }

  attributeChangedCallback(_name, _oldValue, newValue) {
    if (newValue !== this.disabled) {
      this.disabled = newValue;
    }
  }

  submit() {
    if (this.disabled) {
      console.warn('Tried to submit when disabled');
    } else {
      this.dispatchEvent(new CustomEvent('submit'));
    }
  }
}

window.customElements.define(ErdSubmit.elName, ErdSubmit);

