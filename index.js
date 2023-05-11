#!/usr/bin/env node

import * as util from 'node:util';
import { exec } from 'child_process';
import puppeteer from 'puppeteer';
import { launch, getStream } from 'puppeteer-stream';
import * as fs from 'fs';
import * as path from 'path';

const RECORDING_LENGTH_SECONDS = 5 * 60;

const promiseExec = util.promisify(exec);

async function main(url, filename) {
  // const outputFilePath = path.join("/tmp", `${filename}.webm`);
  const outputFilePath = path.join(path.resolve(), `${filename}.webm`);
  const file = fs.createWriteStream(outputFilePath);

  const browser = await launch({
    executablePath: puppeteer.executablePath(),
    dumpio: true,
    args: [
      '--autoplay-policy=no-user-gesture-required',
    ],
  });
  const page = await browser.newPage();

  page.on('console', message => {
    const messageTypeStr = message.type().substr(0, 3).toUpperCase();
    if (messageTypeStr != "WAR") {
      console.log(`${messageTypeStr} ${message.text()}`)
    }
  });

  await page.goto(url);
  const stream = await getStream(page, { audio: true, video: false });

  console.log("Recording...");
  stream.pipe(file);

  var elapsedSeconds = 0;
  const intervalId = setInterval(async () => {
    elapsedSeconds += 1;
    if (elapsedSeconds % 60 == 0) {
      console.log(`${elapsedSeconds} seconds elapsed`);
    }
    if (elapsedSeconds >=  RECORDING_LENGTH_SECONDS) {
      clearInterval(intervalId);
      await stream.destroy();
      file.close();
      await browser.close();
      console.log("Finished recording");

      await promiseExec(`${path.join(path.resolve(), "loopcrossfade.sh")} ${outputFilePath} output`);
      console.log("Finished processing");

      // fs.unlinkSync(outputFilePath);
    }
  }, 1000);
}

if (process.argv.length != 4) {
  console.log("Need two arguments: URL and name");
  process.exit();
}

const url = process.argv[2];
const name = process.argv[3];
await main(url, name);
