/* eslint-disable @typescript-eslint/no-var-requires */

// @see https://github.com/ctrlplusb/prisma-pg-jest/blob/master/prisma/prisma-test-environment.js
// @see https://jestjs.io/docs/configuration#testenvironment-string

require('dotenv').config();
const { Client } = require("pg");
const NodeEnvironment = require("jest-environment-node");
const { nanoid } = require("nanoid");
const util = require("util");
const child_process = require("child_process");

const prismaBinary = 'npx prisma';

class PrismaTestEnvironment extends NodeEnvironment {
  constructor(config: any) {
    super(config);

    // Generate a unique schema identifier for this test context
    this.schema = `test_${nanoid()}`;

    console.info('# Using scheme:', this.schema);

    // Generate the pg connection string for the test schema
    this.connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@localhost:${process.env.DB_PORT}/${process.env.DB_NAME}?schema=${this.schema}`;
  }

  async setup() {
    // Set the required environment variable to contain the connection string for the database test schema
    process.env.POSTGRES_URL = this.connectionString;
    this.global.process.env.POSTGRES_URL = this.connectionString;

    // Run the migrations to ensure our schema has the required structure
    child_process.execSync(`${prismaBinary} migrate dev`);

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

module.exports = PrismaTestEnvironment;