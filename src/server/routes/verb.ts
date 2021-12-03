import { RouteOptions } from 'fastify';

export const routes: RouteOptions[] = [{
  method: 'GET',
  url: '/verb',
  // Todo: move to external file, to be shared by e2e tests, etc - autocreate from TS types...?
  schema: {
    querystring: {
      q: { type: 'string' },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          verbs: {
            type: 'array',
            properties: {
              name: { type: 'string' },
            }
          }
        }
      }
    }
  },

  handler: function (req, res) {
    // @ts-expect-error because req is intentinoally extended
    const verbs = req.dao.verbSearch(req.params.q);
    res.send({ verbs });
  }
}];
