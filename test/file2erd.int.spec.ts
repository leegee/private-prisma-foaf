import fs from 'fs';
import { prisma } from 'testlib/fixtures';
import { Erd } from 'src/erd';
import { GraphIngester } from 'src/ingest-graph';
import { logger, nullLogger } from 'src/logger';

import PrismaTestEnvironment from "testlib/prisma-test-env";
PrismaTestEnvironment.init();

jest.setTimeout(1000 * 30);

const TARGET = 'CIA';

describe('file2erd', () => {

  it('ingests file', async () => {
    const gi = new GraphIngester({
      prisma,
      logger: logger,
      filepath: './test/lib/input.csv',
    });

    await gi.parseFile();

    Object.keys(Erd.layouts).forEach(async (layoutKey) => {
      const savepath = `./output-${layoutKey}.svg`;
      if (fs.existsSync(savepath)) {
        fs.unlinkSync(savepath);
      }

      await new Erd({
        prisma,
        savepath: savepath,
        logger: nullLogger,
        layout: layoutKey,
      }).useGraphviz();

      expect(fs.existsSync(savepath)).toBe(true);

    });

  });

});
