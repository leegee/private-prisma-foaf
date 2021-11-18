# Testing Prisma

To test the actual pg/Prisma, use the "Jest custom environment" by adding the following docblock, to produce a schema per test file:

    /**
    * @jest-environment ./test/lib/prisma-test-env.ts
    */

Conventionally, name such tests `.int.spec`.

### docker up postgres db

npm run db:start

### build scheme, populate db, create erd, jest

npm run anew

## TODO

- Graph inverse relations - 'Oswald hosted by Arthur Young';
- Playwrite
- Percy
- Mermaid
