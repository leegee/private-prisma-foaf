const { chromium } = require('playwright');

main();

async function main() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('http://localhost:8081/index.html');

  // await page.fill('#video.shadowRoot#video-url', 'https://www.youtube.com/watch?v=-lVQHIC3QYw&t=315s');
}
