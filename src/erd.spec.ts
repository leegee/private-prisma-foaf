/**
 * @jest-environment ./test/lib/prisma-test-env.ts
 */

import { mockPrisma } from 'testlib/mock-prisma';
import { Erd } from './erd';

const actionFixture = {
  start: new Date(),
  end: new Date(),
  subjectId: 1,
  objectId: 1,
  verbId: 1
};

const personFixture = {
  id: 1,
  knownas: 'Oswald',
  givenname: '',
  middlenames: null,
  familyname: '',
  dob: null,
  dod: null,
  published: false,
};

describe('erd', () => {
  it('_getActions', async () => {

    mockPrisma.action.findMany.mockResolvedValue([actionFixture]);
    mockPrisma.person.findFirst.mockResolvedValue(personFixture);

    const erd = new Erd({ prisma: mockPrisma, knownas: personFixture.knownas, });
    const actionsArray = await erd._getActions();

    expect(actionsArray).toBeDefined();
    expect(actionsArray).toHaveLength(1);
    expect(actionsArray[0]).toEqual(actionFixture);
  });

});
