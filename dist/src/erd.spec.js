import { prisma, setup, teardown } from 'testlib/fixtures';
import { erd } from './erd';
beforeAll(setup);
afterAll(teardown);
describe('erd', () => {
    it('...', async () => {
        const rv = erd(prisma, 'John F Kennedy');
        expect(rv).toBeDefined();
        console.dir(rv);
    });
});
//# sourceMappingURL=erd.spec.js.map