import { exec } from 'child_process';
import * as core from '@actions/core';
import * as fs from 'fs';
import * as io from '@actions/io';
import * as path from 'path';
import * as toolcache from '@actions/tool-cache';

async function persistClient(downloadPath: string, os: string): Promise<string> {
  const runnerTemp = process.env['RUNNER_TEMP']!;
  const stableDir = path.join(runnerTemp, 'bomnipotent');
  let stablePath;
  if (os === 'windows') {
    stablePath = path.join(stableDir, 'bomnipotent_client.exe');
  } else {
    stablePath = path.join(stableDir, 'bomnipotent_client');
  }
  await io.mkdirP(stableDir);
  console.log(`Moving client to: ${stablePath}`);
  await io.cp(downloadPath, stablePath, { force: true });

  if (os !== 'windows') {
    // On Unix systems, we need to make the binary executable
    fs.chmodSync(stablePath, 0o755);
  }

  console.log(`Adding "${stableDir}" to the PATH`);
  core.addPath(stableDir);

  return stablePath;
}

function execCommand(command: string): void {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Sadly, BOMnipotent encountered a critical error:\n${error.message}\n${stderr}\n${stdout}`);
      process.exit(1);
    }
    if (stderr) {
      console.error(`Sadly, BOMnipotent encountered an error:\n${stderr}\n${stdout}`);
    }
    console.log(`${stdout}`);
  });
}

function storeSessionData(execPath: string): void {
  let dataToStore: string = '';

  const domain = core.getInput('domain');
  if (domain) {
    dataToStore += `--domain=${domain} `;
  }

  const user = core.getInput('user');
  if (user) {
    dataToStore += `--email=${user} `;
  }

  const secret_key = core.getInput('secret_key');
  if (secret_key) {
    const runnerTemp = process.env['RUNNER_TEMP']!;
    const stableDir = path.join(runnerTemp, 'bomnipotent');
    const secretKeyPath = path.join(stableDir, 'secret.key');
    fs.writeFileSync(secretKeyPath, secret_key);
    dataToStore += `--secret-key=${secretKeyPath} `;
  }

  if (dataToStore === '') {
    console.log('No session data to store.');
    return;
  } else {
    console.log(`Storing session data: ${dataToStore}`);
  }

  const command: string = `${execPath} ${dataToStore} session login`;
  execCommand(command);
}

function verifySession(execPath: string): void {
  const domain = core.getInput('domain');
  if (!domain) {
    console.log('No domain provided, skipping session verification.');
    return;
  }
  const command: string = `${execPath} health`;
  console.log(`Verifying session.`);
  execCommand(command);
}

async function setupClient(): Promise<void> {
  let versionToInstall: string = core.getInput('version');
  if (versionToInstall !== 'latest' && !versionToInstall.startsWith('v')) {
    versionToInstall = `v${versionToInstall}`;
  }
  console.log(`Installing ${versionToInstall}.`);

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

  const execPath = await persistClient(downloadPath, os);
  storeSessionData(execPath);
  if (core.getInput('verify_session') === 'true') {
    verifySession(execPath);
  }
}

async function run(): Promise<void> {
  try {
    await setupClient();
  } catch (error) {
    core.setFailed((error as Error).message);
  }
}

run();
