/**
 * @jest-environment ./test/lib/prisma-test-env.ts
 */

import * as fs from 'fs';

import { IFixtures, prisma, setup, teardown } from 'testlib/fixtures';
import { Erd } from './erd';

let fixtures: IFixtures;
let knownas: string;

beforeAll(async () => {
  fixtures = await setup();
  knownas = fixtures.oswald.knownas;
});

afterAll(async () => {
  await teardown();
});

describe('erd', () => {
  it('_save', async () => {
    const savepath = './temp-int.png';
    if (fs.existsSync(savepath)) {
      fs.unlinkSync(savepath);
    }

    const erd = new Erd({ prisma, knownas, savepath });
    erd.useGraphviz('CIA -> JFK');

    expect(fs.existsSync(savepath)).toBeTruthy();
    fs.unlinkSync(savepath);
  });

  describe('Lee Harvey Oswald', () => {
    it('gets subject-verb-object', async () => {
      const erd = new Erd({ prisma, knownas, });
      await erd._populateActionsForKnownAs();

      expect(erd.actions).toBeDefined();

      erd.actions.forEach((rv) => {
        expect(rv).not.toBeNull();
        expect(rv).toHaveProperty('Subject');
        expect(rv).toHaveProperty('Object');
        expect(rv).toHaveProperty('Verb');
      });
    });

    it('creates a valid graph', async () => {
      const erd = new Erd({ prisma, knownas, });
      expect(erd.actions).toHaveLength(0);

      await erd._populateActionsForKnownAs();
      expect(erd.actions.length).toBeGreaterThan(0);

      const graph = await erd._populateActions();
      expect(graph).toBeDefined();

      [
        new RegExp('Entity\\d+\\[' + fixtures.oswald.knownas + ']-->\\|' + fixtures.assassinated.name + '\\|Entity\\d+\\[' + fixtures.jfk.knownas + '\\]', 'g'),
        new RegExp('Entity\\d+\\[' + fixtures.arthur.knownas + ']-->\\|' + fixtures.hosted.name + '\\|Entity\\d+\\[' + fixtures.oswald.knownas + '\\]', 'g'),
      ].forEach(re => {
        expect(graph).toMatch(re);
      });
    });

    it('saves  to file', async () => {
      const savepath = './temp-oswald.png';
      if (fs.existsSync(savepath)) {
        fs.unlinkSync(savepath);
      }

      const erd = new Erd({ prisma, knownas, savepath });
      await erd.useGraphviz();

      const exists = fs.existsSync(savepath);
      expect(exists).toBeTruthy();

      if (!process.env.CRUFT) {
        fs.unlinkSync(savepath);
      }
    });
  });

  describe('All', () => {
    it('saves  to file', async () => {
      const savepath = './temp-all.png';
      if (fs.existsSync(savepath)) {
        fs.unlinkSync(savepath);
      }

      const erd = new Erd({ prisma, savepath });
      await erd.useGraphviz();

      const exists = fs.existsSync(savepath);
      expect(exists).toBeTruthy();

      if (!process.env.CRUFT) {
        fs.unlinkSync(savepath);
      }
    });
  });
});
