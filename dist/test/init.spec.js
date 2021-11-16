import { prisma, setup, teardown } from 'testlib/fixtures';
beforeAll(setup);
afterAll(teardown);
describe('Initial scheme', () => {
    it('has people', async () => {
        const people = await prisma.person.findMany();
        expect(people).toHaveLength(3);
        expect(people[0].knownas).toBe("John F Kennedy");
        expect(people[1].knownas).toBe("Lee Harvey Oswald");
        expect(people[2].knownas).toBe("Arthur Young");
    });
    it('has people with action', async () => {
        const rv = await prisma.action.findMany({
            select: {
                start: true,
                end: true,
                Subject: true,
                Object: true,
                Verb: true,
            }
        });
        expect(rv).toHaveLength(2);
        expect(rv[0].Subject.knownas).toBe('John F Kennedy');
        expect(rv[0].Object.knownas).toBe('Lee Harvey Oswald');
        expect(rv[0].Verb.name).toBe('assassinates');
        expect(rv[0].start).toBeDate('1963-11-22');
        expect(rv[0].end).toBeDate('1963-11-22');
        expect(rv[1].Subject.knownas).toBe('Arthur Young');
        expect(rv[1].Object.knownas).toBe('Lee Harvey Oswald');
        expect(rv[1].Verb.name).toBe('hosts');
        expect(rv[1].start).toBeDate('1963-11-21');
        expect(rv[1].end).toBeDate('1963-11-22');
    });
});
//# sourceMappingURL=init.spec.js.map