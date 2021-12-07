// <erd-verb-input></erd-verb-input>

import { ErdPredictiveInputElement } from './erd-predictive-input.es6.js';

class ErdVerbInput extends ErdPredictiveInputElement {
  static name = 'erd-verb-input';
}

window.customElements.define(ErdVerbInput.name, ErdVerbInput);
