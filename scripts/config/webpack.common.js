const {
    resolve
} = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const WebpackBar = require('webpackbar')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const {
    isDev,
    PROJECT_PATH,
    IS_OPEN_HARD_SOURCE
} = require('../constants')

const getCssLoaders = (importLoaders) => [
    isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
    {
        loader: 'css-loader',
        options: {
            modules: false,
            sourceMap: isDev,
            importLoaders,
        },
    },
    {
        loader: 'postcss-loader',
        options: {
            ident: 'postcss',
            plugins: [
                // 修复一些和 flex 布局相关的 bug
                require('postcss-flexbugs-fixes'),
                require('postcss-preset-env')({
                    autoprefixer: {
                        grid: true,
                        flexbox: 'no-2009'
                    },
                    stage: 3,
                }),
                require('postcss-normalize'),
            ],
            sourceMap: isDev,
        },
    }
]

module.exports = {
    // 这段代码的意思是告诉webpack，入口文件是根目录下的/src的app.js文件，打包输出的文件位置为根目录下的dist目录中，注意到filename为js/[name].[hash:8].js,那么就会在dist目录下再建一个js文件夹，其中放了命名与入口文件命名一致，并带有hash值的打包之后的js文件
    // path.resolve: node的官方api，可以将路径或者路径片段解析成绝对路径
    // __dirname: 其总是指向被执行js文件的绝对路径，比如我们在webpack文件中访问__dirname，那么它的值就是在电脑系统上的绝对路径，

    entry: { // 入口文件
        app: resolve(PROJECT_PATH, './src/index.tsx'),
    },
    output: { // 定义了编译打包之后的文件名以及所在路径
        filename: `js/[name]${isDev ? '' : '.[hash:8]'}.js`,
        path: resolve(PROJECT_PATH, './dist'),
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.json'],
        // 就可以不加文件后缀名了。webpack 会按照定义的后缀名的顺序依次处理文件，比如上文配置 ['.tsx', '.ts', '.js', '.json'] ，webpack 会先尝试加上 .tsx 后缀，看找得到文件不，如果找不到就依次尝试进行查找，所以我们在配置时尽量把最常用到的后缀放到最前面，可以缩短查找时间。

        alias: {
            'Src': resolve(PROJECT_PATH, './src'),
            'Common': resolve(PROJECT_PATH, './src/common'),
            'Components': resolve(PROJECT_PATH, './src/components'),
            'Utils': resolve(PROJECT_PATH, './src/utils'),
        }
    },
    // 遇到后缀为 .css 的文件，webpack 先用 css-loader 加载器去解析这个文件，遇到 @import 等语句就将相应样式文件引入（所以如果没有 css-loader ，就没法解析这类语句），计算后生成css字符串，接下来 style-loader 处理此字符串生成一个内容为最终解析完的 css 代码的 style 标签，放到 head 标签里。

    //loader 是有顺序的，webpack 肯定是先将所有 css 模块依赖解析完得到计算结果再创建 style 标签。因此应该把 style-loader 放在 css-loader 的前面（webpack loader 的执行顺序是从右到左，即从后往前）。
    // test 字段是匹配规则，针对符合规则的文件进行处理。
    // use 字段有几种写法：
    //// 可以是一个字符串，假如我们只使用 style-loader ，只需要 use: 'style-loader' 。
    //// 可以是一个数组， 假如我们不对 css - loader 做额外配置， 只需要 use: ['style-loader', 'css-loader']。
    //// 数组的每一项既可以是字符串也可以是一个对象， 当我们需要在webpack 的配置文件中对 loader 进行配置， 就需要将其编写为一个对象， 并且在此对象的 options 字段中进行配置。 比如我们上面要对 css - loader 做配置的写法。

    module: {
        rules: [{
                test: /\.css$/,
                use: getCssLoaders(1),
            },
            {
                test: /\.less$/,
                use: [
                    ...getCssLoaders(2),
                    {
                        loader: 'less-loader',
                        options: {
                            sourceMap: isDev,
                        },
                    },
                ],
            },
            {
                test: /\.scss$/,
                use: [
                    ...getCssLoaders(2),
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: isDev,
                        },
                    },
                ],
            }, {
                test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 10 * 1024,
                        name: '[name].[contenthash:8].[ext]',
                        outputPath: 'assets/images',
                    },
                }, ],
            },
            {
                test: /\.(ttf|woff|woff2|eot|otf)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        name: '[name].[contenthash:8].[ext]',
                        outputPath: 'assets/fonts',
                    },
                }, ],
            },
            {
                test: /\.(tsx?|js?|jsx)$/,
                loader: 'babel-loader',
                options: {
                    cacheDirectory: true // babel-loader 在执行的时候，可能会产生一些运行期间重复的公共文件，造成代码体积冗余，同时也会减慢编译效率，所以需要开启cacheDirectory，将这些公共文件缓存起来，下次编译就会加快很多
                },
                exclude: /node_modules/, // 排除这个目录，可以加快编译速度
            },

        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: resolve(PROJECT_PATH, './public/index.html'),
            filename: 'index.html',
            cache: false, // 特别重要：防止之后使用v6版本 copy-webpack-plugin 时代码修改一刷新页面为空问题。
            minify: isDev ? false : {
                removeAttributeQuotes: true,
                collapseWhitespace: true,
                removeComments: true,
                collapseBooleanAttributes: true,
                collapseInlineTagWhitespace: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                minifyCSS: true,
                minifyJS: true,
                minifyURLs: true,
                useShortDoctype: true,
            },
        }),
        // 在打包时能把public/ 文件夹中的静态资源复制到打包后生成的dist文件
        new CopyPlugin({
            patterns: [{
                context: resolve(PROJECT_PATH, './public'),
                from: '*',
                to: resolve(PROJECT_PATH, './dist'),
                toType: 'dir',
            }, ],
        }),
        // 显示编译进度
        new WebpackBar({
            name: isDev ? '正在启动' : '正在打包',
            color: '#fa8c16',
        }),
        // 编译时检查Typescript类型检查
        new ForkTsCheckerWebpackPlugin({
            typescript: {
                configFile: resolve(PROJECT_PATH, './tsconfig.json'),
            },
        }),
        IS_OPEN_HARD_SOURCE && new HardSourceWebpackPlugin(),
        // css样式的拆分
        !isDev && new MiniCssExtractPlugin({
            filename: 'css/[name].[contenthash:8].css',
            chunkFilename: 'css/[name].[contenthash:8].css',
            ignoreOrder: false,
        }),
    ].filter(Boolean),
    externals: {
        react: 'React',
        'react-dom': 'ReactDOM',
    },
    // 将第三方依赖打出独立的chunk
    optimization: {
        splitChunks: {
            chunks: 'all',
            name: true,
        },
        // 对js文件进行压缩
        minimize: !isDev, // 指定压缩器，值为true的时候，默认使用terser-webpack-plugin,false的时候即不压缩代码
        minimizer: [
            !isDev && new TerserPlugin({
                extractComments: false, // 去除所有的注释，除了有特殊标记的注释，比如@preserve标记
                terserOptions: {
                    compress: {
                        pure_funcs: ['console.log'] // 设置想要去除的函数
                    },
                }
            }),
            // 压缩css代码
            !isDev && new OptimizeCssAssetsPlugin()
        ].filter(Boolean),
    },

}
