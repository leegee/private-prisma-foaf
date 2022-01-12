import { ErdBaseElement } from './erd-base-element.es6.js';

class ErdMaker extends ErdBaseElement {
  static elName = 'erd-maker';
  elNameUppercase = undefined;

  el = {};
  state = {};
  apiurlRoot = undefined;
  apiurl = undefined;

  constructor() {
    super();
    this.elNameUppercase = this.constructor.elName.toUpperCase();
  }

  async connectedCallback() {
    await super.connectedCallback();

    this.apiurlRoot = this.getAttribute('apiurl');
    this.apiurl = this.apiurlRoot.replace(/\/+$/, '/predicate');

    ['subject', 'verb', 'object', 'submit', 'video', 'svg'].forEach(
      id => {
        this.el[id] = this.shadow.querySelector('#' + id);
        this.el[id].setAttribute('apiurl', this.apiurlRoot);
        if (id !== 'svg') {
          this.el[id].addEventListener('change', (e) => this.change(id, e));
        }
      }
    );

    this.el.submit.addEventListener('submit', () => this.submit());

    this.el.eventList = this.shadow.querySelector('erd-event-list');

    window.addEventListener('keydown', this.captureSpaceBar);
  }

  captureSpaceBar(e) {
    if (e.keyCode === 32) {
      const allowed = e.path.reduce(
        (prev, current) => prev && !(current instanceof HTMLInputElement),
        true
      );

      if (allowed) {
        window.dispatchEvent(new Event('erd-video-toggle-pause'));
        e.preventDefault();
      };
    }
  }

  change(elId, e) {
    this.state[elId] = e.detail;

    const missing = ['subject', 'verb', 'object',].reduce(
      (stack, id) => !this.state[id] || this.state[id].trim() === '' ? [...stack, id] : stack,
      []
    );

    if (!this.state.video || this.state.video.url.trim() === '') {
      missing.push('video');
    }

    this.el.submit.setAttribute('disabled', missing.length > 0);
  }

  async submit() {
    const body = {
      Subject: this.state.subject,
      Verb: this.state.subject,
      Object: this.state.object,
      Citations: [this.state.video.url],
    };

    const res = await fetch(this.apiurl, {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify(body),
    });

    if (res.status === 201) {
      this.dispatchEvent(new CustomEvent('rest'));
      this.el.eventList.dispatchEvent(new CustomEvent('add', {
        detail: {
          body: {
            ...body,
            time: this.state.video.time,
          }
        }
      }));
    }
    else {
      console.error('Error sending', body);
      const json = await res.json();
      document.dispatchEvent(
        new CustomEvent('erd-message', {
          detail: {
            text: JSON.stringify(json, null, 2),
            class: 'error',
          }
        })
      );
      console.error(json);
    }
  }
}

window.customElements.define(ErdMaker.elName, ErdMaker);
