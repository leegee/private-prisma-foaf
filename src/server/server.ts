import Fastify, { FastifyInstance, RouteOptions } from 'fastify';

export const server: FastifyInstance = Fastify({ logger: true });

server.route({
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
} as RouteOptions);

export const start = async () => {
  try {
    await server.listen(process.env.ERD_PORT || 3000);
    // const address = server.server.address();
    // const port = typeof address === 'string' ? address : address?.port;
    // console.debug(`Server running on port ${port}`);
    return server;
  }

  catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}
