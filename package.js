var packager = require('electron-packager');
var yargs    = require('yargs');
var fs       = require('fs');
var package  = require('./package.json');
var argv     = yargs.argv;

var arch = argv.arch,
  dir    = './dir/',
  platform = argv.platform,
  asar = true,
  icon = platform === 'darwin' ? './res/app.icns' : './res/256x256.ico',
  name = '日事清',
  out  = './package/release/',
  overwrite = true,
  version = package.electronVersion,
  app_bundle_id = 'release.rishiqing.electron',
  build_version = package.version
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
  'app-bundle-id': app_bundle_id,
  'build-version': build_version,
  'version-string': { // for windows
    CompanyName: package.CompanyName,
    FileDescription: package.FileDescription,
    OriginalFilename: package.OriginalFilename,
    ProductName: package.ProductName,
    InternalName: package.InternalName
  }
}, function (err, appPaths) {
  console.log('err', err);
  console.log('appPaths', appPaths);
});
