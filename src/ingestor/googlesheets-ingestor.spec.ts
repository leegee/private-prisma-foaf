import { prisma, logger } from 'testlib/fixtures';

import fetchMock from "jest-fetch-mock";

fetchMock.enableMocks();

import {
  GooglesheetsConfigType,
  GooglesheetsIngestor,
  IGooglesheetsIngestorArgs,
} from './googlesheets-ingestor';

const configMock: GooglesheetsConfigType = {
  spreadsheetId: 'mock-spreadsheetId',
  googlesheetsApiKey: 'mock-googlesheetsApiKey',
  sheetName: 'mock-sheetName',
};


describe('code that uses fetch', () => {
  let o: GooglesheetsIngestor;
  beforeEach(() => {
    fetchMock.resetMocks();

    o = new GooglesheetsIngestor({
      prisma,
      logger,
      config: configMock,
    } as IGooglesheetsIngestorArgs);
  });

  it('should init an object', () => {
    expect(o).toBeInstanceOf(GooglesheetsIngestor);
  });

  it('should fetch a simple URL correctly', async () => {
    // fetchMock.mockReject(() => Promise.reject("API failure"));
    fetchMock.mockResponseOnce(
      JSON.stringify({ mockKey: 'mock-value' }),
      { status: 200 }
    );

    o._getGoogleSheetsUrlForSheetName = jest.fn(() => 'mock-url');

    await o._getResource();

    expect(o._getGoogleSheetsUrlForSheetName).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('mock-url');
  });
});
