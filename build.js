var packager = require('electron-packager');
var yargs    = require('yargs');
var fs       = require('fs');
var argv     = yargs.argv;

var arch = argv.arch,
  dir    = './dir/',
  platform = argv.platform,
  asar = true,
  icon = './res/app.icns',
  name = 'rishiqing',
  out  = './package/release/',
  overwrite = true,
  version = '0.37.8',
  app_bundle_id = 'release.rishiqing.electron'
try {
  var outDirState = fs.lstatSync(out);
} catch (e) {
  try {
    var packageDirState = fs.lstatSync('./package');
  } catch (e) {
    fs.mkdirSync('./package');
  }
  fs.mkdirSync(out);
}
packager({
  dir: dir,
  arch: arch,
  platform: platform,
  asar: asar,
  icon: icon,
  name: name,
  out: out,
  overwrite: overwrite,
  version: version,
  'app-bundle-id': app_bundle_id
}, function (err, appPaths) {
  console.log('err', err);
  console.log('appPaths', appPaths);
});
