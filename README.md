# Testing Prisma

### DB

Docker Postgres conrols for `*.int.spec.ts` Prisma-integration tests:

    npm run db:start
    npm run db:stop

Use the "Jest custom environment" by adding the following docblock, to produce a schema per test file:

    /**
    * @jest-environment ./test/lib/prisma-test-env.ts
    */

### build scheme, populate db, create erd, jest

npm run anew

## TODO

- Deeper mock RVs
- Playwrite
- Percy
