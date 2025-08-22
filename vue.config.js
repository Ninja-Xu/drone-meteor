module.exports = {

  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].title = '气象环境仿真系统可视化系统'
        return args
      })
  }
}