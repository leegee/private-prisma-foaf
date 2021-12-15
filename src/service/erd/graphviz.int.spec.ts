import PrismaTestEnvironment from "testlib/prisma-test-env";

import * as fs from 'fs';

import { dao } from 'testlib/fixtures';
import { Graphviz as Erd } from 'src/service/erd/graphviz';

PrismaTestEnvironment.setup();
jest.setTimeout(1000 * 30);

describe('graphviz integration', () => {

  describe('Lee Harvey Oswald', () => {
    it('gets predicates', async () => {
      const erd = new Erd({ dao });
      await erd.getPredicates('Oswald');

      expect(erd.predicates).toBeDefined();

      erd.predicates.forEach((rv) => {
        expect(rv).not.toBeNull();
        expect(rv).toHaveProperty('Subject');
        expect(rv).toHaveProperty('Object');
        expect(rv).toHaveProperty('Verb');
      });
    });
  });


  it('saves one to file', async () => {
    const savepath = './temp-oswald.png';
    if (fs.existsSync(savepath)) {
      fs.unlinkSync(savepath);
    }

    const erd = new Erd({ dao, savepath });
    await erd.graphviz('Oswald');

    expect(fs.existsSync(savepath)).toBeTruthy();

    if (!process.env.CRUFT) {
      fs.unlinkSync(savepath);
    }
  });

  it('without a savepath', async () => {
    const erd = new Erd({ dao });
    const graphstring = await erd.graphviz('Oswald');

    expect(graphstring).toBeDefined();
    expect(graphstring).toMatch(/^<\?\s*xml/i);
  });
});

describe('All', () => {
  it('saves  to file', async () => {
    const savepath = './temp-all.svg';
    if (fs.existsSync(savepath)) {
      fs.unlinkSync(savepath);
    }

    const erd = new Erd({ dao, savepath });
    await erd.graphviz();

    const exists = fs.existsSync(savepath);
    expect(exists).toBeTruthy();

    if (!process.env.CRUFT) {
      fs.unlinkSync(savepath);
    }
  });

});
