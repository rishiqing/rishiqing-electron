/*
* @Author: apple
* @Date:   2016-02-17 11:06:44
* @Last Modified by:   apple
* @Last Modified time: 2016-02-19 10:50:47
*/

var path     = require('path');
var argv    = require('yargs').argv;
var platform = process.platform;
if (argv.ia32 && platform === 'win32') {
  platform += '-ia32';
}
var infoJson = {
  'win32':{
    appPackage: 'package.nw',
    appDestPath: 'rishiqing-nw-sdk-x64'
  },
  'win32-ia32':{
    appPackage: 'package.nw',
    appDestPath: 'rishiqing-nw-sdk-ia32'
  },
  'darwin':{
    appPackage: 'app.nw',
    appDestPath: 'rishiqing-nw-sdk-osx/日事清.app/Contents/Resources'
  }
};
var appPackage = infoJson[platform].appPackage,
  appDestPath  = infoJson[platform].appDestPath,
  destPath     = 'dir',
  env          = argv.env ? argv.env : 'release';

module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		compass: {
			devWatch: {
				options: {
					sassDir : 'fe/scss',
					cssDir  : 'fe/css',
					specify : [
						'fe/scss/*.sass',
						'fe/scss/*.scss'
					],
					watch   : true
				}
			}
		},
    uglify: {
      main: {
        options: {
          compress: {
            drop_console: true
          }
        },
        files: [{expand: true, src: 'fe/*.js', dest: destPath}]
      }
    },
    cssmin: {
      combine: {
        files: [{expand: true, src: 'fe/css/*.css', dest: destPath}]
      }
    },
    copy: {
      fe: {
        files: [
          {expand: true, src: 'fe/img/*', dest: destPath},
          {expand: true, src: 'fe/*.html', dest: destPath}
        ]
      },
      pkg: {
        files: [
          {expand: true, src: 'package.json', dest: destPath}
        ],
        options: {
          process: function (content, srcpath) {
            var packageJson = JSON.parse(content);
            packageJson.env = env;
            packageJson.name = '日事清';
            delete packageJson.devDependencies;
            delete packageJson.dependencies;
            return JSON.stringify(packageJson);
          }
        }
      },
      res: {
        files: [
          {expand: true, src: 'res/*', dest: destPath}
        ]
      },
      module: {
        files: [
          {expand: true, src: 'node_modules/jquery/**', dest: destPath},
          {expand: true, src: 'node_modules/winreg/**', dest: destPath}
        ]
      },
      mainJs: {
        files: [
          {expand: true, src: 'main.js', dest: destPath},
          {expand: true, src: 'config.js', dest: destPath}
        ]
      }
    },
    clean: [destPath, 'package']
	});

	grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');

	grunt.registerTask('compassTask',['compass:devWatch']);

  grunt.registerTask('jsTask', ['uglify:main']);
  grunt.registerTask('cssTask', ['cssmin']);
  grunt.registerTask('copyTask', ['copy:fe', 'copy:pkg', 'copy:res', 'copy:module']);

  grunt.registerTask('default', ['clean', 'uglify:main', 'cssmin', 'copy']);
}
