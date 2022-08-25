export default function devServerConfig({
  paths,
  host = '0.0.0.0',
  port,
  proxyPort
}) {
  return {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*'
    },
    compress: true,
    static: {
      directory: paths.appPublic,
      publicPath: [paths.publicUrlOrPath]
    },
    devMiddleware: {
      publicPath: paths.publicUrlOrPath.slice(0, -1)
    },
    host,
    port,
    historyApiFallback: {
      disableDotRule: true,
      index: paths.publicUrlOrPath
    },
    hot: false,
    open: [`http://localhost:${port}`],
    client: {
      progress: true
    },
    proxy: {
      '/api': {
        target: `http://localhost:${proxyPort}`,
        pathRewrite: { '^/api': '/api' }
      }
    }
  };
}
