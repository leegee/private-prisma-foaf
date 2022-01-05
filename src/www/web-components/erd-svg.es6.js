import { ErdBaseElement } from './erd-base-element.es6.js';

class ErdSvg extends ErdBaseElement {
  static elName = 'erd-svg';
  static get observedAttributes() { return ['apiurl']; }

  constructor() {
    super();
  }

  async connectedCallback() {
    await super.connectedCallback(false);
  }


  attributeChangedCallback(_name, _oldValue, newValue) {
    this.addSvg(newValue);
  }

  async addSvg(apiurl) {
    const res = await fetch(apiurl + "graph");
    const svg = await res.text();

    const el = document.createElement('svg');
    el.innerHTML = svg;
    this.shadowRoot.appendChild(el);
  }
}

window.customElements.define(ErdSvg.elName, ErdSvg);
