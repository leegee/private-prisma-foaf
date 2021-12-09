import { test, expect } from '@playwright/test';


test.describe('e2e', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8081/index.html');
  });

  test('with known values', async ({ page }) => {
    await page.fill('#video-url', 'https://www.youtube.com/watch?v=-lVQHIC3QYw&t=315s');
    await page.click('#set-video-src');

    await page.focus('#subject > input');
    await page.fill('#subject > input', 'oswald');
    await page.click('#subject > input');

    await page.focus('#verb > input');
    await page.fill('#verb > input', 'assassinated');

    await page.focus('#object > input');
    await page.fill('#object > input', 'jfk');

    await new Promise(_ => setTimeout(_, 1000));

    await page.click('#submit > button');
  });
});

