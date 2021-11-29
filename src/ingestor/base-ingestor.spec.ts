import * as BaseIngestor from 'src/ingestor/base-ingestor';

describe('ingest-graph', () => {
  it('exports GrammarError Error', () => {
    expect(BaseIngestor.GrammarError).toBeDefined();

    const e = new BaseIngestor.GrammarError('mock-message');
    expect(e).toBeInstanceOf(Error);
    expect(e).toHaveProperty('message');
    expect(e.message).toBe('mock-message');
  });
});
