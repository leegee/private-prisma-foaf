import fs from 'fs';
import { IFixtures, prisma } from 'testlib/fixtures';
import { Erd } from 'src/erd';
import { CsvIngester } from 'src/ingest-graph';
import { nullLogger } from 'src/logger';

import PrismaTestEnvironment from "testlib/prisma-test-env";

jest.setTimeout(1000 * 30);

const TARGET = 'CIA';

let fixtures: IFixtures = {};
let knownas: string = '';

PrismaTestEnvironment.init();

describe('file2erd', () => {
  it('ingested file', async () => {
    Object.keys(Erd.layouts).forEach(async (layoutKey) => {
      const savepath = `./output-${layoutKey}.svg`;
      if (fs.existsSync(savepath)) {
        fs.unlinkSync(savepath);
      }

      const erd = await new Erd({
        prisma,
        savepath: savepath,
        logger: nullLogger,
        layout: layoutKey,
      });
      await erd.graphviz();

      expect(fs.existsSync(savepath)).toBe(true);

    });

  });

});
