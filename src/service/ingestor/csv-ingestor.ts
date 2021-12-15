import fs from 'fs';
import { parse } from 'csv-parse';

import { BaseIngestor } from 'src/service/ingestor/base-ingestor';
import { GrammarError, IEntityUpsertArgs, IPredicateUpsertArgs } from 'src/service/dao';

export interface CsvEntityRow {
  knownas: string;
  formalname: string;
  dob?: string;
  dod?: string;
  givenname?: string;
  middlenames?: string;
  familyname?: string;
}

interface CsvPredicateRow {
  Subject: string;
  Verb: string;
  Object: string;
  Comment?: string;
  start?: string;
  end?: string;
}
export class CsvIngestor extends BaseIngestor {

  async _parseCsv(filepath: string, callback: Function): Promise<void> {
    if (!filepath) {
      throw new TypeError('Did not receive a filepath:string');
    }
    this.logger.debug('Enter parseEntityFile for ' + filepath);

    if (!fs.existsSync(filepath)) {
      throw new TypeError(`filepath not found: '${filepath}'`);
    }

    return new Promise((resolve, reject) => {
      const stream = fs.createReadStream(filepath);
      stream.on('error', (error: Error) => {
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
          stream.pause();
          await callback(row);
          stream.resume();
        })
        .on('end', () => {
          this.logger.debug(`Completed ingestion of ${filepath}`);
          resolve();
        });

    });
  }

  async parseEntityFile(filepath: string): Promise<void> {
    return await this._parseCsv(
      filepath,
      (row: CsvEntityRow) => this._createEntity(row as IEntityUpsertArgs),
    );
  }

  async parsePredicateFile(filepath: string): Promise<void> {
    return await this._parseCsv(
      filepath,
      (row: CsvPredicateRow) => {
        this.dao.createPredicate({
          Subject: row.Subject,
          Verb: row.Verb,
          Object: row.Object,
        } as IPredicateUpsertArgs)
      },
    );
  }


}
