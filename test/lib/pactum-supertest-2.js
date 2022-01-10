const http = require('http');
const { request } = require('pactum');

function run(app) {
  let server;

  async function start(host = 'localhost') {
    if (typeof app === 'function') {
      server = http.createServer(app);
    } else {
      server = app.server ? app.server : app;
    }
    await server.listen();
    const url = `http://${host}:${server.address().port}`;
    request.setBaseUrl(url);
  }

  async function stop() {
    await server.close();
  }

  if (typeof before === 'function') {
    before(start);
    after(stop);
  }

  else if (typeof beforeAll === 'function') {
    beforeAll(start);
    afterAll(stop);
  }
}

module.exports = run;