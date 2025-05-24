# Setup BOMnipotent

![BOMnipotent Logo](https://www.bomnipotent.de/images/bomnipotent_banner.svg)

[BOMnipotent](https://www.bomnipotent.de) is a pair of server and client application for hosting and managing documents around supply chain security, like SBOMs and CSAF documents.

This project is a GitHub Action that allows users to install a specified version of BOMnipotent Client, the software to access BOMnipotent Server.

## Getting Started

To use this action, you need to specify the version of the software you want to install in your workflow file.

### Inputs

- `domain`: *(Optional but recommended)* The domain of the BOMnipotent Server instance you primarily which to talk to.
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
          version: '0.5.0' # Omit this argument to use the latest version

      - name: Display the BOMnipotent Client version
        run: |
          if [[ "$RUNNER_OS" == "Windows" ]]; then
            echo "On Windows, the executable ends on .exe."
            bomnipotent_client.exe --version
          else
            echo "On Unix, the file is already marked as executable."
            bomnipotent_client --version
          fi
        shell: bash
```

## License

This project is licensed under the MIT License. See the [LICENSE file](https://github.com/Weichwerke-Heidrich-Software/setup-bomnipotent-action/blob/main/LICENSE) for details.
