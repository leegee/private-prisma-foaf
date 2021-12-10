import { RouteOptions } from 'fastify';
import { Graphviz } from 'src/service/erd/graphviz';
import { FastifyRequestX } from '..';

export const routes: RouteOptions[] = [{
  method: 'GET',
  url: '/graph',
  handler: async (req, res) => {

    const graphviz = new Graphviz({
      dao: (req as FastifyRequestX).dao,
      logger: req.log
    });

    const erd: string = await graphviz.graphviz() || '';

    res.code(200)
      .type('image/svg+xml')
      .header('Content-Disposition', 'filename="graph.svg"')
      .send(erd);
  }
}];
