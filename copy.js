const fs = require('fs')
const path = require('path')
const argv = require('yargs').argv
var env = argv.env
const target = 'dir'
const from_dir = ['common','native','res','dist','utils','download.js','main.js','package.json','page.js','preference.js']

const tar_path = path.join(__dirname,target)
if (env !== 'beta') {
  env = 'release'
}
function deleteFolder(current) {
  var files = []
  if( fs.existsSync(current) ) {
      files = fs.readdirSync(current)
      files.forEach(function(file,index){
          var curPath = path.join(current,file)
          if(fs.statSync(curPath).isDirectory()) {
              deleteFolder(curPath)
          } else {
              fs.unlinkSync(curPath)
          }
      })
      fs.rmdirSync(current)
  }
}
function copyFile(srcPath, tarPath) {
  if (srcPath === path.join(__dirname,'package.json')) {
    var result = JSON.parse(fs.readFileSync(srcPath))
    result.env = env
    result.name = 'rishiqing'
    result.releaseTime = (new Date()).toString()
    delete result.devDependencies
    delete result.scripts
    fs.writeFileSync(tarPath, JSON.stringify(result))
  } else {
    var rs = fs.createReadStream(srcPath)
    var ws = fs.createWriteStream(tarPath)
    rs.pipe(ws)
  }
}
function copyFolder(srcDir, tarDir, cb) {
  fs.stat(srcDir,function (err,stats) {
    if (stats.isDirectory()) {
      fs.mkdir(tarDir,function () {
        fs.readdir(srcDir,function (err,files) {
          files.forEach(function (file) {
            var srcPath = path.join(srcDir, file)
            var tarPath = path.join(tarDir, file)
            fs.stat(srcPath,function (err,statss) {
              if(statss.isDirectory()) {
                fs.mkdir(tarPath, function(err) {
                  copyFolder(srcPath,tarPath)
                })
              } else {
                copyFile(srcPath, tarPath)
              }
            })
          })
        })
      })
    } else {
      copyFile(srcDir, tarDir)
    }
  })
}

// 存在目录，删除再创建，不存在，直接创建
fs.exists(tar_path, function(exists) {
  if (exists) {
    deleteFolder(tar_path) 
  } 
  fs.mkdir(tar_path,function(err){
    if (err) {
       return console.error(err)
    }
    from_dir.forEach(function (dir) {
  copyFolder(path.join(__dirname,dir) , path.join(tar_path,dir))
  })
  
})
})


