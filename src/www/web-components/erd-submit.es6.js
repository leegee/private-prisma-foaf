// <erd-submit>

import { ErdBaseElement } from './erd-base-element.es6.js';

class ErdSubmit extends ErdBaseElement {
  static elName = 'erd-submit';
  static suggestionsJsonKey = 'entities';
  static get observedAttributes() { return ['disabled']; }

  set disabled(val) {
    if (this.el) {
      this.el.setAttribute('disabled', val);
    }
  }

  el = undefined;

  async connectedCallback() {
    await super.connectedCallback();
    this.apiurl = this.getAttribute('apiurl').replace(/\/+$/, '/predicate');
    this.el = this.shadow.querySelector('button');
    this.el.addEventListener(
      'click', this.submit.bind(this)
    );
    this.disabled = true;
  }

  submit() {
    this.dispatchEvent(new CustomEvent('submit'));
  }
}

window.customElements.define(ErdSubmit.elName, ErdSubmit);

