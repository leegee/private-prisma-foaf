import Fastify, { FastifyInstance, RouteOptions } from 'fastify';

export const server: FastifyInstance = Fastify({ logger: false });

import { routes as entityRoutes } from './routes/entity';

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
