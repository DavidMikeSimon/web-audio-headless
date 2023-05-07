#!/usr/bin/env node

import puppeteer from 'puppeteer';
import * as path from 'path';

async function main() {
  const browser = await puppeteer.launch({
    headless: "new",
    userDataDir: './user_data',
    args: [
      '--allow-file-access-from-files',
      '--disable-web-security',
      '--autoplay-policy=no-user-gesture-required',
    ],
    ignoreDefaultArgs: ['--mute-audio'],
  });
  const page = await browser.newPage();

  await page.goto(`file://${path.join(path.resolve(), 'pages/thunder/Thunder & Rain — Natural Ambience Sound Generator.html')}`);
}

await main();
