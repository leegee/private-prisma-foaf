import fs from 'fs';
import { parse } from 'csv-parse';

import { BaseIngestor } from 'src/service/ingestor/base-ingestor';
import { GrammarError } from 'src/service/dao';

export class CsvIngestor extends BaseIngestor {

  async parseEntityFile(filepath: string): Promise<void> {
    if (!filepath) {
      throw new TypeError('Did not receive a filepath:string');
    }
    this.logger.debug('Enter parseEntityFile for ' + filepath);

    return new Promise((resolve, reject) => {

      fs.createReadStream(filepath)
        .on('error', (error: Error) => {
          this.logger.error(error);
          reject(error);
        })
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
        })
        .on('end', () => {
          this.logger.debug(`Completed ingestion of ${filepath}`);
          resolve();
        });

    });
  }

  async parsePredicateFile(filepath: string): Promise<void> {
    if (!filepath) {
      throw new TypeError('did not receive a filepath:string');
    }
    this.logger.debug('Enter parsePredicateFile for ' + filepath);

    if (!fs.existsSync(filepath)) {
      throw new Error('No such file as ' + filepath);
    }

    let reastream;
    try {
      reastream = fs.createReadStream(filepath);
    } catch (e) {
      throw e;
    }

    reastream
      .on('error', (error: Error) => { throw (error) })
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
        await this._createPredicate(row);
      });
  }

  async _createPredicate(row: any) { // xxx
    this.logger.debug('_createSubjectObjectVerbPredicate for row:', row);
    return this.dao.createPredicate({
      Subject: { knownas: row.Subject },
      Verb: { name: row.Verb },
      Object: { knownas: row.Object },
    });
  }
}
