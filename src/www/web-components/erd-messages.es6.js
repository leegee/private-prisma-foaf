/**
 * @example
 *   document.dispatchEvent(
        new CustomEvent('erd-message', {
          detail: {
            text: 'some message'
            class: 'some css class',
          }
        })
     );
*/

import { ErdBaseElement } from './erd-base-element.es6.js';

class ErdMessages extends ErdBaseElement {
  static elName = 'erd-messages';

  async connectedCallback() {
    await super.connectedCallback();
    document.addEventListener('erd-message', this.showMessage.bind(this));

    setTimeout(() =>
      document.dispatchEvent(
        new CustomEvent('erd-message', {
          detail: {
            text: 'Hello'
          }
        })
      ), 1000);
  }

  showMessage(e) {
    const el = document.createElement('div');

    el.className = 'message';
    if (e.detail.class) {
      el.classList.add(e.detail.class);
    }

    el.innerText = e.detail.text;

    el.addEventListener("animationend", () => el.remove());

    this.appendChild(el);
  }

}

window.customElements.define(ErdMessages.elName, ErdMessages);
