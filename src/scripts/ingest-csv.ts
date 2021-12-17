import { CsvIngestor } from '../service/ingestor/csv-ingestor';

import PrismaTestEnvironment from "../../test/lib/prisma-test-env";
PrismaTestEnvironment.setup();

main();

async function main() {
  const gi = new CsvIngestor({
    dao: PrismaTestEnvironment.dao
  });

  await gi.parseEntityFile('./test/lib/entities.csv');
  await gi.parsePredicateFile('./test/lib/predicates.csv');
}
