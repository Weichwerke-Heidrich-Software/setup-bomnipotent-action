import * as core from '@actions/core';
import * as fs from 'fs';
import * as io from '@actions/io';
import * as path from 'path';
import * as toolcache from '@actions/tool-cache';

async function persistClient(downloadPath: string, os: string): Promise<void> {
  const runnerTemp = process.env['RUNNER_TEMP']!;
  const stableDir = path.join(runnerTemp, 'bomnipotent');
  let stablePath = path.join(stableDir, 'bomnipotent_client');
  if (os === 'windows') {
    stablePath = path.join(stableDir, 'bomnipotent_client.exe');
  } else {
    // On Unix systems, we need to make the binary executable
    fs.chmodSync(stablePath, 0o755);
  }
  await io.mkdirP(stableDir);
  await io.cp(downloadPath, stablePath, { force: true });

  console.log(`Adding "${stableDir}" to the PATH`);
  core.addPath(stableDir);
}

async function setupClient(): Promise<void> {
  const versionToInstall: string = core.getInput('version');
  console.log(`Installing ${versionToInstall}!`);

  let os: string = process.platform;
  console.log(`Running on OS: ${os}`);
  if (os === 'linux') {
    os = 'linux-musl';
  } else if (os === 'win32') {
    os = 'windows';
  } else if (os === 'darwin') {
    os = 'macos';
  } else {
    throw new Error(`Unsupported OS: ${os}`);
  }

  const extension: string = os === 'windows' ? '.exe' : '';
  const url: string = `https://www.bomnipotent.de/downloads/raw/${versionToInstall}/${os}/bomnipotent_client${extension}`;
  console.log(`Downloading from URL: ${url}`);
  const downloadPath: string = await toolcache.downloadTool(url);

  await persistClient(downloadPath, os);
}

async function run(): Promise<void> {
  try {
    await setupClient();
  } catch (error) {
    core.setFailed((error as Error).message);
  }
}

run();
