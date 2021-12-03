import Fastify, { FastifyInstance, FastifyLoggerInstance, RouteOptions } from 'fastify';
import openapiGlue from 'fastify-openapi-glue';

import { routes as entityRoutes } from './routes/entity';
import { routes as verbRoutes } from './routes/verb';
import { routes as predicateRoutes } from './routes/predicate';
import { prisma } from 'src/service/prisma-client';
import { logger } from 'src/service/logger';
import { DAO } from 'src/service/dao';

const specification = `${__dirname}/../openapi.json`;

export const server: FastifyInstance = Fastify({
  logger: false,
  pluginTimeout: 10000,
});

server.decorateRequest('dao', () => new DAO({ prisma, logger }));
server.decorateRequest('prisma', () => prisma);

/*
server.register(openapiGlue, {
  specification,
  noAdditional: true,
  service: `${__dirname}/routes.js`,
});

server.setErrorHandler((error, _request, reply) => {
  if (error.validation && error.validation.length > 0) {
    const path = error.validation[0].dataPath;
    const field = path.charAt(1).toUpperCase() + path.slice(2);
    const message = `${field}${error.validation[0].message}`;
    reply.status(422).send({ error: { message } });
  }
});
*/

[...entityRoutes, ...verbRoutes, ...predicateRoutes].forEach((route: RouteOptions) => server.route(route));

export const start = async () => {
  try {
    await server.listen(process.env.ERD_PORT || 3000);
    const address = server.server.address();
    const port = typeof address === 'string' ? address : address?.port;
    logger.info(`Server running on port ${port}`);
    return server;
  }

  catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}
