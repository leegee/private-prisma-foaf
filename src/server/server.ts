import Fastify, { FastifyInstance, RouteOptions } from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';

import { Entity } from '@prisma/client';

export const server: FastifyInstance = Fastify({ logger: true });

server.route({
  method: 'GET',
  url: '/entity',
  // To move to external to be shared by e2e tests, etc
  schema: {
    querystring: {
      q: { type: 'string' },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          entities: { knownas: 'string', formalname: 'string' } // How to use Entity[]?
        }
      }
    }
  },

  handler: function (req, res) {
    res.send({ hello: 'world' });
  }
} as RouteOptions);

export const start = async () => {
  try {
    await server.listen(process.env.ERD_PORT || 3000);
    const address = server.server.address();
    const port = typeof address === 'string' ? address : address?.port;
    console.debug(`Server running on port ${port}`);
    return server;
  }

  catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}
