import PrismaTestEnvironment from "testlib/prisma-test-env";
import { Entity, Predicate } from '@prisma/client';
import { prisma } from 'testlib/fixtures';
import { DAO, EntityNotFoundError } from 'src/service/dao';

PrismaTestEnvironment.init();
jest.setTimeout(1000 * 40);

let dao: DAO;

beforeEach(() => {
  dao = new DAO({ prisma });
});

describe('erd (int)', () => {

  describe('getEntityPredictive', () => {

    test.each`
    input     | expectedResult
    ${'osw'}  | ${'oswald'}
    ${'OSw'}  | ${'oswald'}
  `('expect $input to lead to $expectedResult', async ({ input, expectedResult }) => {

      const predicates = await dao.getEntityPredictive(input);
      expect(predicates).toBeInstanceOf(Array);
      expect(predicates.length).toBeGreaterThan(0);
      expect(predicates[0].knownas).toEqual(expectedResult);
    })

  });

});
