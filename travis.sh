#!/bin/bash

if echo $TRAVIS_BRANCH | grep "^master-deploy-" > /dev/null; then
  npm run rdp-release
elif echo $TRAVIS_BRANCH | grep "^beta-deploy-" > /dev/null; then
  npm run rdp-beta
fi;