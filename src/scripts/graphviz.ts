import fs from 'fs';
import { DAO } from '@src/service/dao';
import { Graphviz } from '@src/service/erd/graphviz';
import { logger } from '@src/service/logger';
import { prisma } from '@src/service/prisma-client';

import PrismaTestEnvironment from '@testlib/prisma-test-env';
PrismaTestEnvironment.init();

main();

async function main() {
  Object.keys(Graphviz.layouts).forEach(async (layoutKey) => {
    const savepath = `./output/${layoutKey}.svg`;
    if (fs.existsSync(savepath)) {
      fs.unlinkSync(savepath);
    }

    await new Graphviz({
      dao: new DAO({ logger, prisma }),
      logger,
      savepath: savepath,
      layout: layoutKey,
    }).graphviz();

    console.assert(fs.existsSync(savepath), 'File not written');
    console.info('Exit');
  });
}
