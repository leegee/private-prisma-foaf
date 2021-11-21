# Testing Prisma

## Synopsis

    npm run db:start       # Start pg in a Docker container
    npm run db:stop

    npm run anew           # Build scheme, populate db, create ERD, test
    npm test               # Run all tests
    npm run test:unit      # Run unit tests without the database
    npm run test:int       # Run integration tests upon the db and Prisma

## Scheme

A simplistic star scheme that centers on actions, used to describe who did what to whom, when it happened, with citations,
where the 'who' is an `Entity` (either a person or organisation).

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

## NOTES

Use of a long-running global transaction apparently not supported

## Links

    https://towardsdatascience.com/tricks-for-postgres-and-docker-that-will-make-your-life-easier-fc7bfcba5082
    https://github.com/prisma/prisma/discussions/2083
    https://github.com/prisma/prisma/discussions/2083
    https://github.com/prisma/prisma-examples/tree/latest/typescript/testing-express
    https://www.prisma.io/docs/guides/testing/unit-testing
    https://www.youtube.com/watch?v=E-FHalzAOFs

# Proposed Ingestion Format

Should be easy for non-techies to edit by hand.

## Entity (DoB-DoD)

### `perlre` definition:

    /^ \w* ([^\(]+) \w+ \( (\d{4}–\d{2}–\d{2]) \w*-\w* (\d{4}–\d{2}–\d{2]) \w* ) $/

### Examples:

    Andre Puharich (1918-02-19 – 1995-01-03)
    heosophical Society
    Anthroposophical Society

## Entity-Verb-Entity

### `perlre` definition:

    /^ \w*
      \[                    # Surrounded by square brackets,
        ([^\]]+)            # $1 Subject
      \]                    # End square bracket surrounding subject
       \w* --\> \w*         # --> arrow, maybe surrounded by whitespace
      \|                    # Surrounded by bars
         ( [^\|]+ )         # $2 Verb
      \|                    # nd bars surrounding verb
      \w*                   # May be whitespace
      \[                    # Surrounded by square brackets
        ( [^\]]+ )          # $3 Object
      \]                    # End square brackets surrounding object
      \w*                   # May be whitespace
      # (.+)?               # $4 Comment
      \w*                   # May be whitespace at the end of the line
    $/x

### Examples:

    [Andre Puharich]    -->  ||sponsored|           [Uri Geller]
    [Arthur Young]      -->  ||member-of|           [The Nine]
    [The Nine]          -->  ||claimed to channel|  [Egyptian Gods in a ship]
    [Jeffrey Mishlove]  -->  |promoted|             [Uri Geller]
    [Harry Truman]      -->  |isa|                  [mason]
    [Harry Truman]      -->  |isa|                  [potus]
    [JFK]               -->  |isa|                  [potus]
    [Richard Nixon]     -->  |isa|                  [potus]
    [Donald Trump]      -->  |isa|                  [potus]
    [George HW Bush]    -->  |isa|                  [potus]
    [George W Bush]     -->  |isa|                  [potus]
    [Obama]             -->  |isa|                  [potus]
    [Carter]            -->  |isa|                  [potus]
    [Carter]            -->  |witnessed|            [ufo]
    [CIA]               -->  |investigates|         [ufo]
    [CIA]               -->  |investigates|         [psi-consciousness]
    [Robert Bigelow]    -->  |investigates|         [psi-consciousness]
    [Robert Bigelow]    -->  |investigates|         [psi-consciousness]
    [Robert Bigelow]    -->  |funds|                [Jeffrey Mishlove]
    [Jeffrey Mishlove]  -->  |investigates|         [psi-consciousness]
    [Woodrow Wilson]    -->  |isa|                  [potus]
    [Woodrow Wilson]    -->  |interviewed|          [Edgar Casey]       # Leauge of Nations
    [Woodrow Wilson]    -->  |created|              [Leauge of Nations]
    [Rudolf Steiner]    -->  |created|              [Anthroposophical Society]
    [Madam Blavatsky]   -->  |created|              [Theosophical Society]
    [Rudolf Steiner]    -->  |memberr of|           [Theosophical Society]
