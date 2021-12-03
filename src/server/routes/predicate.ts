import { RouteOptions } from 'fastify';

export const routes: RouteOptions[] = [{
  method: 'GET',
  url: '/predicate',
  // Todo: move to external file, to be shared by e2e tests, etc - autocreate from TS types...?
  schema: {
    body: {
      Subject: { knownas: { type: 'string' } },
      Verb: { name: { type: 'string' } },
      Object: { knownas: { type: 'string' } },
    },
    response: {
      201: {
        type: 'object',
      }
    }
  },

  handler: async function (req, res) {
    // @ts-expect-error
    await req.dao.createPredicate(req.body);
    res.send(201);
  }

}];
