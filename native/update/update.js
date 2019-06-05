;(function () {
  var config = require('../config.js');
  var remote = require('electron').remote;
  var shell  = require('electron').shell;
  var currentWindow = remote.getCurrentWindow();
  window.update = function(type){
    if(type){
      shell.openExternal(config.DOWNLOADURL + '/rishiqing.exe');
      currentWindow.close(true);
    }else{
      currentWindow.close(true);
    }
  }
})();