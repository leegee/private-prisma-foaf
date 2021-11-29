import { BaseIngestor } from 'src/ingestor/base-ingestor';
import { logger } from 'src/logger';
import PrismaTestEnvironment from "testlib/prisma-test-env";

PrismaTestEnvironment.init();
jest.setTimeout(1000 * 30);

describe('ingest-graph', () => {
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