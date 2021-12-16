import { ErdPredictiveInputElement } from './erd-predictive-input.es6.js';

class ErdVerbInput extends ErdPredictiveInputElement {
  static elName = 'erd-verb-input';
  static suggestionsJsonKey = 'verbs';
  static suggestionsJsonTextIn = 'name';

  constructor() {
    super();
    this.templateUrl = `web-components/erd-predictive-input.html`;
  }

  async connectedCallback() {
    await super.connectedCallback();
    this.apiurl = this.getAttribute('apiurl').replace(/\/+$/, '/verb?q=');
  }
}

window.customElements.define(ErdVerbInput.elName, ErdVerbInput);
