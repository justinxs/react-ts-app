import exception from './exception.js';
import logger from './logger.js';

export default (app, config = {}) => {
  exception(app, config.exception);
  logger(app);
};
