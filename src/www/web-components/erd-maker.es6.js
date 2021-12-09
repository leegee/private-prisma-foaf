// <erd-maker>

import { ErdBaseElement } from './erd-base-element.es6.js';

class ErdMaker extends ErdBaseElement {
  static elName = 'erd-maker';

  el = {};
  state = {};
  apiurlRoot = undefined;
  apiurl = undefined;

  async connectedCallback() {
    await super.connectedCallback();

    this.apiurlRoot = this.getAttribute('apiurl');
    this.apiurl = this.apiurlRoot.replace(/\/+$/, '/predicate');

    ['subject', 'verb', 'object', 'submit', 'video'].forEach(
      id => {
        this.el[id] = this.shadow.querySelector('#' + id);
        this.el[id].setAttribute('apiurl', this.apiurlRoot);
        this.el[id].addEventListener('change', (e) => this.change(id, e));
      }
    );

    this.el.submit = this.shadow.querySelector('#submit');
    this.el.submit.addEventListener('submit', () => this.submit());
  }

  change(elId, e) {
    this.state[elId] = e.detail;
    console.log('Set', elId, this.state[elId]);

    const missing = ['subject', 'verb', 'object', 'video'].reduce(
      (stack, id) => !this.state[id] || this.state[id].trim() === '' ? [...stack, id] : stack,
      []
    );
    this.el.submit.disabled = missing.length === 0;
  }

  async submit() {
    const body = {
      Subject: { knownas: this.state.subject },
      Verb: { name: this.state.subject },
      Object: { knownas: this.state.object },
      citations: [this.state.video],
    };

    console.log(body);

    console.log('PUT ', this.apiurl);
    const res = await fetch(this.apiurl, {
      method: 'PUT',
      body: JSON.stringify(body)
    });

    console.log(res.status);
  }

}

window.customElements.define(ErdMaker.elName, ErdMaker);
