import PrismaTestEnvironment from "testlib/prisma-test-env";

import * as fs from 'fs';

import { prisma } from 'testlib/fixtures';
import { Graphviz as Erd } from 'src/erd/graphviz';

PrismaTestEnvironment.init();
jest.setTimeout(1000 * 30);

describe('graphviz integration', () => {

  describe('Lee Harvey Oswald', () => {
    it('gets predicates', async () => {
      const erd = new Erd({ prisma });
      await erd._populatePredicates('Oswald');

      expect(erd.predicates).toBeDefined();

      erd.predicates.forEach((rv) => {
        expect(rv).not.toBeNull();
        expect(rv).toHaveProperty('Subject');
        expect(rv).toHaveProperty('Object');
        expect(rv).toHaveProperty('Verb');
      });
    });
  });


  it('saves to file', async () => {
    const savepath = './temp-oswald.png';
    if (fs.existsSync(savepath)) {
      fs.unlinkSync(savepath);
    }

    const erd = new Erd({ prisma, savepath });
    await erd.graphviz('Oswald');

    expect(fs.existsSync(savepath)).toBeTruthy();

    if (!process.env.CRUFT) {
      fs.unlinkSync(savepath);
    }
  });
});

describe('All', () => {
  it('saves  to file', async () => {
    const savepath = './temp-all.svg';
    if (fs.existsSync(savepath)) {
      fs.unlinkSync(savepath);
    }

    const erd = new Erd({ prisma, savepath });
    await erd.graphviz();

    const exists = fs.existsSync(savepath);
    expect(exists).toBeTruthy();

    if (!process.env.CRUFT) {
      fs.unlinkSync(savepath);
    }
  });

});
