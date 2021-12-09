// <erd-video-citation>

import { ErdBaseElement } from './erd-base-element.es6.js';
import './lib/youtube-video-element.js';

class ErdVideoCitation extends ErdBaseElement {
  static elName = 'erd-video-citation';
  el = {
    video: undefined,
    buttonSetUrl: undefined,
    input: undefined,
  };

  async connectedCallback() {
    await super.connectedCallback();
    this.el.video = this.shadow.querySelector('youtube-video');
    this.el.video.src = '';
    this.el.video.addEventListener('change', this.change.bind(this));

    this.el.buttonSetUrl = this.shadow.querySelector('#set-video-src');
    this.el.buttonSetUrl.addEventListener('click', this.setVideoUrl.bind(this));

    this.el.input = this.shadow.querySelector('#video-url');
  }

  disconnectedCallback() {
    this.el.video.removeEventListener('pause', this.change.bind(this));
    this.el.video.removeEventListener('click', this.setVideoUrl.bind(this));
  }

  change(e) {
    const url = this.el.video.getAttribute('src') + (e ? '?t=' + e.detail : '');
    this.el.input.setAttribute('value', url);
    this.dispatchEvent(new CustomEvent('change', {
      detail: url
    }));
  }

  setVideoUrl() {
    let url = this.el.input.value.trim();
    if (!url) {
      alert('Please enter a URL');
    } else {
      console.log('Change video url', url);
      this.el.video.setAttribute('src', url);
    }
  }
}

window.customElements.define(ErdVideoCitation.elName, ErdVideoCitation);
