import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy, mockReset } from 'jest-mock-extended';
import { DAO } from 'src/service/dao';

export type MockPrisma = DeepMockProxy<PrismaClient>;
export const mockPrisma: MockPrisma = mockDeep<PrismaClient>();

beforeAll(async () => {
  mockReset(mockPrisma);
});

export const mockDao = new DAO({ prisma: mockPrisma });