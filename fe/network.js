/*
* @Author: apple
* @Date:   2016-02-17 20:52:47
* @Last Modified by:   apple
* @Last Modified time: 2016-02-17 21:16:57
*/
var config       = require('./config');
var EventEmitter = require('events').EventEmitter,
    spawn        = require('child_process').spawn,
    rl           = require('readline');

var RE_SUCCESS = /bytes from/i,
    INTERVAL = 2, // in seconds
    IP = config.IP;

var proc = spawn('ping', ['-v', '-n', '-i', INTERVAL, IP]),
    rli = rl.createInterface(proc.stdout, proc.stdin),
    network = new EventEmitter();

network.online = false;

rli.on('line', function(str) {
  if (RE_SUCCESS.test(str)) {
    if (!network.online) {
      network.online = true;
      network.emit('online');
    }
  } else if (network.online) {
    network.online = false;
    network.emit('offline');
  }
});

module.exports = network;
