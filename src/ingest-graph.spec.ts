/**
 * @jest-environment ./test/lib/prisma-test-env.ts
 */

import { IFixtures, prisma, setup, teardown } from 'testlib/fixtures';

import { GraphIngester } from './ingest-graph';

import { logger } from './logger';

const { Readable } = require("stream");

const mocks = {
  ReadStream: jest.fn().mockImplementation(() => {
    console.log('Heelo from ReadStream');
    const readable = new Readable();
    readable.push('[Oswald] --> |assinated| [JFK]');
    readable.push('[Arthur Young] --> |hosted| [Oswald]');
    readable.push(null);
    return readable;
  }),

  fs: {
    createReadStream: () => { }
  }
};

mocks.fs.createReadStream = mocks.ReadStream;

describe('ingest-graph', () => {
  it('should match an Action input line without a comment', async () => {

    const reRv = GraphIngester.RE.entity.exec(
      '[MOCK-SUBJECT] --> |MOCK-VERB| [MOCK-OBJECT]'
    );
    expect(reRv).not.toBeNull();
    expect(reRv?.groups).not.toBeUndefined();
    expect(reRv?.groups?.subject).toEqual('MOCK-SUBJECT');
    expect(reRv?.groups?.verb).toEqual('MOCK-VERB');
    expect(reRv?.groups?.object).toEqual('MOCK-OBJECT');
    expect(reRv?.groups?.comment).toBeUndefined();
  });

  it('should match an Action intput line with a comment', async () => {
    const reRv = GraphIngester.RE.entity.exec(
      '[MOCK-SUBJECT] --> |MOCK-VERB| [MOCK-OBJECT] # MOCK-COMMENT'
    );
    expect(reRv).not.toBeNull();
    expect(reRv?.groups).not.toBeUndefined();
    expect(reRv?.groups?.subject).toEqual('MOCK-SUBJECT');
    expect(reRv?.groups?.verb).toEqual('MOCK-VERB');
    expect(reRv?.groups?.object).toEqual('MOCK-OBJECT');
    expect(reRv?.groups?.comment).toEqual('MOCK-COMMENT');
  });

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
});