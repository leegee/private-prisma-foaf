import { RouteOptions } from 'fastify';
import { SimplePredicate } from 'src/service/dao';
import { FastifyRequestX } from 'src/server';


export const routes: RouteOptions[] = [{
  method: 'PUT',
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
        // type: 'object',
      }
    }
  },

  handler: async function (req, res) {
    // await (req as FastifyRequestX).dao.createPredicate(
    //   (req as FastifyRequestX).body as SimplePredicate
    // );
    this.log.info('xxxxxxxxxxxxxxxxxxxxxxxx201');
    res.code(201);
    res.send();
  }

}];
