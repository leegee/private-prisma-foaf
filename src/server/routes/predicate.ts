import { RouteOptions } from 'fastify';
import { FastifyRequestX } from '..';

export const routes: RouteOptions[] = [{
  method: 'POST',
  url: '/predicate',
  schema: {
    body: {
      Subject: { knownas: { type: 'string' } },
      Verb: { name: { type: 'string' } },
      Object: { knownas: { type: 'string' } },
      citation: {
        type: 'array',
        items: { type: 'string' }
      },
      start: { type: 'string', optinal: true },
      end: { type: 'string', optinal: true },
    },
    response: {
      201: {
        type: 'null',
      }
    }
  },

  handler: async function (req, res) {
    // await (req as FastifyRequestX).dao.createPredicate(
    //   (req as FastifyRequestX).body as SimplePredicate
    // );
    req.log.info('---------body:' + JSON.stringify(req.body));

    res.code(201);
    res.send();
  }

}];
