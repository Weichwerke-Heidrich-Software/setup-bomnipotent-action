import * as core from '@actions/core';
import * as toolcache from '@actions/tool-cache';

try {
  const versionToInstall: string = core.getInput('version');
  console.log(`Installing ${versionToInstall}!`);

  const os: string = process.platform;
  console.log(`Running on OS: ${os}`);

  const extension: string = os === 'win32' ? '.exe' : '';
  const url: string = `https://www.bomnipotent.de/downloads/raw/${versionToInstall}/${os}/bomnipotent_client${extension}`;
  console.log(`Downloading from URL: ${url}`);
  // const clientPath: string = await toolcache.downloadTool(url);

  // console.log(`Adding "${clientPath}" to the PATH`);
  // core.addPath(clientPath)

  // TODO: Actually install the version of the software here.
  // core.setOutput("version", versionToInstall);
} catch (error) {
  core.setFailed((error as Error).message);
}
