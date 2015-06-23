#!/bin/bash

if [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
    echo "This is a pull request, skipping deploy."; exit 0
fi

if [ -z "$NPM_TOKEN" ]; then
    echo "NPM_TOKEN is not set, skipping deploy."; exit 0
fi

if [ "$TRAVIS_BRANCH" != "master" ]; then
    echo "This is not the master branch, skipping deploy."; exit 0
fi

if [ "$TRAVIS_BUILD_NUMBER.1" != "$TRAVIS_JOB_NUMBER" ]; then
    echo "This is not a first job of the build, skipping deploy."; exit 0
fi


npm set registry https://repository.fit.cvut.cz/npm
npm set "//repository.fit.cvut.cz/:_authToken=${NPM_TOKEN}"

version=$(node -p "require('./package.json').version")

if [ "${TRAVIS_TAG/v/}" != "$version" ]; then
    version="${version%%-dev*}-dev.$(date +%y%m%d)${TRAVIS_BUILD_NUMBER}"
    npm version $version --no-git-tag-version 1>/dev/null
fi

echo "Publishing version $version to the npm registry."
npm publish