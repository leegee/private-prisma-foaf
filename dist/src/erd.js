export async function erd(prisma, knownas) {
    const rv = await prisma.person.findFirst({
        where: { knownas },
        select: {
            Subject: true,
            Object: true,
        }
    });
    return rv;
}
//# sourceMappingURL=erd.js.map