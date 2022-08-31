import errorMiddleware from './error.js';
import entryMiddleware from './entry.js';
import uploadMiddleware from './upload.js';
import bodyparserMiddleware from './bodyparser.js';
import resourceMiddleware from './resource.js';
import apiMiddleware from './api.js';

export default (app) => {
  app.use(errorMiddleware);
  app.use(entryMiddleware);
  app.use(resourceMiddleware);
  app.use(apiMiddleware);
  app.use(uploadMiddleware);
  app.use(bodyparserMiddleware);
};
