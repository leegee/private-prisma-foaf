import { Readable } from "stream";

import { CsvIngester } from './csv-ingestor';

import { prisma } from 'testlib/fixtures';

import PrismaTestEnvironment from "testlib/prisma-test-env";
import { normalise } from "./erd";
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

  it('should read a mock file', async () => {
    const gi = new CsvIngester({
      prisma,
      fs: mocks.fs,
    });
    await gi.parseRelationsFile('irrelevant-as-file-not-accessed');
    expect(mocks.ReadStream).toHaveBeenCalled();
  });


  it('_createSubjectObjectVerbAction', async () => {
    const gi = new CsvIngester({
      prisma,
    });

    try {
      gi._createSubjectObjectVerbAction({
        Subject: 's',
        Verb: 'v',
        Object: 'o',
      });
      gi._createSubjectObjectVerbAction({
        Subject: 's',
        Verb: 'v',
        Object: 'o',
      });
    } catch (e) {
      throw e;
    }
  });


  it('should integrate with real fs to read a file', async () => {
    const gi = new CsvIngester({
      prisma,
    });

    expect(gi.parseRelationsFile('./test/lib/subject-verb-object.csv')).resolves.not.toThrow();
  });
});