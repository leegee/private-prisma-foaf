import fs from 'fs';
import { CsvIngestor } from '../../src/ingestor/csv-ingestor';

import PrismaTestEnvironment from "testlib/prisma-test-env";
PrismaTestEnvironment.init();

main();

/** @throws */
async function main() {
  const gi = new CsvIngestor({
    prisma: PrismaTestEnvironment.prisma,
  });

  await gi.parseEntityFile('./test/lib/entities.csv');
  await gi.parsePredicateFile('./test/lib/predicates.csv');
}
