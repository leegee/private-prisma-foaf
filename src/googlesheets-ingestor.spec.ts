import type { FetchMockStatic } from 'fetch-mock';
import fetch from 'node-fetch';
import 'fetch-mock-jest';

// As jest automatically hoists `jest.mock()` calls to before imports,
// without `require`, there would be a `ReferenceError`
jest.mock(
  'node-fetch',
  () => require('fetch-mock-jest').sandbox(),
);

// Cast node-fetch as fetchMock so `.mock*` methods may be accessed
const fetchMock = (fetch as unknown) as FetchMockStatic;

describe('code that uses fetch', () => {
  beforeEach(() => fetchMock.reset());

  it('should fetch a simple URL correctly', async () => {
    fetchMock.get('https://example.com', { value: 1234 });
    await fetch('https://example.com');
    expect(fetchMock).toHaveFetched('https://example.com');
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
            username: 'alice and bobette',
            passwordToken: 'asdfasdf',
          },
        }),
        headers: { 'content-type': 'application/json' },
      },
    );

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
