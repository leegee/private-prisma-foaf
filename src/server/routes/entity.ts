import { RouteOptions } from 'fastify';

export const routes: RouteOptions[] = [{
  method: 'GET',
  url: '/entity',
  // Todo: move to external file, to be shared by e2e tests, etc - autocreate from TS types...?
  schema: {
    querystring: {
      q: { type: 'string' },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          entities: {
            type: 'array',
            properties: {
              knownas: { type: 'string' },
              formalname: { type: 'string' }
            }
          }
        }
      }
    }
  },

  handler: function (req, res) {
    res.send({ entities: [{ knownas: 'foo', formalname: 'bar' }] });
  }
}];
