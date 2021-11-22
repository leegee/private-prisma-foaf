/* eslint-disable @typescript-eslint/no-var-requires */

// @see https://github.com/ctrlplusb/prisma-pg-jest/blob/master/prisma/prisma-test-environment.js
// @see https://jestjs.io/docs/configuration#testenvironment-string

require('dotenv').config();
import { Client } from "pg";
import NodeEnvironment from "jest-environment-node";
import child_process from "child_process";
import { logger } from '../../src/logger';

const prismaBinary = 'npx prisma';

export default class PrismaTestEnvironment extends NodeEnvironment {
  static init() {
    let testEnv: PrismaTestEnvironment;

    beforeEach(async () => {
      testEnv = await new PrismaTestEnvironment({});
      testEnv.setup();
    });

    afterEach(async () => testEnv.teardown());
  }

  schema = '';
  connectionString = '';

  constructor(config: any) {
    super(config);

    // Generate a unique schema identifier for this test context
    // this.schema = `test_${nanoid()}_${process.hrtime.bigint()}`;
    this.schema = `test_${+ new Date()}_${process.hrtime.bigint()}`;

    logger.info(`Init new test env with temporary schema: ${this.schema}`);

    // Generate the pg connection string for the test schema
    this.connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@localhost:${process.env.DB_PORT}/${process.env.DB_NAME}?schema=${this.schema}`;
  }

  async setup() {
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
    const client = new Client({
      connectionString: this.connectionString,
    });
    await client.connect();
    await client.query(`DROP SCHEMA IF EXISTS "${this.schema}" CASCADE`);
    await client.end();
  }
}
