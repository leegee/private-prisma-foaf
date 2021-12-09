const { chromium } = require('playwright');

main();

async function main() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('http://localhost:8081/index.html');

  await page.fill('#video-url', 'https://www.youtube.com/watch?v=-lVQHIC3QYw&t=315s');
  await page.click('#set-video-src');

  await page.fill('#subject > input', 'oswald');
  await page.fill('#verb > input', 'assassinated');
  await page.fill('#object > input', 'jfk');

  await page.click('#submit > button');
}

