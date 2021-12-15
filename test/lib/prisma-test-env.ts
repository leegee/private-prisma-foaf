/* eslint-disable @typescript-eslint/no-var-requires */

// Can remove pg and use prsima's cx
// @see https://github.com/ctrlplusb/prisma-pg-jest/blob/master/prisma/prisma-test-environment.js
// @see https://jestjs.io/docs/configuration#testenvironment-string

import { Client } from 'pg';
import type { Config } from '@jest/types';
import dotenv from 'dotenv';
dotenv.config;

import { prisma, dao, logger } from 'testlib/fixtures';

import NodeEnvironment from 'jest-environment-node';
import child_process from 'child_process';

import { CsvIngestor } from 'src/service/ingestor/csv-ingestor';

const prismaBinary = 'npx prisma';

process.on('uncaughtException', (error) => {
  logger.error(error);
  process.exit(1);
})

process.on('unhandledRejection', (error) => {
  logger.error(error);
  process.exit(1);
})


export default class PrismaTestEnvironment extends NodeEnvironment {
  static prisma = prisma;
  static dao = dao;

  /** Maybe faster to load public and copy to test schema when needed */
  static setup({ ingest }: { ingest: boolean } = { ingest: true }) {
    logger.debug('PrismaTestEnvironment.init Enter');
    let testEnv: PrismaTestEnvironment;

    beforeEach(async () => {
      logger.debug('PrismaTestEnvironment beforeEach enter');

      testEnv = new PrismaTestEnvironment();
      await testEnv.setup();

      if (ingest) {
        const gi = new CsvIngestor({ dao, logger });

        await gi.parsePredicateFile('./test/lib/predicates.csv');
      }

      logger.debug('PrismaTestEnvironment beforeEach leave');
    });

    afterEach(async () => {
      if (testEnv) {
        logger.debug('PrismaTestEnvironment afterEach enter');
        await testEnv.teardown();
        logger.debug('PrismaTestEnvironment after afterEach Leave');
      }
    });

    logger.debug('PrismaTestEnvironment.init Leave');
  }

  schema = '';
  connectionString = '';

  constructor(config?: Config.ProjectConfig) {
    super(config ? config : {} as Config.ProjectConfig);
    // Generate a unique schema identifier for this test context
    this.schema = `erdtest_${+ new Date()}_${process.hrtime.bigint()}`;
    this.connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@localhost:${process.env.DB_PORT}/${process.env.DB_NAME}?schema=${this.schema}`;
    logger.debug(`Init new test env with temporary schema: ${this.schema}`);
  }

  async setup() {
    // Set the required environment variable to contain the connection string for the database test schema
    process.env.DATABASE_URL = this.connectionString;
    this.global.process.env.DATABASE_URL = this.connectionString;

    logger.debug(`Running migrations - creating test env temp schema, ${this.schema}.`);
    child_process.execSync(`${prismaBinary} migrate deploy`);
    logger.debug(`Running migrations - done ${this.schema}.`);

    logger.debug('Test env setup almost done');
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
    logger.debug(`Dropping test env temp schema, ${this.schema}.`);
    await client.query(`DROP SCHEMA IF EXISTS "${this.schema}" CASCADE`);
    logger.debug(`Dropped test env temp schema, ${this.schema}.`);
    await client.end();
  }
}
