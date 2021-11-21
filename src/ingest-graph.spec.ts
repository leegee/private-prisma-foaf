/**
 * @jest-environment ./test/lib/prisma-test-env.ts
 */

const fs: jest.MockedFunction<any> = jest.createMockFromModule('fs');

import { IFixtures, prisma, setup, teardown } from 'testlib/fixtures';

import { parseFile } from './ingest-graph';

import { logger } from './logger';

describe('ingest-graph', () => {
  // https://stackoverflow.com/questions/67216891/jest-mock-fs-file-stream

  it('should read', async () => {

    const mReadStream = {
      pipe: jest.fn().mockReturnThis(),
      on: jest.fn().mockImplementation(function (event, handler) {
        logger.debug('hello', event, handler);
        handler();
        // @ts-ignore: TSError:2683, shadowed 'this'
        return this;
      }),
    };

    (fs.createReadStream as jest.MockedFunction<any>).mockReturnValueOnce(mReadStream);

    try {
      await parseFile(prisma, 'mock-filepath');
    } catch (e) {
      logger.error('Caught:');
      logger.error(e);
    }

    expect(fs.createReadStream).toBeCalledTimes(1);
    expect(mReadStream.pipe).toBeCalledTimes(1);
    expect(mReadStream.on).toBeCalledWith('data', expect.any(Function));
    expect(mReadStream.on).toBeCalledWith('end', expect.any(Function));

  });
});