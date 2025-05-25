# Setup BOMnipotent

![BOMnipotent Logo](https://www.bomnipotent.de/images/bomnipotent_banner.svg)

[BOMnipotent](https://www.bomnipotent.de) is a pair of server and client application for hosting and managing documents around supply chain security, like SBOMs and CSAF documents.

This project is a GitHub Action that allows users to install a specified version of BOMnipotent Client, the software to access BOMnipotent Server.

## Getting Started

To use this action, you need to specify the version of the software you want to install in your workflow file.

### Inputs

- `domain`: *(Optional but recommended)* The domain of the BOMnipotent Server instance you primarily which to talk to.
- `user`: *(Optional)* The username of a robot user registered at the BOMnipotent Server.
- `secret-key`: *(Optional)* The secret key belonging to the username. Make it available to your pipeline via \<your repo\> → Settings → Secrets and variables → Actions → New repository secret.
- `log-level`: *(Optional)* Specify the log level on which BOMnipotent Client communicates with you. Valid values are 'error', 'warn', 'info' (default), 'debug' and 'trace'.
- `verify-session`: *(Optional and not recommended)* If set to "false" (or some other string that is not "true"), this skips the verification that the entered session data is valid.
- `version`: *(Optional and not recommended)* The version of the software to install. Defaults to 'latest'.

## Example Usage

```yaml
name: Example Workflow

on: [push]

jobs:
  install:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Install BOMnipotent Client
        uses: Weichwerke-Heidrich-Software/setup-bomnipotent-action@v1
        with:
          domain: 'https://bomnipotent.<target-domain>'
          user: 'CI-CD@<your-domain>'
          secret-key: ${{ secrets.CLIENT_SECRET_KEY }} # You need to set this up in your action secrets.
          log-level: 'debug' # If you fancy extra output.
          version: '0.5.0' # Omit this argument to use the latest version (recommended).

      - name: Use BOMnipotent Client in subsequent actions
        run: |
          if [[ "$RUNNER_OS" == "Windows" ]]; then
            echo "On Windows, the executable ends on .exe."
            bomnipotent_client.exe --version
            bomnipotent_client.exe session status
            bomnipotent_client.exe health
          else
            echo "On Unix, the file is already marked as executable."
            bomnipotent_client --version
            bomnipotent_client session status
            bomnipotent_client health
          fi
        shell: bash
```

## License

This project is licensed under the MIT License. See the [LICENSE file](https://github.com/Weichwerke-Heidrich-Software/setup-bomnipotent-action/blob/main/LICENSE) for details.
