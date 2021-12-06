import { CsvIngestor } from 'src/service/ingestor/csv-ingestor';

import PrismaTestEnvironment from "testlib/prisma-test-env";
PrismaTestEnvironment.init();

main();

/** @throws */
async function main() {
  const gi = new CsvIngestor({
    dao: PrismaTestEnvironment.dao
  });

  await gi.parseEntityFile('./test/lib/entities.csv');
  await gi.parsePredicateFile('./test/lib/predicates.csv');
}
