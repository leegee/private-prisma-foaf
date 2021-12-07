// <erd-maker>

import { ErdBaseElement } from './erd-base-element.es6.js';

class ErdMaker extends ErdBaseElement {
  static name = 'erd-maker';
  el = {
    video: undefined
  };
  currentTime = 0;

  async connectedCallback() {
    await super.connectedCallback();
    this.el.video = this.shadow.querySelector('erd-video-citation');
    this.el.video.addEventListener('timeChanged', () => this.timeChanged());

    const apiurl = this.getAttribute('apiurl');
    ['subject', 'verb', 'object'].forEach(
      id => this.shadow.querySelector('#' + id).setAttribute('apiurl', apiurl)
    );
  }

  disconnectedCallback() {
    this.el.video.removeEventListener('timeChanged', () => this.timeChanged());
  }

  timeChanged(e) {
    this.currentTime = e.detail.currentTime;
  }

}

window.customElements.define(ErdMaker.name, ErdMaker);
