import { prisma } from '../src/service/prisma-client';

// main();

async function main() {
  try {
    await prisma.$executeRaw`
CREATE OR REPLACE FUNCTION trigger_func_insert_verb_stem()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  IF NEW.name IS NOT NULL THEN
    NEW.stem := (
        SELECT array_to_string(
          array(
            SELECT lexemes::text FROM ts_debug('english', NEW.name)
          ),
          ''
        )
      );
  END IF;
  RETURN NEW;
END;
$$
`;

    await prisma.$executeRaw`
CREATE OR REPLACE TRIGGER trigger_insert_verb_stem
  BEFORE INSERT OR UPDATE OF "name" ON "Verb"
  FOR EACH ROW EXECUTE PROCEDURE trigger_func_insert_verb_stem()
`;

  }

  catch (e) {
    console.error('Error');
    console.error(e);
  }
  console.info("Done");
}
