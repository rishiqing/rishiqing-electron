/*
* @Author: qinyang
* @Date:   2017-12-04 17:46:06
* @Last Modified by:   qinyang
* @Last Modified time: 2017-12-04 22:49:10
*/
 const EVENTS = {
  Start: 'download-start',
  Interrupted: 'download-interrupted',
  Paused: 'download-paused',
  Progress: 'download-progress',
  Completed: 'download-completed',
  Done_Cancelled: 'download-done-cancelled',
  Done_Interrupted: 'download-done-interrupted',
  Cancel_Download: 'download-cancel-by-user'
 };

 module.exports = EVENTS;