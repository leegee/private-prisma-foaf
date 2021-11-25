/* eslint-disable @typescript-eslint/no-var-requires */

// @see https://github.com/ctrlplusb/prisma-pg-jest/blob/master/prisma/prisma-test-environment.js
// @see https://jestjs.io/docs/configuration#testenvironment-string

require('dotenv').config();
import { PrismaClient } from '@prisma/client';
import { Client } from "pg";
import NodeEnvironment from "jest-environment-node";
import child_process from "child_process";

import { IFixtures, setup, teardown } from 'testlib/fixtures';
import { logger } from '../../src/logger';
import { CsvIngester } from "src/csv-ingestor";

const prismaBinary = 'npx prisma';

jest.setTimeout(1000 * 30);

export const prisma = new PrismaClient({
  log: ['warn', 'error'], // 'query', 'info', 'warn', 'error'],
});


export default class PrismaTestEnvironment extends NodeEnvironment {

  /** Maybe faster to load public and copy to test schema when needed */
  static init() {
    logger.debug('PrismaTestEnvironment.init Enter');
    let testEnv: PrismaTestEnvironment;

    beforeEach(async () => {
      logger.debug('PrismaTestEnvironment beforeEach enter');
      testEnv = new PrismaTestEnvironment({});
      await testEnv.setup();

      const gi = new CsvIngester({
        prisma,
        logger,
        filepath: './test/lib/input.csv',
      });

      await gi.parseFile();

      logger.debug('PrismaTestEnvironment beforeEach leave');
    });

    afterEach(async () => {
      logger.debug('PrismaTestEnvironment afterEach enter');
      await testEnv.teardown();
      logger.debug('PrismaTestEnvironment after afterEach Leave');
    });

    logger.debug('PrismaTestEnvironment.init Leave');
  }

  schema = '';
  connectionString = '';

  constructor(config: any) {
    super(config);

    // Generate a unique schema identifier for this test context
    this.schema = `test_${+ new Date()}_${process.hrtime.bigint()}`;

    logger.info(`Init new test env with temporary schema: ${this.schema}`);

    // Generate the pg connection string for the test schema
    this.connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@localhost:${process.env.DB_PORT}/${process.env.DB_NAME}?schema=${this.schema}`;
  }

  setup() {
    // Set the required environment variable to contain the connection string for the database test schema
    process.env.DATABASE_URL = this.connectionString;
    this.global.process.env.DATABASE_URL = this.connectionString;

    // Run the migrations to ensure our schema has the required structure
    child_process.execSync(`${prismaBinary} migrate deploy`);

    logger.info('Test env setup almost done');
    return super.setup();
  }

  // Drop the schema after the tests have completed
  async teardown() {
    await prisma.$disconnect();

    // todo: use prisma.query:-
    const client = new Client({
      connectionString: this.connectionString,
    });
    await client.connect();
    logger.info(`Dropping test env temp schema, ${this.schema}.`);
    await client.query(`DROP SCHEMA IF EXISTS "${this.schema}" CASCADE`);
    await client.end();
    logger.info(`Dropped test env temp schema, ${this.schema}.`);
  }
}
