const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const setMPA = () =>{
    const entry = {};
    const htmlWebpackPlugins = [];

    const entryFiles = glob.sync("./src/page/**/*.js");// 拿到符合条件的文件路径数组

    console.log(entryFiles)
    Object.keys(entryFiles).map(index=>{
        const entryFile = entryFiles[index];
        const match = entryFile.match(/src\\page\\(.*)\.js/);// 匹配到文件名
        const pageName = match && match[1];

        if(pageName) {
            entry[pageName] = './' + entryFile;

            htmlWebpackPlugins.push(
                new HtmlWebpackPlugin({
                    template: `./public/index.html`,
                    filename:`${pageName === 'home'?'index':pageName}.html`,// 这里让 home.html 输出为 index.html
                    chunks:[pageName],
                    scriptLoading: 'blocking',
                }),
            )
        }
    });

    console.log(entry)
    console.log(htmlWebpackPlugins)

    return { entry,htmlWebpackPlugins };
}


module.exports = setMPA;