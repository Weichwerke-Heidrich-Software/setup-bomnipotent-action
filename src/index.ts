import * as core from '@actions/core';
import * as toolcache from '@actions/tool-cache';

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
  const clientPath: string = await toolcache.downloadTool(url);

  console.log(`Adding "${clientPath}" to the PATH`);
  core.addPath(clientPath);
}

async function run(): Promise<void> {
  try {
    await setupClient();
  } catch (error) {
    core.setFailed((error as Error).message);
  }
}

run();
