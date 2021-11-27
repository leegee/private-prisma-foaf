import { Readable } from 'stream';

import { CsvIngestor } from './csv-ingestor';

import PrismaTestEnvironment from "testlib/prisma-test-env";
PrismaTestEnvironment.init();

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

describe('file2erd', () => {
  it('ingested file', async () => {
    jest.setTimeout(1000 * 30);

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


  });

});
