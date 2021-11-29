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
    fetchMock.mockResponseOnce(
      JSON.stringify({ mockKey: 'mock-value' }),
      { status: 200 }
    );

    o._getGoogleSheetsUrlForSheetName = jest.fn(() => 'irrelevant-never-called');

    await o._getResource();

    expect(o._getGoogleSheetsUrlForSheetName).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('irrelevant-never-called');
  });
});
