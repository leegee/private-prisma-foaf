import fs from 'fs';
import { Graphviz } from "src/erd/graphviz";
import { logger } from "src/logger";

import PrismaTestEnvironment from "testlib/prisma-test-env";
PrismaTestEnvironment.init();

main();

async function main() {
  Object.keys(Graphviz.layouts).forEach(async (layoutKey) => {
    const savepath = `./output-${layoutKey}.svg`;
    if (fs.existsSync(savepath)) {
      fs.unlinkSync(savepath);
    }

    await new Graphviz({
      prisma: PrismaTestEnvironment.prisma,
      logger,
      savepath: savepath,
      layout: layoutKey,
    }).graphviz();

    console.assert(fs.existsSync(savepath), 'File not written');
    console.info('Exit');
  });
}
