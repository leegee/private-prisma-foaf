// <erd-entity-input></erd-entity-input>

import { ErdPredictiveInputElement } from './erd-predictive-input.es6.js';

class ErdEntityInput extends ErdPredictiveInputElement {
  static name = 'erd-entity-input';

  constructor() {
    super();
    this.templateUrl = `web-components/erd-predictive-input.html`;
  }

  async connectedCallback() {
    await super.connectedCallback();
    this.apiurl = this.getAttribute('apiurl').replace(/\/$/, '') + '/entity?q=';
  }

}

window.customElements.define(ErdEntityInput.name, ErdEntityInput);

