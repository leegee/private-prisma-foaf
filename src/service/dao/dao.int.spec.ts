import PrismaTestEnvironment from "testlib/prisma-test-env";
import { prisma } from 'testlib/fixtures';
import { DAO } from 'src/service/dao';

PrismaTestEnvironment.setup();
jest.setTimeout(1000 * 40);

let dao: DAO;

beforeEach(() => {
  dao = new DAO({ prisma });
});

describe('dao (int)', () => {

  describe('entity search', () => {
    test.each`
    input     | expectedResult
    ${'osw'}  | ${'oswald'}
    ${'OSw'}  | ${'oswald'}
  `('expect $input to lead to $expectedResult', async ({ input, expectedResult }) => {
      const entities = await dao.entitySearch(input);
      expect(entities).toBeInstanceOf(Array);
      expect(entities.length).toBeGreaterThan(0);
      expect(entities[0].knownas).toEqual(expectedResult);
    })
  });

  describe('verb search', () => {
    test.each`
    input     | expectedResult
    ${'ass'}  | ${'assassinate'}
    ${'Ass'}  | ${'assassinate'}
  `('expect $input to lead to $expectedResult', async ({ input, expectedResult }) => {
      const verbs = await dao.verbSearch(input);
      expect(verbs).toBeInstanceOf(Array);
      expect(verbs.length).toBeGreaterThan(0);
      expect(verbs[0].name).toEqual(expectedResult);
    })
  });

  it('createPredicate', async () => {
    expect(async () => {
      await dao.createPredicate({
        Subject: 'foo',
        Verb: 'baz',
        Object: 'baz',
      });
    }).not.toThrow();
  });

});
