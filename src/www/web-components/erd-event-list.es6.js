import { ErdBaseElement } from './erd-base-element.es6.js';

class ErdEventList extends ErdBaseElement {
  static elName = 'erd-event-list';

  async connectedCallback() {
    await super.connectedCallback();
    document.addEventListener('add', this.addEventItem.bind(this));
  }

  addEventItem(e) {
    console.log(e.detail);

    const el = document.createElement('div');

    el.className = 'event-item';
    el.innerText = [e.detail.Subject, e.detail.Verb, e.detail.Object].join(' ');
    this.appendChild(el);
  }
}

window.customElements.define(ErdEventList.elName, ErdEventList);
