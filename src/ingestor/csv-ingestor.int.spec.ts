import fs from 'fs';
import { CsvIngestor } from './csv-ingestor';
import { Graphviz as Erd } from "src/erd/graphviz";
import { logger } from "src/logger";

import PrismaTestEnvironment from "testlib/prisma-test-env";
PrismaTestEnvironment.init();

jest.setTimeout(1000 * 30);


describe('ingest-graph', () => {
  it('should integrate with real fs to read a file', async () => {
    const gi = new CsvIngestor({
      prisma: PrismaTestEnvironment.prisma,
    });

    await gi.parseEntityFile('./test/lib/entities.csv')
    await gi.parsePredicateFile('./test/lib/predicates.csv')
    expect(true).toBe(true);
  });

  Object.keys(Erd.layouts).forEach(async (layoutKey) => {
    const savepath = `./output-${layoutKey}.svg`;
    if (fs.existsSync(savepath)) {
      fs.unlinkSync(savepath);
    }

    const erd = await new Erd({
      prisma: PrismaTestEnvironment.prisma,
      logger,
      savepath: savepath,
      layout: layoutKey,
    });
    await erd.graphviz();

    expect(fs.existsSync(savepath)).toBe(true);

  });

});