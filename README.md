# Testing Prisma

## Synopsis

    npm run db:start       # Start pg in a Docker container
    npm run db:stop

    npm run anew           # Build scheme, populate db, create erd, test
    npm test               # Run all tests
    npm run test:unit      # Run unit tests without the database
    npm run test:int       # Run integration tests upon the db and Prisma

## Writiing integration tests

Since the tests are `.spec.ts`, and `.int` must be added to the filename to signify an integration test,
so the default environment is `node`.

Use the "Jest custom environment" by adding the following docblock, to produce a schema per test file:

    /**
    * @jest-environment ./test/lib/prisma-test-env.ts
    */

## TODO

- Deeper mock RVs
- Playwrite
- Percy
