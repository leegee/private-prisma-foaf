// <erd-video-citation>

import { ErdBaseElement } from './erd-base-element.es6.js';
import './lib/youtube-video-element.js';

/**
 * @event timeChanged - detail.currentTime = pos in video in ms
 */
class ErdVideoCitation extends ErdBaseElement {
  static name = 'erd-video-citation';
  el = {
    video: undefined,
    buttonSetUrl: undefined,
    inputUrl: undefined,
  };

  async connectedCallback() {
    await super.connectedCallback();
    this.el.video = this.shadow.querySelector('youtube-video');
    this.el.video.src = 'https://www.youtube.com/watch?v=7TFK42dwPr0';
    this.el.video.addEventListener('pause', this.timeChanged.bind(this));

    this.el.buttonSetUrl = this.shadow.querySelector('#set-video-src');
    this.el.buttonSetUrl.addEventListener('click', this.setVideoUrl.bind(this));

    this.el.inputUrl = this.shadow.querySelector('#video-url');
  }

  disconnectedCallback() {
    this.el.video.removeEventListener('pause', this.timeChanged.bind(this));
    this.el.video.removeEventListener('click', this.setVideoUrl.bind(this));
  }

  timeChanged(e) {
    this.dispatchEvent(new CustomEvent('timeChanged', {
      detail: { currentTime: e.detail.currentTime }
    }));
  }

  setVideoUrl() {
    let url = this.el.inputUrl.value;
    if (!url) {
      alert('Please enter a URL');
    } else {
      console.log('Change url', url);
      this.el.video.setAttribute('src', url.trim());
    }
  }
}

window.customElements.define(ErdVideoCitation.name, ErdVideoCitation);
