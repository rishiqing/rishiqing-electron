/*
* @Author: apple
* @Date:   2016-02-18 16:00:39
* @Last Modified by:   qinyang
* @Last Modified time: 2016-02-25 14:50:42
*/

;(function () {
  var gui         = require('nw.gui');
  var startOnBoot = require("./startOnBoot");
  var win         = gui.Window.get();

  var tray_icon   = process.platform === 'darwin' ? 'tray_mac@2x.png' : 'tray_win.png';

  var tray = new gui.Tray({
    icon:'./res/' + tray_icon,
    tooltip: '日事清'
  });
  var menu = new gui.Menu();
  menu.append(new gui.MenuItem({ type:'checkbox',label: '开机启动' }));
  menu.append(new gui.MenuItem({ type: 'separator' }));
  menu.append(new gui.MenuItem({  label: '显示主窗口' }));
  menu.append(new gui.MenuItem({ type: 'separator' }));
  menu.append(new gui.MenuItem({  label: '退出' }));

  menu.items[0].click = function() {
    if(this.checked){//选中，设置开机启动
      startOnBoot.enableAutoStart('rishiqing_startOnBoot', process.execPath);
    }else{//取消选中，取消开机启动
      startOnBoot.disableAutoStart('rishiqing_startOnBoot');
    }
  };
  menu.items[2].click = function() {
    win.show();
  };
  //退出按键
  menu.items[4].click = function() {
    process.exit(0)
  };
  if (process.platform !== 'darwin') {
    tray.menu  =  menu;
  }
  tray.on('click',function(event){
    win.show();
    win.focus();
  })
  startOnBoot.getAutoStartValue('rishiqing_startOnBoot',function(msg){
    if(msg != null && msg !="null"){
      tray.menu.items[0].checked =true;
    }
  });
})();
