// <erd>

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
    this.el.video.addEventListener('timeChanged', this.timeChanged);
  }

  disconnectedCallback() {
    // this.el.removeEventListener('pause', this.timeChanged);
  }

  timeChanged(e) {
    this.currentTime = e.detail.currentTime;
  }
}

window.customElements.define(ErdMaker.name, ErdMaker);
