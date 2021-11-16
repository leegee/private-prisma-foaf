import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();
export async function setup() {
    const assassinates = await prisma.verb.create({
        data: { name: 'assassinates' }
    });
    const hosts = await prisma.verb.create({
        data: { name: 'hosts' }
    });
    const jfk = await prisma.person.create({
        data: { knownas: 'John F Kennedy', },
    });
    const oswald = await prisma.person.create({
        data: { knownas: 'Lee Harvey Oswald', },
    });
    const arthur = await prisma.person.create({
        data: { knownas: 'Arthur Young', },
    });
    await prisma.action.create({
        data: {
            verbId: assassinates.id,
            subjectId: jfk.id,
            objectId: oswald.id,
            start: new Date('1963-11-22'),
            end: new Date('1963-11-22'),
        },
    });
    // https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries#create-a-new-profile-record-then-connect-it-to-an-existing-user-record-or-create-a-new-user
    await prisma.action.create({
        data: {
            verbId: hosts.id,
            subjectId: arthur.id,
            objectId: oswald.id,
            start: new Date('1963-11-21'),
            end: new Date('1963-11-22'),
        },
    });
}
export async function teardown() {
    await prisma.action.deleteMany();
    await prisma.verb.deleteMany();
    await prisma.person.deleteMany();
    await prisma.$disconnect();
}
//# sourceMappingURL=fixtures.js.map