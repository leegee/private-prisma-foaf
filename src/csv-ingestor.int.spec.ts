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

  xit('should read a mock file', async () => {
    const gi = new CsvIngester({
      prisma,
      filepath: 'irrelevant-as-file-not-accessed',
      fs: mocks.fs,
    });
    await gi.parseRelationsFile();
    expect(mocks.ReadStream).toHaveBeenCalled();
  });

  xit('_ingestline', () => { });

  it('_createSubjectObjectVerbAction', async () => {
    const gi = new CsvIngester({
      prisma,
      filepath: 'irrelevant-as-file-not-accessed',
      fs: mocks.fs,
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
      filepath: './test/lib/subject-verb-object.csv',
    });

    expect(gi.parseRelationsFile()).resolves.not.toThrow();
  });
});