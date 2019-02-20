const path = require('path');
function resolve (dir) {
    return path.join(__dirname, dir)
}
module.exports = {
    pages: {
        download: {
            // 应用入口配置，相当于单页面应用的main.js，必需项
            entry: 'fe/modules/download/main.js',

            // 应用的模版，相当于单页面应用的public/index.html，可选项，省略时默认与模块名一致
            template: 'fe/modules/download/index.html',

            // 编译后在dist目录的输出文件名，可选项，省略时默认与模块名一致
            filename: 'download/index.html',

            // 标题，可选项，一般情况不使用，通常是在路由切换时设置title
            // 需要注意的是使用title属性template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
            title: '下载管理',

            // 包含的模块，可选项
            // chunks: ['console']
        },
        preference: {
            entry: 'fe/modules/preference/main.js',
            template: 'fe/modules/preference/index.html',
            filename: 'preference/index.html',
            title: '偏好设置',
        },
        index: {
            entry: 'fe/modules/index/main.js',
            template: 'fe/modules/index/index.html',
            filename: 'index/index.html',
            title: '日事清',
        },
    },
    publicPath: process.env.NODE_ENV === 'development' ? '/' : '../',
    // configureWebpack:{
    //     externals:{
    //         electron:{
    //             commonjs: "electron",
    //             commonjs2: "electron",
    //             amd: "electron",
    //             root: "electron"
    //         }
    //     }
    // },
    chainWebpack: (config)=>{
        config.resolve.alias
            .set('electron', resolve('fe/modules/utils/electron.js'))
            .set('img', resolve('fe/assets/img'))
    }
}
