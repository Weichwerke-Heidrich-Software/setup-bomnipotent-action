import * as core from '@actions/core';
import * as github from '@actions/github';

try {
  const versionToInstall: string = core.getInput('version');
  console.log(`Installing ${versionToInstall}!`);
  
  // TODO: Actually install the version of the software here.
  core.setOutput("version", versionToInstall);

  const payload: string = JSON.stringify(github.context.payload, undefined, 2);
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed((error as Error).message);
}