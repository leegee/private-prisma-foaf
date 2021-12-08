// <erd-maker>

import { ErdBaseElement } from './erd-base-element.es6.js';

class ErdMaker extends ErdBaseElement {
  static name = 'erd-maker';
  el = {
    video: undefined,
    submit: undefined,
  };
  currentTime = 0;

  async connectedCallback() {
    await super.connectedCallback();

    const apiurl = this.getAttribute('apiurl');
    ['subject', 'verb', 'object', 'submit'].forEach(
      id => this.shadow.querySelector('#' + id).setAttribute('apiurl', apiurl)
    );

    this.el.video = this.shadow.querySelector('erd-video-citation');
    this.el.video.addEventListener('timeChanged', this.timeChanged.bind(this));

    this.el.submit = this.shadow.querySelector('#submit');
    this.el.submit.addEventListener('submit', () => this.submit());
  }

  disconnectedCallback() {
    this.el.video.removeEventListener('timeChanged', this.timeChanged.bind(this));
  }

  timeChanged(e) {
    this.currentTime = e.detail.currentTime;
  }

  submit(e) {
    console.log(e);
  }

}

window.customElements.define(ErdMaker.name, ErdMaker);
