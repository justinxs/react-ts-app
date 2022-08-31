import Exceptionless from 'exceptionless';
/**
 * 日志推送服务
 */
export default (app, config) => {
  if (config) {
    app.context.exception = new Exceptionless.ExceptionlessClient({
      apiKey: config.apiKey,
      serverUrl: config.host
    });
  }
};
