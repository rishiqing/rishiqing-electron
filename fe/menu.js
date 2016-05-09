/*
* @Author: apple
* @Date:   2016-02-19 11:07:23
* @Last Modified by:   apple
* @Last Modified time: 2016-02-19 12:40:22
*/

;(function () {
  var gui         = require('nw.gui');
  if (process.platform === 'darwin') {
    var menu        = new gui.Menu({type: 'menubar'});

    menu.createMacBuiltin('日事清',{
        hideEdit: false,
        hideWindow: false
    });
    gui.Window.get().menu = menu;

  }
})();
