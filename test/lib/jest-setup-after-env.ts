import fetchMock from "jest-fetch-mock";

fetchMock.enableMocks();

expect.extend({
  toBeDate(received: Date, expectedDate) {
    const pass = received.toISOString().substring(0, 10) === expectedDate;

    if (pass) {
      return {
        message: () => `expected ${received} not to be ${expectedDate}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be ${expectedDate}`,
        pass: false,
      };
    }
  },
});
