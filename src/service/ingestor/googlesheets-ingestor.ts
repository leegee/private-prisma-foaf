/**
 * @see https://sheets.googleapis.com/v4/spreadsheets/SPREADSHEET_ID/values/RANGE?key=apiKey
 * @see https://developers.google.com/sheets/api/guides/concepts
 */
import fetch from 'node-fetch';
import { IPredicateUpsertArgs } from '../dao';
import { BaseIngestor, ConfigType as IngestorConfigType, IBaseingestorArgs, IBaseingestorArgs as IBaseIngestorArgs } from './base-ingestor';

export type GooglesheetsConfigType = IngestorConfigType & {
  spreadsheetId: string | undefined,
  googlesheetsApiKey: string | undefined,
  sheetName: string | undefined,
}


export interface IGoogleIngestorArgs extends IBaseingestorArgs {
  config: GooglesheetsConfigType;
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

  constructor({ config, logger, dao }: IGoogleIngestorArgs) {
    super({ logger, dao });
    if (config) {
      this.config = config;
    }
  }

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

  async _getGoogleJson() {
    const url = this._getGoogleSheetsUrlForSheetName();
    this.logger.debug('_getGoogleJson from', url);

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

  async _createPredicate(row: IPredicateUpsertArgs) { // xxx
    this.logger.debug('_createSubjectObjectVerbPredicate for row:', row);
    return this.dao.createPredicate(row);
  }

}
