import Fastify, { FastifyInstance, FastifyLoggerInstance, FastifyRequest, RouteOptions } from 'fastify';
// import openapiGlue from 'fastify-openapi-glue';
import fastifyCors from 'fastify-cors';

import { routes as entityRoutes } from './routes/entity';
import { routes as verbRoutes } from './routes/verb';
import { routes as predicateRoutes } from './routes/predicate';
import { prisma } from 'src/service/prisma-client';
import { DAO } from 'src/service/dao';
import { logger as loggerInstance } from 'src/service/logger';

export type FastifyRequestX = FastifyRequest & {
  dao: DAO
};

export interface IBuildServerArgs {
  logger?: FastifyLoggerInstance | boolean,
  dao?: DAO,
}

let daoInstance: DAO;

export function buildServer({ logger, dao }: IBuildServerArgs = {}) {
  const server: FastifyInstance = Fastify({
    logger: logger || false,
    pluginTimeout: 10000,
    disableRequestLogging: logger ? false : true,
  });

  if (!dao) {
    daoInstance = new DAO({
      prisma,
      logger: logger ? loggerInstance : undefined
    });
  }

  server.addHook(
    "onRequest",
    async (req, _reply) => {
      (req as FastifyRequestX).dao = dao || daoInstance;
      req.log.info({ url: req.raw.url, id: req.id }, "received request");
    }
  );

  server.register(fastifyCors, {
    origin: true
  });

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

export const start = async (args: any) => {
  let server;
  try {
    server = buildServer(args);
    await server.listen(process.env.ERD_PORT || 3000);
    const address = server.server.address();
    const port = typeof address === 'string' ? address : address?.port;
    console.info(`Server running on http://localhost:${port}`);
    return server;
  }

  catch (err) {
    if (server) {
      server.log.error(err)
    } else {
      console.error(err);
    }
    process.exit(-9);
  }
}
