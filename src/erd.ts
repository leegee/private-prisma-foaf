import { PrismaClient, Prisma } from "@prisma/client";

export async function erd(
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>,
  knownas: string
) {
  console.log('knownas: ', knownas);

  const rv = await prisma.person.findFirst({
    where: { knownas },
    select: { id: true }
  });

  return rv;
}
