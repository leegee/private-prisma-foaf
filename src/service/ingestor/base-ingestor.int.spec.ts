import { BaseIngestor } from 'src/service/ingestor/base-ingestor';
import { logger } from 'src/service/logger';
import PrismaTestEnvironment from "testlib/prisma-test-env";

PrismaTestEnvironment.init();
jest.setTimeout(1000 * 30);

describe('base-ingestor (int)', () => {
  it('_createSubjectObjectVerbPredicate', async () => {
    const gi = new BaseIngestor({
      prisma: PrismaTestEnvironment.prisma,
    });

    let errorFree: boolean;

    try {
      gi._createSubjectObjectVerbPredicate({
        Subject: 's',
        Verb: 'v',
        Object: 'o',
      });
      gi._createSubjectObjectVerbPredicate({
        Subject: 's',
        Verb: 'v',
        Object: 'o',
      });

      errorFree = true;
    }

    catch (e) {
      logger.error(e);
      errorFree = false;
    }

    expect(errorFree).toBe(true);

  });
});