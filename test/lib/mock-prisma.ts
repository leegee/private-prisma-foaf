import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy, mockReset } from 'jest-mock-extended';

export type MockPrisma = DeepMockProxy<PrismaClient>;
export const mockPrisma: MockPrisma = mockDeep<PrismaClient>();

beforeAll(async () => {
  mockReset(mockPrisma);
});
