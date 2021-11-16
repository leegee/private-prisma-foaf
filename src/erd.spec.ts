import { prisma, setup, teardown } from 'testlib/fixtures';
import { erd } from './erd';

beforeAll(async () => await setup);
afterAll(async () => await teardown);

describe('erd', () => {
  it('...', async () => {
    const rv = await erd(prisma, 'John F Kennedy');
    expect(rv).toBeDefined();
    console.dir(rv);
  });
});
