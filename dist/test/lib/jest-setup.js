"use strict";
expect.extend({
    toBeDate(received, expectedDate) {
        const pass = received.toISOString().substring(0, 10) === expectedDate;
        if (pass) {
            return {
                message: () => `expected ${received} not to be ${expectedDate}`,
                pass: true,
            };
        }
        else {
            return {
                message: () => `expected ${received} to be ${expectedDate}`,
                pass: false,
            };
        }
    },
});
//# sourceMappingURL=jest-setup.js.map