import fetchMock from "jest-fetch-mock";

import { prisma, logger } from 'testlib/fixtures';

import {
  GooglesheetsConfigType,
  GooglesheetsIngestor,
  IGooglesheetsIngestorArgs,
} from './googlesheets-ingestor';

fetchMock.enableMocks();

const configMock: GooglesheetsConfigType = {
  spreadsheetId: 'mock-spreadsheetId',
  googlesheetsApiKey: 'mock-googlesheetsApiKey',
  sheetName: 'mock-sheetName',
};


describe('code that uses fetch', () => {
  let o: GooglesheetsIngestor;
  beforeEach(() => {
    fetchMock.mockClear();
    o = new GooglesheetsIngestor({
      fetch: fetchMock,
      prisma,
      logger,
      config: configMock,
    } as IGooglesheetsIngestorArgs);
  });

  it('should init an object', () => {
    expect(o).toBeInstanceOf(GooglesheetsIngestor);
  });

  it('should fetch a simple URL correctly', async () => {
    fetchMock.mockResponse(
      JSON.stringify({ mockKey: 'mock-value' })
    );

    o._getGoogleSheetsUrlForSheetName = jest.fn(() => 'https://example.com');

    await o._getResource();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('https://example.com');
  });
});
