// <erd-submit>

import { ErdBaseElement } from './erd-base-element.es6.js';

class ErdSubmit extends ErdBaseElement {
  static name = 'erd-submit';
  static suggestionsJsonKey = 'entities';

  el = undefined;

  async connectedCallback() {
    await super.connectedCallback();
    this.apiurl = this.getAttribute('apiurl').replace(/\/+$/, '/predicate');
    this.el = this.shadow.querySelector('button').addEventListener(
      'click', this.submit.bind(this)
    );
  }

  submit() {
    this.dispatchEvent(new CustomEvent('submit'));
  }
}

window.customElements.define(ErdSubmit.name, ErdSubmit);

