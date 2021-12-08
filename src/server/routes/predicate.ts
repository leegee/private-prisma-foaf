import { RouteOptions } from 'fastify';
import { FastifyRequestX } from '..';

export const routes: RouteOptions[] = [{
  method: 'PUT',
  url: '/predicate',
  // Todo: move to external file, to be shared by e2e tests, etc - autocreate from TS types...?
  schema: {
    body: {
      Subject: { knownas: { type: 'string' } },
      Verb: { name: { type: 'string' } },
      Object: { knownas: { type: 'string' } },
      citation: {
        type: 'array',
        items: { type: 'string' }
      },
      // start: { type: 'string' },
      // end: { type: 'string' },
    },
    response: {
      201: {
        // type: 'object',
      }
    }
  },

  handler: async function (req, res) {
    // await (req as FastifyRequestX).dao.createPredicate(
    //   (req as FastifyRequestX).body as SimplePredicate
    // );
    this.log.info('xxxxxxxxxxxxxxxxxxxxxxxx201', (req as FastifyRequestX).body);

    res.code(201);
    res.send();
  }

}];
