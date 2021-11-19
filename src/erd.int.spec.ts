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
    const savepath = './temp-int.svg';
    if (fs.existsSync(savepath)) {
      fs.unlinkSync(savepath);
    }

    const erd = new Erd({ prisma, knownas, savepath });
    erd._save(`graph TD; A-->B; A-->C; B-->D; C-->D;`);

    expect(fs.existsSync(savepath)).toBeTruthy();
    fs.unlinkSync(savepath);
  });

  describe('Lee Harvey Oswald', () => {
    it('_getActions', async () => {
      const erd = new Erd({ prisma, knownas, });
      const actionsArray = await erd._getActions();

      expect(actionsArray).toBeDefined();

      actionsArray.forEach((rv) => {
        expect(rv).not.toBeNull();
        expect(rv).toHaveProperty('Subject');
        expect(rv).toHaveProperty('Object');
        expect(rv).toHaveProperty('Verb');
      });
    });

    it('_getActionsGraph', async () => {
      const erd = new Erd({ prisma, knownas, });
      const graph = await erd._getActionsGraph();

      [
        new RegExp('Entity\\d+\\[' + fixtures.oswald.knownas + ']-->\\|' + fixtures.assassinated.name + '\\|Entity\\d+\\[' + fixtures.jfk.knownas + '\\]', 'g'),
        new RegExp('Entity\\d+\\[' + fixtures.arthur.knownas + ']-->\\|' + fixtures.hosted.name + '\\|Entity\\d+\\[' + fixtures.oswald.knownas + '\\]', 'g'),
      ].forEach(re => {
        expect(graph).toMatch(re);
      });
    });

    it('createString', async () => {
      const erd = new Erd({ prisma, knownas });
      const svg = await erd.createString();
      expect(svg).toMatch(/^<svg/);
    });

    it('createFile', async () => {
      const savepath = './temp-createFile.svg';
      if (fs.existsSync(savepath)) {
        fs.unlinkSync(savepath);
      }

      const erd = new Erd({ prisma, knownas, savepath });
      await erd.createFile();

      const exists = fs.existsSync(savepath);

      expect(exists).toBeTruthy();

      if (!process.env.CRUFT) {
        fs.unlinkSync(savepath);
      }
    });

  });
});
