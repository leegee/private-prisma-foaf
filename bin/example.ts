import { PrismaClient } from '@prisma/client';
import { Erd } from 'src/erd';
import { GraphIngester } from 'src/ingest-graph';

const prisma = new PrismaClient();

async function load() {
  const gi = new GraphIngester({
    prisma,
    filepath: './test/lib/input.graph',
  });

  await gi.parseFile();
}

async function erd() {
  const erd = new Erd({
    prisma,
    knownas: 'Jeffrey Mishlove',
    savepath: './example.out.svg'
  });
  erd.createFileForOne();
}

load();
