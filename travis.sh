#!/bin/bash

if echo $TRAVIS_BRANCH | grep "^check-deploy-" > /dev/null; then
  npm run rdp-mac-check #这个是为了提交各种审核而打的包，包的内容和正式版一样
  # npm run rdp-mac-release # 由于现在发布正式版的时候，是直接从check文件夹里拷贝文件到release里，由于appveyor的触发要更加及时，所以正式版的发布只在appveyor里，进行Oss的文件拷贝即可
elif echo $TRAVIS_BRANCH | grep "^beta-deploy-" > /dev/null; then
  npm run rdp-mac-beta
fi;
