// <erd-entity-input></erd-entity-input>

import { ErdPredictiveInputElement } from './erd-predictive-input.es6.js';

class ErdEntityInput extends ErdPredictiveInputElement {
  static name = 'erd-entity-input';
}

window.customElements.define(ErdEntityInput.name, ErdEntityInput);

