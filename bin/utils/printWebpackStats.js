// 打印输出 webpcak 统计信息
// https://webpack.docschina.org/configuration/stats/

export const statsOptions = {
  colors: true,
  assets: true,
  assetsSpace: 50,
  modules: false,
  chunkModules: false,
  children: true,
  chunks: false,
  cachedAssets: false,
  entrypoints: true
};

export default function printWebpackStats(stats, options) {
  process.stdout.write(
    stats.toString(Object.assign({}, statsOptions, options)) + '\n\n'
  );
}
