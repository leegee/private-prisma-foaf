import fs from 'fs';
import { Erd } from 'src/erd';
import { logger } from 'src/logger';

import PrismaTestEnvironment from "testlib/prisma-test-env";

PrismaTestEnvironment.init();


describe('file2erd', () => {
  it('ingested file', async () => {
    jest.setTimeout(1000 * 30);

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

});
