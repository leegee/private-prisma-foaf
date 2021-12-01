
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
  NEW.stem := (SELECT lexemes FROM ts_debug('english', NEW.name)  LIMIT 1);
  RETURN NEW;
END;
$$
`;

    console.info('ok 1/5');

    await prisma.$executeRaw`
CREATE OR REPLACE FUNCTION trigger_func_insert_entity_stems()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  NEW.knownas_stem := (SELECT lexemes FROM ts_debug('english', NEW.knownas)  LIMIT 1);
  NEW.formalname_stem := (SELECT lexemes FROM ts_debug('english', NEW.formalname) LIMIT 1);
  RETURN NEW;
END;
$$
`;

    console.info('ok 2/5');

    await prisma.$executeRaw`
CREATE OR REPLACE TRIGGER trigger_insert_verb_stem
BEFORE INSERT OR UPDATE OF "name" ON "Verb"
FOR EACH ROW
EXECUTE PROCEDURE trigger_func_insert_verb_stem()
`;

    console.info('ok 3/5');

    await prisma.$executeRaw`
CREATE OR REPLACE TRIGGER trigger_insert_entity_stems
BEFORE INSERT OR UPDATE OF "formalname" ON "Entity"
FOR EACH ROW
EXECUTE PROCEDURE trigger_func_insert_entity_stems()
`;
    console.info('ok 4/5');

    await prisma.$executeRaw`

CREATE OR REPLACE TRIGGER trigger_insert_entity_stems
BEFORE INSERT OR UPDATE OF "knownas" ON "Entity"
FOR EACH ROW
EXECUTE PROCEDURE trigger_func_insert_entity_stems()
`;

    console.info('ok 5/5');
  }

  catch (e) {
    console.error('Error');
    console.error(e);
  }
  console.info("Done");
}
