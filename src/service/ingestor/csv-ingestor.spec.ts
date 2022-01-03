import { Readable } from 'stream';
import fs, { PathLike } from 'fs';

import { CsvIngestor } from './csv-ingestor';
import PrismaTestEnvironment from "testlib/prisma-test-env";

jest.setTimeout(1000 * 30);

PrismaTestEnvironment.setup({ ingest: false });

beforeEach(() => {
  fs.createReadStream = jest.fn().mockImplementation(() => {
    const readable = new Readable();
    readable.push('Oswald,assinated,JFK');
    readable.push('Arthur Young,hosted,Oswald');
    readable.push(null);
    return readable;
  });
});


describe('csv-ingestor', () => {
  describe('ingest file', () => {

    describe('file exists', () => {
      beforeEach(() => {
        jest.spyOn(fs, 'existsSync').mockImplementation(
          (path: PathLike): boolean => true
        )
      });

      it('should read a mock relations file', async () => {
        const gi = new CsvIngestor({
          dao: PrismaTestEnvironment.dao,
        });
        await gi.parsePredicateFile('irrelevant-as-file-not-accessed');
        expect(fs.existsSync).toHaveBeenCalled();
        expect(fs.createReadStream).toHaveBeenCalled();
      });

      it('should read a mock entity file', async () => {
        const gi = new CsvIngestor({
          dao: PrismaTestEnvironment.dao,
        });
        await gi.parseEntityFile('irrelevant-as-file-not-accessed');
        expect(fs.existsSync).toHaveBeenCalled();
        expect(fs.createReadStream).toHaveBeenCalled();
      });
    });
  });


  describe('file does not exist', () => {
    beforeEach(() => {
      jest.spyOn(fs, 'existsSync').mockImplementation(
        (path: PathLike): boolean => false
      )
    });

    it('should read a mock relations file', async () => {
      const gi = new CsvIngestor({
        dao: PrismaTestEnvironment.dao,
      });
      try {
        await gi.parsePredicateFile('irrelevant-as-file-not-accessed');
      } catch (e) {
        expect(e).toBeInstanceOf(TypeError);
      }
      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.createReadStream).not.toHaveBeenCalled();
    });

    it('should read a mock entity file', async () => {
      const gi = new CsvIngestor({
        dao: PrismaTestEnvironment.dao,
      });
      try {
        await gi.parseEntityFile('irrelevant-as-file-not-accessed');
      } catch (e) {
        expect(e).toBeInstanceOf(TypeError);
      }
      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.createReadStream).not.toHaveBeenCalled();
    });
  });
});


