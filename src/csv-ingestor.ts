import * as fsImport from 'fs';
import { parse } from 'csv-parse';

import { Baseingestor, GrammarError } from './base-ingestor';

export class CsvIngestor extends Baseingestor {

  async parseEntityFile(filepath: string): Promise<void> {
    if (!filepath) {
      throw new TypeError('did not receive a filepath:string');
    }
    this.logger.debug('Enter parseEntityFile for ' + filepath);

    this.fs
      .createReadStream(filepath)
      .on('error', (error: Error) => this.logger.error(error))
      .pipe(
        parse({
          columns: true,
          trim: true,
          relax_column_count_less: true,
          skip_empty_lines: true,
        }),
      )
      .on('data', async (row) => {
        if (!row) {
          throw new GrammarError(`inputTextline: "${row}"`);
        }
        await this._createEntity(row);
      });
  }

  async parsePredicateFile(filepath: string): Promise<void> {
    if (!filepath) {
      throw new TypeError('did not receive a filepath:string');
    }
    this.logger.debug('Enter parsePredicateFile for ' + filepath);

    this.fs
      .createReadStream(filepath)
      .on('error', (error: Error) => this.logger.error(error))
      .pipe(
        parse({
          columns: true,
          trim: true,
          relax_column_count_less: true,
          skip_empty_lines: true,
        }),
      )
      .on('data', async (row) => {
        if (!row) {
          throw new GrammarError(`inputTextline: "${row}"`);
        }
        await this._createSubjectObjectVerbPredicate(row);
      });
  }

}
