import Fastify, { FastifyInstance, FastifyRequest, RouteOptions } from 'fastify';
// import openapiGlue from 'fastify-openapi-glue';

import { routes as entityRoutes } from './routes/entity';
import { routes as verbRoutes } from './routes/verb';
import { routes as predicateRoutes } from './routes/predicate';
import { prisma } from 'src/service/prisma-client';
import { ILogger, logger } from 'src/service/logger';
import { DAO } from 'src/service/dao';

export type FastifyRequestX = FastifyRequest & {
  dao: DAO
};

export interface IBuildServerArgs {
  logger?: ILogger,
  dao?: DAO,
}

export function buildServer({ logger, dao }: IBuildServerArgs = {}) {

  const server: FastifyInstance = Fastify({
    logger: false,
    pluginTimeout: 10000,
  });

  dao = dao || new DAO({ prisma, logger });

  // Not shared, but made per request:
  server.addHook("onRequest", async (req) => (req as FastifyRequestX).dao = dao!);

  [...entityRoutes, ...verbRoutes, ...predicateRoutes].forEach((route: RouteOptions) => server.route(route));
  return server;
}


/*
// const specification = `${__dirname}/../openapi.json`;
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

export const start = async (...args: any) => {
  let server;
  try {
    server = buildServer(args);
    await server.listen(process.env.ERD_PORT || 3000);
    const address = server.server.address();
    const port = typeof address === 'string' ? address : address?.port;
    logger.info(`Server running on port ${port}`);
    return server;
  }

  catch (err) {
    server ? server.log.error(err) : console.error(err);
    process.exit(1);
  }
}
