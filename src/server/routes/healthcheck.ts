import { RouteOptions } from 'fastify';

export const routes: RouteOptions[] = [{
  method: 'GET',
  url: '/healthcheck',
  handler: async (_req, res) => {
    res.code(200).send();
  }
}];
