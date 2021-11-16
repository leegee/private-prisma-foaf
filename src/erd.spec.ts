import { prisma, setup, teardown } from 'testlib/fixtures';
import { erd } from './erd';

const testId = 'erd';

const fixtures = beforeAll(async () => {
  return await setup(testId)
});

afterAll(async () => await teardown(fixtures));

describe('erd', () => {
  it('...', async () => {
    const rv = await erd(prisma, 'John F Kennedy');
    expect(rv).toBeDefined();
    console.dir(rv);
  });
});
