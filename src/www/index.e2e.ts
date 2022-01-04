import { test, expect } from '@playwright/test';
import { FastifyInstance } from 'fastify';
import { start } from 'src/server/index';

let server: FastifyInstance;

test.describe('e2e', () => {
  test.beforeAll(async () => {
    server = await start();
  });

  test.afterAll(async () => {
    server.close();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8081/index.html');
  });

  test('with known values', async ({ page }) => {
    await page.click('#video-url');
    await page.keyboard.type('https://www.youtube.com/watch?v=-lVQHIC3QYw&t=315s');
    await page.click('#set-video-src');
    await page.waitForRequest(/^.+\/youtube.+$/);

    await page.click('#subject > input');
    await page.keyboard.type('oswald');
    await page.waitForRequest(/^.+\/entity.+$/);

    await page.click('#verb > input');
    await page.keyboard.type('assassinated');
    await page.waitForRequest(/\/verb/);

    await page.click('#object > input');
    await page.keyboard.type('jfk');
    await page.waitForRequest(/\/entity/);

    await expect(page.locator('#submit > button')).toBeEnabled({ timeout: 100 });

    page.click('#submit > button');
    page.waitForResponse(/\/predicate/, { timeout: 5000 });
  });
});

