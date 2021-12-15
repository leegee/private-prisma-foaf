import { Readable } from 'stream';
import fs, { PathLike } from 'fs';

import { CsvIngestor } from './csv-ingestor';
import PrismaTestEnvironment from "testlib/prisma-test-env";

jest.setTimeout(1000 * 30);

PrismaTestEnvironment.init({ ingest: false });

let mocks: { [key: string]: any };

beforeEach(() => {
  mocks = {
    ReadStream: jest.fn().mockImplementation(() => {
      const readable = new Readable();
      readable.push('Oswald,assinated,JFK');
      readable.push('Arthur Young,hosted,Oswald');
      readable.push(null);
      return readable;
    }),
    existsSync: jest.spyOn(fs, 'existsSync').mockImplementation(
      (): boolean => false
    ),
  };

  fs.createReadStream = mocks.ReadStream;
  // fs.existsSync = mocks.existsSync;
});


describe.skip('csv-ingestor', () => {
  describe('ingest file', () => {
    it('should read a mock relations file', async () => {
      const gi = new CsvIngestor({
        dao: PrismaTestEnvironment.dao,
      });
      await gi.parsePredicateFile('irrelevant-as-file-not-accessed');
      expect(fs.existsSync).toHaveBeenCalled();
      expect(mocks.ReadStream).toHaveBeenCalled();
    });

    it('should read a mock entity file', async () => {
      const gi = new CsvIngestor({
        dao: PrismaTestEnvironment.dao,
      });
      await gi.parseEntityFile('irrelevant-as-file-not-accessed');
      expect(fs.existsSync).toHaveBeenCalled();
      expect(mocks.ReadStream).toHaveBeenCalled();
    });
  });
});
