import { BaseIngestor } from './base-ingestor';

import PrismaTestEnvironment from "testlib/prisma-test-env";
PrismaTestEnvironment.init();

jest.setTimeout(1000 * 30);

describe('ingest-graph', () => {
  it('_createSubjectObjectVerbPredicate', async () => {
    const gi = new BaseIngestor({
      prisma: PrismaTestEnvironment.prisma,
    });

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
    } catch (e) {
      throw e;
    }
  });
});