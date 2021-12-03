import { RouteOptions } from 'fastify';
import { DAO } from 'src/service/dao';

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
    // @ts-expect-error because req is intentinoally extended
    const entities = req.dao.entitySearch(req.params.q);
    res.send({ entities });
  }
}];
