#!/bin/bash

set -e

cd "$(git rev-parse --show-toplevel)"

if [ "$(git rev-parse --abbrev-ref HEAD)" != "main" ]; then
  echo "You must be on the 'main' branch to publish."
  exit 1
fi

major_version=$(node -p "require('./package.json').version.split('.')[0]")
major_version_tag="v$major_version"
minor_version=$(node -p "require('./package.json').version.split('.')[1]")
minor_version_tag="v$major_version.$minor_version"
patch_version=$(node -p "require('./package.json').version.split('.')[2]")
patch_version_tag="v$major_version.$minor_version.$patch_version"

echo "Updating package-lock.json."
npm install

echo "Compiling the project."
ncc build src/index.ts -o dist --license licenses.txt

if ! git diff-index --quiet HEAD --; then
  echo "You have uncommitted changes. Please commit or stash them before publishing."
  exit 1
fi

if git tag -l | grep -q "$patch_version_tag"; then
    echo "Version $patch_version_tag is already tagged. Please update the version in package.json."
    exit 1
else
    echo "Everything looks in order."
    read -p "Do you want to publish version $patch_version_tag? (y/[literally anything else]) " confirm
    if [[ "$confirm" != "y" ]]; then
        echo "Another time then."
        exit 1
    fi
    echo "Creating tag $patch_version_tag"
    git tag "$patch_version_tag"
fi

for tag in "$major_version_tag" "$minor_version_tag"; do
    if git tag -l | grep -q "^${tag}$"; then
        echo "Moving tag $tag to current commit."
        git tag -f "$tag"
    else
        echo "Creating new tag $tag."
        git tag "$tag"
    fi
done

git push --tags --force
