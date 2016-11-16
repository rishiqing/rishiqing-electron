/*
* @Author: apple
* @Date:   2016-02-17 11:06:44
* @Last Modified by:   qinyang
* @Last Modified time: 2016-11-16 16:37:55
*/

var path     = require('path');
var argv    = require('yargs').argv;

var destPath = 'dir',
  env        = argv.env ? argv.env : 'release',
  platform   = argv.platform;

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
            packageJson.name = 'rishiqing';
            delete packageJson.devDependencies;
            delete packageJson.scripts;
            return JSON.stringify(packageJson);
          }
        }
      },
      res: {
        files: [
          {expand: true, src: 'res/*', dest: destPath}
        ]
      },
      // module: {
      //   files: [
      //     {expand: true, src: 'node_modules/jquery/**', dest: destPath},
      //     {expand: true, src: 'node_modules/winreg/**', dest: destPath},
      //     {expand: true, src: 'node_modules/request/**', dest: destPath}
      //   ]
      // },
      mainJs: {
        files: [
          {expand: true, src: 'main.js', dest: destPath},
          {expand: true, src: 'native/*.js', dest: destPath}
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
  grunt.registerTask('copyTask', ['copy:fe', 'copy:pkg', 'copy:res']);

  grunt.registerTask('default', ['clean', 'uglify:main', 'cssmin', 'copy']);
}
