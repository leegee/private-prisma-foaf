import type { FetchMockStatic } from 'fetch-mock';
import fetch from 'node-fetch';

// We need this import to get the extra jest assertions

import 'fetch-mock-jest';

// Mock 'node-fetch' with 'fetch-mock-jest'. Note that using
// require here is important, because jest automatically
// hoists `jest.mock()` calls to the top of the file (before
// imports), so if we were to refer to an imported module, we
// would get a `ReferenceError`

jest.mock(
  'node-fetch',
  () => require('fetch-mock-jest').sandbox(),
);

// Cast node-fetch as fetchMock so we can access the
// `.mock*()` methods

const fetchMock = (fetch as unknown) as FetchMockStatic;

describe('code that uses fetch', () => {
  beforeEach(() => fetchMock.reset());

  it('should fetch a simple URL correctly', async () => {
    fetchMock.get('https://example.com', { value: 1234 });
    await fetch('https://example.com');
    expect(fetchMock).toHaveFetched({
      url: 'https://example.com'
    });
  });

  it('should fetch with complex assertions', async () => {
    fetchMock.post(
      'https://example.com/submit',
      { status: 'ok' },
    );

    const result = await fetch(
      'https://example.com/submit',
      {
        method: 'post',
        body: JSON.stringify({
          type: 'create',
          details: {
            username: 'chris',
            passwordToken: 'abcde12345',
          },
        }),
        headers: { 'content-type', 'application/json' },
      },
    );

    // Check we called the right URL, method and
    // part of the body
    expect(fetchMock).toHaveFetched(
      'https://example.com/submit',
      {
        matchPartialBody: true,
        method: 'post',
        body: { type: 'create' },
      }
    );
  });
});