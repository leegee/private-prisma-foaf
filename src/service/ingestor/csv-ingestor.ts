import fs from 'fs';
import { parse } from 'csv-parse';

import { BaseIngestor } from './base-ingestor';
import { GrammarError } from '@src/service/dao';

export class CsvIngestor extends BaseIngestor {

  async parseEntityFile(filepath: string): Promise<void> {
    if (!filepath) {
      throw new TypeError('Did not receive a filepath:string');
    }
    this.logger.debug('Enter parseEntityFile for ' + filepath);

    fs.createReadStream(filepath)
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

    fs.createReadStream(filepath)
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
