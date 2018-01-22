#!/bin/bash

if echo $TRAVIS_BRANCH | grep "^master-deploy-" > /dev/null; then
  npm run rdp-mac-release
elif echo $TRAVIS_BRANCH | grep "^check-deploy-" > /dev/null; then
  npm run rdp-mac-check #这个是为了提交各种审核而打的包，包的内容和正式版一样
elif echo $TRAVIS_BRANCH | grep "^beta-deploy-" > /dev/null; then
  npm run rdp-mac-beta
fi;