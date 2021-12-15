import { RouteOptions } from 'fastify';
import { SimplePredicateInput } from 'src/service/dao';
import { FastifyRequestX } from '..';

export const routes: RouteOptions[] = [{
  method: 'POST',
  url: '/predicate',
  schema: {
    body: {
      Subject: { type: 'string' },
      Verb: { type: 'string' },
      Object: { type: 'string' },
      Citation: {
        type: 'array',
        items: { type: 'string' },
        optional: true,
      },
      start: { type: 'string', optional: true },
      end: { type: 'string', optional: true },
    },
    response: {
      201: {
        type: 'null',
      }
    }
  },

  handler: async function (req, res) {
    await (req as FastifyRequestX).dao.createPredicate(
      (req as FastifyRequestX).body as SimplePredicateInput
    );

    res.code(201);
    res.send();
  }

}];
