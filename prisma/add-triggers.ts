
import { prisma } from '../src/prisma-client';

main();

async function main() {
  try {
    await prisma.$executeRaw`
CREATE OR REPLACE FUNCTION trigger_func_insert_verb_stem()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  NEW.stem := (SELECT lexemes FROM ts_debug('english', NEW.stem));
  RETURN NEW;
END;
$$
`;

    console.info('ok 1/2');

    await prisma.$executeRaw`
CREATE OR REPLACE TRIGGER trigger_insert_verb_stem
BEFORE INSERT OR UPDATE OF "name" ON "Verb"
FOR EACH ROW
EXECUTE PROCEDURE trigger_func_insert_verb_stem()
`;

    console.info('ok 2/2');
  }

  catch (e) {
    console.error('Error');
    console.error(e);
  }
  console.info("Done");
}
