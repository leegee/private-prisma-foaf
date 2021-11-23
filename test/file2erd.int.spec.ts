// /**
//  * @xxx-jest-environment ./test/lib/prisma-test-env.ts
//  */

import { prisma } from 'testlib/fixtures';
import { Erd } from 'src/erd';
import { GraphIngester } from 'src/ingest-graph';

// import PrismaTestEnvironment from "testlib/prisma-test-env";
// PrismaTestEnvironment.init();

jest.setTimeout(1000 * 30);


describe('file2erd', () => {
  it('ingests', async () => {
    const gi = new GraphIngester({
      prisma,
      filepath: './test/lib/input.graph',
    });

    expect(gi.parseFile()).resolves.not.toThrow;
  });

  it('graphs', async () => {
    const erd = new Erd({
      prisma,
      knownas: 'Jeffrey Mishlove',
      savepath: './example.out.svg'
    });
    expect(erd.createFileForOne()).resolves.not.toThrow();
  });
});
