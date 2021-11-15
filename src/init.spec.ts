import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Initial scheme', () => {
  it('has people', async () => {
    const allUsers = await prisma.person.findMany()
    expect(allUsers).toEqual([])
  });
});



// async function main() {
//   const allUsers = await prisma.person.findMany()
//   console.dir(allUsers, { depth: null })
// }

// main()
//   .catch(e => {
//     throw e
//   })
//   .finally(async () => {
//     await prisma.$disconnect()
//   });
