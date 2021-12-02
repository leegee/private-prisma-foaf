import Fastify, { FastifyInstance, RouteOptions } from 'fastify';

import { routes as entityRoutes } from './routes/entity';

export const server: FastifyInstance = Fastify({ logger: false });

entityRoutes.forEach((route: RouteOptions) => server.route(route));

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
