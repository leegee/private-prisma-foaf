export const Templates = Object.create(null, {
  // https://gist.github.com/olanod/ede8befb771057bb004c4f57be591640/
  load: {
    value: async function (fileName) {
      const url = new URL(
        fileName,
        document.currentScript && document.currentScript.src || location.href
      );

      if (url in this) {
        return this[url];
      }

      // fetch and parse template as string
      let template;

      try {
        template = await fetch(url);
        template = await template.text();
      } catch (e) {
        console.error(`Error loading template from ${url}`);
        console.error(e);
        return;
      }

      if (!template) {
        console.warn(`Could not load from ${url}`);
      }


      template = new DOMParser()
        .parseFromString(template, 'text/html')
        .querySelector('template');

      if (!template) {
        console.warn(`No template element found ${url}`);
      }

      // overwrite link tags' hrefs asuming they're always relative to the template
      for (let link of template.content.querySelectorAll('link')) {
        const href = new URL(
          document.importNode(link).href
        ).pathname.substr(1);
        link.href = new URL(href, url).href;
      }
      document.head.append(template);
      this[url] = template;
      return template;
    }
  }
});

export class ErdBaseElement extends HTMLElement {
  static name = 'erd-base-element--name-not-set-error';

  static debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
  }

  shallow = undefined;
  templateUrl = undefined;

  constructor() {
    super();
    this.templateUrl = `web-components/${this.constructor.name}.html`;
  };

  async connectedCallback() {
    console.debug(`Load ${this.templateUrl}`);
    this.template = await Templates.load(this.templateUrl);
    console.debug(`Loaded ${this.templateUrl}`);

    this.shadow = this.attachShadow({ mode: 'closed' });
    this.shadow.appendChild(
      this.template.content.cloneNode(true)
    );
  }

  // disconnectedCallback() { }

  // attributeChangedCallback(attrName, oldVal, newVal) { }
}

