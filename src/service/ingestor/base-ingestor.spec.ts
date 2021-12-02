import * as BaseIngestor from 'src/service/ingestor/base-ingestor';
import { prisma } from 'testlib/fixtures';

import each from 'jest-each';

describe('base-ingestor', () => {
  it('exports GrammarError Error', () => {
    expect(BaseIngestor.GrammarError).toBeDefined();

    const e = new BaseIngestor.GrammarError('mock-message');
    expect(e).toBeInstanceOf(Error);
    expect(e).toHaveProperty('message');
    expect(e.message).toBe('mock-message');
  });

  each([
    {},
    { Subject: 1, Object: 2 },
    { Subject: 1, Verb: 2 },
    { Verb: 1, Object: 2 }
  ]).test('throws GrammarError on bad args', async (args) => {
    const o = new BaseIngestor.BaseIngestor({ prisma });
    await expect(
      async () => o._createSubjectObjectVerbPredicate(args as BaseIngestor.IPredicateUpsertArgs)
    ).rejects.toThrowError(BaseIngestor.GrammarError);
  });


  it('_createEntity', async () => {

  });
});
