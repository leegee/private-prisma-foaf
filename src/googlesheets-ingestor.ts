import fetch from 'node-fetch';
import { BaseIngestor, ConfigType, IBaseingestorArgs } from './base-ingestor';

export type GooglesheetsConfigType = ConfigType & {
  spreadsheetId: string | undefined,
  googlesheetsapikey: string | undefined,
  sheetName: string | undefined,
}

export interface IGooglesheetsIngestorArgs extends IBaseingestorArgs {
  config?: GooglesheetsConfigType;
}

export class GooglesheetsIngestor extends BaseIngestor {
  config: GooglesheetsConfigType = {
    spreadsheetId: undefined,
    googlesheetsapikey: undefined,
    sheetName: undefined,
  }

  // https://sheets.googleapis.com/v4/spreadsheets/SPREADSHEET_ID/values/RANGE?key=apiKey
  // https://developers.google.com/sheets/api/guides/concepts
  getGoogleSheetsUrlForSheetName(sheetName?: string) {
    return 'https://sheets.googleapis.com/v4/spreadsheets/'
      + this.config.spreadsheetId + '/values/'
      + (sheetName || this.config.sheetName)
      + '?key=' + this.config.googlesheetsapikeykey;
  };

  async _getResource() {
    const url = this.getGoogleSheetsUrlForSheetName();
    console.log('Fetching shop cat data from', url);

    let res, json;

    try {
      res = await fetch(url);
      this.logger.debug(`Fetched "${url}"`);
      json = await res.json();
    }

    catch (e) {
      this.logger.error(e);
    }

    return json;
  }

}
