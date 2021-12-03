import { RouteOptions, RequestGenericInterface } from 'fastify';
import { FastifyRequestX } from '..';

interface FastifyRequestEntity extends FastifyRequestX {
  query: {
    q: string
  },
  dao: any
};

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

  handler: async (req, res) => {
    const entities = await (req as FastifyRequestX).dao.entitySearch(
      (req as FastifyRequestEntity).query.q
    );
    res.send({ entities });
  }
}];
