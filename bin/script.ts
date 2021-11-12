import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const allUsers = await prisma.person.findMany({
    include: { person2person: true },
  })
  console.dir(allUsers, { depth: null })
}

main()
  .catch(e => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  });
