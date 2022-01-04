import { BaseIngestor } from 'src/service/ingestor/base-ingestor';
import PrismaTestEnvironment from "testlib/prisma-test-env";
import { DAO } from '../dao';

PrismaTestEnvironment.setup();
jest.setTimeout(1000 * 30);

describe('base-ingestor (int)', () => {
  it.skip('_createPredicate', async () => {
    const ingestor = new BaseIngestor({
      dao: PrismaTestEnvironment.dao,
    });

    expect(ingestor).toBeInstanceOf(BaseIngestor);
    expect(ingestor.dao).toBeInstanceOf(DAO);

  });
});