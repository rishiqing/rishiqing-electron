/*
* @Author: qinyang
* @Date:   2018-01-19 12:09:13
* @Last Modified by:   qinyang
* @Last Modified time: 2018-01-19 17:26:33
* @for: 用来记录url白名单，在这个白名单里的url，可以直接在pc端里打开
*/

const List = [
  /^blob:/, // 以blob:开头的内置页面
  /mainCommon\/printView/i // 任务打印
];

const whiteUrlList = function (url) {
  let isWhite = false;
  for (let item of List) {
    if (item instanceof RegExp) {
      isWhite = item.test(url);
    }
    if (typeof item === 'string') {
      isWhite = item === url;
    }
    if (isWhite) break;
  }
  return isWhite;
}

module.exports = whiteUrlList;
