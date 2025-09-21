import { execSync } from 'child_process';
import * as core from '@actions/core';
import * as fs from 'fs';
import * as io from '@actions/io';
import * as path from 'path';
import * as toolcache from '@actions/tool-cache';

function executableName(): string {
  return process.platform === 'win32' ? 'bomnipotent_client.exe' : 'bomnipotent_client';
}

function getInstalledVersion(): string {
  try {
    const versionOutput = execSync(`${executableName()} --version`, { encoding: 'utf-8' }).trim();
    const match = versionOutput.match(/bomnipotent_client (\S+)/);
    if (match) {
      return match[1];
    }
    return '';
  } catch {
    return '';
  }
}

async function persistClient(downloadPath: string): Promise<string> {
  const runnerTemp = process.env['RUNNER_TEMP']!;
  const stableDir = path.join(runnerTemp, 'bomnipotent');
  const stablePath = path.join(stableDir, executableName());
  await io.mkdirP(stableDir);
  console.log(`Moving client to: ${stablePath}`);
  await io.cp(downloadPath, stablePath, { force: true });

  if (process.platform !== 'win32') {
    // On Unix systems, we need to make the binary executable
    fs.chmodSync(stablePath, 0o755);
  }

  console.log(`Adding "${stableDir}" to the PATH`);
  core.addPath(stableDir);

  const version = getInstalledVersion();
  if (version) {
    console.log(`Successfully installed BOMnipotent Client version ${version}`);
  } else {
    console.log('Error: Could not determine installed BOMnipotent Client version.');
  }

  return stablePath;
}

function execCommand(command: string): void {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Sadly, BOMnipotent encountered a critical error:\n${error.message}`);
    } else {
      console.error(`Sadly, BOMnipotent encountered a critical error:\n${String(error)}`);
    }
    process.exit(1);
  }
}

function storeSessionData(): void {
  let dataToStore: string = '';

  const domain = core.getInput('domain');
  if (domain) {
    dataToStore += `--domain=${domain} `;
  }

  const user = core.getInput('user');
  if (user) {
    dataToStore += `--user=${user} `;
  }

  const log_level = core.getInput('log-level');
  if (log_level) {
    dataToStore += `--log-level=${log_level} `;
  }

  const secret_key = core.getInput('secret-key');
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

  const execPath: string = executableName();
  const command: string = `${execPath} ${dataToStore} session login`;
  execCommand(command);
}

function verifySession(): void {
  const domain = core.getInput('domain');
  const user = core.getInput('user');
  const secret_key = core.getInput('secret-key');

  if (!domain) {
    console.log('No domain provided, skipping session verification.');
    return;
  } else {
    console.log(`Verifying session.`);
  }

  const execPath: string = executableName();

  if (user && secret_key) {
    console.log('Checking that user and secret key are valid.');
    let command: string = `${execPath} whoami`;
    execCommand(command);
  } else {
    console.log('Checking that the service is reachable.');
    let command: string = `${execPath} health`;
    execCommand(command);
  }
}

async function setupClient(): Promise<void> {
  let versionToInstall: string = core.getInput('version');
  if (versionToInstall !== 'latest' && !versionToInstall.startsWith('v')) {
    versionToInstall = `v${versionToInstall}`;
  }

  const installedVersion = getInstalledVersion();
  if (`v${installedVersion}` === versionToInstall) {
    console.log(`BOMnipotent Client version ${installedVersion} is already installed.`);
    return;
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

  await persistClient(downloadPath);
}

async function run(): Promise<void> {
  try {
    await setupClient();
    storeSessionData();
    if (core.getInput('verify-session') === 'true') {
      verifySession();
    }
  } catch (error) {
    core.setFailed((error as Error).message);
  }
}

run();
