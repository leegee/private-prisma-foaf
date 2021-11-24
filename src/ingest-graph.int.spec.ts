import { Readable } from "stream";

import { GraphIngester } from './ingest-graph';

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

  // it('should match an Action input line without a comment', async () => {
  //   const gi = new GraphIngester({
  //     prisma,
  //     filepath: 'irrelevant-as-file-not-accessed',
  //     fs: mocks.fs,
  //   });
  //   const reRv = parse('MOCK-SUBJECT,MOCK-VERB,MOCK-OBJECT');
  //   expect(reRv).not.toBeNull();
  //   expect(reRv?.groups).not.toBeUndefined();
  //   expect(reRv?.groups?.subject).toEqual('MOCK-SUBJECT');
  //   expect(reRv?.groups?.verb).toEqual('MOCK-VERB');
  //   expect(reRv?.groups?.object).toEqual('MOCK-OBJECT');
  //   expect(reRv?.groups?.comment).toBeUndefined();
  // });

  // it('should match an Action intput line with a comment', async () => {
  //   const reRv = parse('MOCK-SUBJECT,MOCK-VERB,MOCK-OBJECT,MOCK-COMMENT');
  //   expect(reRv).not.toBeNull();
  //   expect(reRv?.groups).not.toBeUndefined();
  //   expect(reRv?.groups?.subject).toEqual('MOCK-SUBJECT');
  //   expect(reRv?.groups?.verb).toEqual('MOCK-VERB');
  //   expect(reRv?.groups?.object).toEqual('MOCK-OBJECT');
  //   expect(reRv?.groups?.comment).toEqual('MOCK-COMMENT');
  // });

  xit('mock prisma', () => { });

  xit('should read a mock file', async () => {
    const gi = new GraphIngester({
      prisma,
      filepath: 'irrelevant-as-file-not-accessed',
      fs: mocks.fs,
    });
    await gi.parseFile();
    expect(mocks.ReadStream).toHaveBeenCalled();
  });

  xit('_ingestline', () => { });

  it('_createSubjectObjectVerbAction', async () => {
    const gi = new GraphIngester({
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
    const gi = new GraphIngester({
      prisma,
      filepath: './test/lib/input.csv',
    });

    expect(gi.parseFile()).resolves.not.toThrow();
  });
});