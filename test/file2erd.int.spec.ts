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
    const savepath = [
      './example.one.out.svg',
      './example.all.out.svg',
    ];

    const gi = new GraphIngester({
      prisma,
      logger: nullLogger,
      filepath: './test/lib/input.graph',
    });

    await gi.parseFile();

    savepath.forEach(path => {
      if (fs.existsSync(path)) {
        fs.unlinkSync(path);
      }
    });

    // await new Erd({
    //   savepath: savepath[0],
    //   knownas: TARGET,
    //   prisma,
    //   logger: nullLogger,
    // }).createSvg();

    await new Erd({
      savepath: savepath[1],
      prisma,
      logger,
    }).createSvg();

    savepath.forEach(path => {
      expect(
        fs.existsSync(path)
      ).toBe(true);
    });
  });

});
