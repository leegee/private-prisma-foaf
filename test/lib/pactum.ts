import pactum from 'pactum';

type Ctx = {
  [key: string]: any;
};

pactum.handler.addAssertHandler('type', (ctx: Ctx) => {
  return typeof ctx.data === ctx.args[0];
});

export { pactum };
