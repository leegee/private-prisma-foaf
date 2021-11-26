import { Readable } from "stream";
import { CsvIngestor } from './csv-ingestor';

import { normalise } from "./erd";
import PrismaTestEnvironment from "testlib/prisma-test-env";
PrismaTestEnvironment.init();

jest.setTimeout(1000 * 30);

const mocks = {
  ReadStream: jest.fn().mockImplementation(() => {
    const readable = new Readable();
    readable.push('[Oswald] --> |assinated| [JFK]');
    readable.push('[Arthur Young] --> |hosted| [Oswald]');
    readable.push(null);
    return readable;
  }),

  fs: { createReadStream: () => { } }
};

mocks.fs.createReadStream = mocks.ReadStream;


describe('ingest-graph', () => {
  describe('normalise', () => {
    test.each`
      input     | expectedResult
      ${' xxxx '}  | ${'xxxx'}
      ${' x  x '}   | ${'x x'}
    `('normalises $input to $expectedResult', ({ input, expectedResult }) => {
      expect(normalise(input)).toBe(expectedResult)
    })
  })

  xit('mock prisma', () => { });
  xit('_ingestline', () => { });

  it('should read a mock relations file', async () => {
    const gi = new CsvIngestor({
      prisma: PrismaTestEnvironment.prisma,
      fs: mocks.fs,
    });
    await gi.parsePredicateFile('irrelevant-as-file-not-accessed');
    expect(mocks.ReadStream).toHaveBeenCalled();
  });

  it('should read a mock entity file', async () => {
    const gi = new CsvIngestor({
      prisma: PrismaTestEnvironment.prisma,
      fs: mocks.fs,
    });
    await gi.parseEntityFile('irrelevant-as-file-not-accessed');
    expect(mocks.ReadStream).toHaveBeenCalled();
  });

  it('_createSubjectObjectVerbPredicate', async () => {
    const gi = new CsvIngestor({
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


  it('should integrate with real fs to read a file', async () => {
    const gi = new CsvIngestor({
      prisma: PrismaTestEnvironment.prisma,
    });

    await gi.parseEntityFile('./test/lib/entities.csv')
    await gi.parsePredicateFile('./test/lib/predicates.csv')
    expect(true).toBe(true);
  });
});