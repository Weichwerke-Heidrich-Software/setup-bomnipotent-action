const core = require('@actions/core');
const github = require('@actions/github');

try {
  const versionToInstall = core.getInput('version');
  console.log(`Installing ${versionToInstall}!`);
  
  // TODO: Actually install the version of the software here.
  core.setOutput("version", versionToInstall);

  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
