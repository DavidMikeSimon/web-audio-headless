#!/usr/bin/env node

import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

const GB = 1024*1024*1024;

async function main(target) {
  const browser = await puppeteer.launch({
    headless: "new",
    userDataDir: './user_data',
    dumpio: true,
    args: [
      '--allow-file-access-from-files',
      '--disable-web-security',
      '--autoplay-policy=no-user-gesture-required',
      `--disk-cache-size=${1*GB}`
    ],
    ignoreDefaultArgs: ['--mute-audio'],
  });
  const page = await browser.newPage();

  await page.goto(`file://${target}`);
}

if (process.argv.length != 3) {
  console.log("Need one argument: path to local HTML file");
  process.exit();
}

try {
  fs.unlinkSync(path.join(path.resolve(), 'user_data/SingletonLock'));
  console.log("Deleted SingletonLock");
} catch {
  console.log("Did not delete SingletonLock");
}

const target = path.resolve(process.argv[2]);
await main(target);
