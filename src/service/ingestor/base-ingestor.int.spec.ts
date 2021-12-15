import { BaseIngestor } from 'src/service/ingestor/base-ingestor';
import { logger } from 'src/service/logger';
import PrismaTestEnvironment from "testlib/prisma-test-env";

PrismaTestEnvironment.setup();
jest.setTimeout(1000 * 30);

describe('base-ingestor (int)', () => {
  it.skip('_createSubjectObjectVerbPredicate', async () => {
    const gi = new BaseIngestor({
      dao: PrismaTestEnvironment.dao,
    });

    let errorFree: boolean;

    try {
      // gi._createPredicate({
      //   Subject: 's',
      //   Verb: 'v',
      //   Object: 'o',
      // });
      // gi._createPredicate({
      //   Subject: 's',
      //   Verb: 'v',
      //   Object: 'o',
      // });

      errorFree = true;
    }

    catch (e) {
      logger.error(e);
      errorFree = false;
    }

    expect(errorFree).toBe(true);

  });
});