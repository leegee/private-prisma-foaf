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

    const el = document.createElement('div');
    el.innerHTML = svg;

    // el.addEventListener('click', (e) => {
    //   console.log(e, e.target);
    //   console.log(e.path);
    // });

    // const g = this.shadowRoot.querySelectorAll('svg g');
    // console.log(g);

    this.shadowRoot.appendChild(el);
  }
}

window.customElements.define(ErdSvg.elName, ErdSvg);


/*
<g id="edge6" class="edge verb">
<title>Entity5&#45;&gt;Entity7</title>
<path fill="none" stroke="black" d="M2852.13,-1570.6C2785.37,-1656.02 2498.78,-2022.74 2419.68,-2123.95"/>
<polygon fill="black" stroke="black" points="2416.71,-2122.07 2413.31,-2132.11 2422.22,-2126.38 2416.71,-2122.07"/>
<text text-anchor="start" x="2573.91" y="-1851.07" font-family="Times New Roman,serif" font-size="14.00">assassinate</text>
</g>


<!-- Entity80 -->
<g id="node2" class="node entity">
<title>Entity80</title>
<ellipse fill="none" stroke="black" cx="2508.66" cy="-1991.64" rx="27" ry="18"/>
<text text-anchor="start" x="2498.66" y="-1987.94" font-family="Times New Roman,serif" font-size="14.00">baz</text>
</g>

*/