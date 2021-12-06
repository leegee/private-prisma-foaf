import { prisma } from 'testlib/fixtures';

import PrismaTestEnvironment from 'testlib/prisma-test-env';
PrismaTestEnvironment.init();


describe('stems', () => {
  it('hmmm...', async () => {
    const ents = await prisma.verb.findMany();
    console.dir(ents, { depth: null });
  });
});