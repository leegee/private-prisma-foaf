import { RouteOptions } from 'fastify';
import { FastifyRequestX } from '..';

interface FastifyRequestEntity extends FastifyRequestX {
  query: {
    q: string
  },
  dao: any
};

export const routes: RouteOptions[] = [{
  method: 'GET',
  url: '/verb',
  // Todo: move to external file, to be shared by int tests, etc - autocreate from TS types...?
  schema: {
    querystring: {
      type: 'object',
      properties: {
        q: {
          type: 'string'
        },
      },
      required: ['q']
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

  handler: async (req, res) => {
    const verbs = await (req as FastifyRequestX).dao.verbSearch(
      (req as FastifyRequestEntity).query.q
    );
    res.code(200)
      .header('Content-Type', 'application/json; charset=utf-8')
      .send({ verbs });
  }
}];
