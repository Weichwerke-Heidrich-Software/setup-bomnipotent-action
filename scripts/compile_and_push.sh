#!/bin/bash

# GitHub actions do not install dependencies before running - they need to be included in the repo.
# This script compiles the project and pushes the changes.

set -e

if ! command -v ncc &> /dev/null; then
    npm install -g @vercel/ncc
fi

cd "$(git rev-parse --show-toplevel)"

ncc build src/index.js -o dist --license licenses.txt

commig_message=$1
if [ -z "$commig_message" ]; then
    default_message="Update compiled files"
    echo "No commit message provided. Shall I use a default message \"$default_message\"?"
    read -p "Enter 'y' for yes or 'n' for no: " answer
    if [ "$answer" == "y" ]; then
        commig_message=$default_message
    else
        echo "Exiting without committing."
        exit 1
    fi
fi

git add .
git commit -m "$commig_message"
git push
