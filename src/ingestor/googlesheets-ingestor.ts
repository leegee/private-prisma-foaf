/**
 * @see https://sheets.googleapis.com/v4/spreadsheets/SPREADSHEET_ID/values/RANGE?key=apiKey
 * @see https://developers.google.com/sheets/api/guides/concepts
 */
import fetch from 'node-fetch';
import { BaseIngestor, ConfigType, IBaseingestorArgs as IBaseIngestorArgs } from './base-ingestor';

export type GooglesheetsConfigType = ConfigType & {
  spreadsheetId: string | undefined,
  googlesheetsApiKey: string | undefined,
  sheetName: string | undefined,
}

export interface IGooglesheetsIngestorArgs extends IBaseIngestorArgs {
  config: GooglesheetsConfigType;
}

export class GooglesheetsIngestor extends BaseIngestor {
  config: GooglesheetsConfigType = {
    spreadsheetId: undefined,
    googlesheetsApiKey: undefined,
    sheetName: undefined,
  };

  _getGoogleSheetsUrlForSheetName(sheetName?: string) {
    if ((sheetName || this.config.sheetName)) {
      throw new TypeError('sheetname not defined');
    }

    // `https://docs.google.com/spreadsheets/d/${this.config.spreadsheetId}/gviz/tq?tqx=out:csv&sheet={${this.config.sheetName}}`;

    return 'https://sheets.googleapis.com/v4/spreadsheets/'
      + this.config.spreadsheetId + '/values/'
      + (sheetName || this.config.sheetName)
      + '?key=' + this.config.googlesheetsApiKey;
  };

  async _getResource() {
    const url = this._getGoogleSheetsUrlForSheetName();
    this.logger.debug('_getResource from', url);

    let res;
    let json;

    try {
      res = await fetch(url);
      this.logger.info(`Fetched "${url}" `, res);
    }
    catch (e) {
      this.logger.error(e);
      throw e;
    }

    try {
      json = await res.json();
    }
    catch (e) {
      this.logger.error(e);
      throw (e);
    }

    return json;
  }

}
