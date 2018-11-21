let platform = 'mac';
if (process.platform !== 'darwin') platform = 'win';

const env = {
  platform,
  isMac: platform === 'mac' ? true : false,
}

module.exports = env;