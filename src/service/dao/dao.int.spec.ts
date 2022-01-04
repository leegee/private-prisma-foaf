import PrismaTestEnvironment from "testlib/prisma-test-env";
import { prisma } from 'testlib/fixtures';
import { DAO, EntityNotFoundError } from 'src/service/dao';

PrismaTestEnvironment.setup();
jest.setTimeout(1000 * 40);

let dao: DAO;

beforeEach(() => {
  dao = new DAO({ prisma });
});

describe('dao (int)', () => {

  describe('getPredicatesByKnownAs', () => {
    it('throws the correct error when entity not found', () => {
      expect(
        dao.getPredicatesByKnownAs('mock-value-no-entity')
      ).rejects.toThrow(EntityNotFoundError);
    });

    it('returns predicates', async () => {
      let predicates;
      try {
        predicates = await dao.getPredicatesByKnownAs('oswald');
      } catch (e) {
      }
      expect(predicates).toBeInstanceOf(Array);
      if (predicates) {
        expect(predicates[0].Subject.knownas).toEqual('oswald');
      }
    });

  });


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










/*
let assassinatesId: number | null;

it('Find and removes existing predicate', async () => {
  const assassinatesVerb = await prisma.verb.findFirst({
    where: {
      name: 'assassinates',
    },
    select: {
      id: true
    }
  });

  expect(assassinatesVerb).not.toBeNull();

  assassinatesId = assassinatesVerb!.id;

  const predicate = await prisma.predicate.findFirst({
    where: {
      verbId: assassinatesId
    },
    select: {
      subjectId: true,
      verbId: true,
      objectId: true,
    }
  });

  expect(predicate).not.toBeNull();

  const rv = await prisma.predicate.delete({
    where: {
      subjectId_objectId_verbId: {
        subjectId: predicate!.subjectId,
        verbId: predicate!.verbId,
        objectId: predicate!.objectId,
      }
    }
  });

  expect(rv).not.toBeNull();
});
*/