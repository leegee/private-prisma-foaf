import { logger } from "src/logger";
import { prisma } from "testlib/fixtures";

import PrismaTestEnvironment from "testlib/prisma-test-env";
PrismaTestEnvironment.init();


describe('ingest-graph', () => {
  it('should integrate with real fs to read a file', async () => {
    const ent = await prisma.entity.findFirst();
    console.dir(ent, { depth: null });
  });
});