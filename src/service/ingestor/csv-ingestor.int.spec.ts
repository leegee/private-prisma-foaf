import fs from 'fs';
import { CsvIngestor } from 'src/service/ingestor/csv-ingestor';
import { Graphviz as Erd } from "src/service/erd/graphviz";
import { logger } from "src/service/logger";

import PrismaTestEnvironment from "testlib/prisma-test-env";

jest.setTimeout(1000 * 30);

PrismaTestEnvironment.init();


describe('ingest-graph', () => {
  it('should integrate with real fs to read a file', async () => {
    const gi = new CsvIngestor({
      dao: PrismaTestEnvironment.dao,
      logger,
    });

    await gi.parseEntityFile('./test/lib/entities.csv')
    await gi.parsePredicateFile('./test/lib/predicates.csv')
    expect(true).toBe(true);
  });

  Object.keys(Erd.layouts).forEach(async (layoutKey) => {
    const savepath = `./output/${layoutKey}.svg`;
    if (fs.existsSync(savepath)) {
      fs.unlinkSync(savepath);
    }

    const erd = await new Erd({
      dao: PrismaTestEnvironment.dao,
      logger,
      savepath: savepath,
      layout: layoutKey,
    });
    await erd.graphviz();

    expect(fs.existsSync(savepath)).toBe(true);

  });

});