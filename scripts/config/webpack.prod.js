const {
    resolve
} = require('path')
const webpack = require('webpack')
const {
    merge
} = require('webpack-merge')
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin')
const glob = require('glob')
const PurgeCSSPlugin = require('purgecss-webpack-plugin')
const {
    BundleAnalyzerPlugin
} = require('webpack-bundle-analyzer')
const common = require('./webpack.common.js')
const {
    PROJECT_PATH,
    shouldOpenAnalyzer
} = require('../constants')


module.exports = merge(common, {
    mode: 'production',
    devtool: 'none',
    plugins: [
        new CleanWebpackPlugin(),
        // 去除无用的样式
        new PurgeCSSPlugin({
            // glob用来查找文件的路径， 同步找到src下面的后缀为以下，的文件路径并以数组形式返给paths，然后该插件就会解析每一个路径对应的文件，将无用的样式去除，nodir即去除文件夹的路径，加快处理的速度
            // 注意一定要把引入样式的tsx文件的路劲也给到，不然无法解析没有哪个样式类名，自然也无法正确剔除无用样式
            paths: glob.sync(`${resolve(PROJECT_PATH, './src')}/**/*.{tsx,scss,less,css}`, {
                nodir: true
            }),
        }),
        // 添加包注释，
        new webpack.BannerPlugin({
            raw: true,
            banner: '/** @preserve Powered by react-ts-quick-starter  */',
        }),
        // 打包分析，检查打出来的包有多大
        shouldOpenAnalyzer && new BundleAnalyzerPlugin({
            analyzerMode: 'server', // 开一个本地服务查看报告
            analyzerHost: '127.0.0.1', // host 设置
            analyzerPort: 8888, // 端口号设置
        }),
    ].filter(Boolean),
})
