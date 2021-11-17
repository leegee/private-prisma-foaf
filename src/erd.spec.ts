import { IFixtures, prisma, setup, teardown } from 'testlib/fixtures';
import { erd } from './erd';

const testId = 'erd';

let fixtures: IFixtures;

beforeAll(async () => {
  fixtures = await setup(testId)
});

afterAll(async () => await teardown());

describe('erd', () => {
  it('...', async () => {
    const rv = await erd(prisma, 'John F Kennedy');
    expect(rv).toBeDefined();
    // console.dir(rv);
  });
});
