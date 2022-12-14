import path from 'node:path';

export default function createRedirectServedPathMiddleware(servedPath) {
  // remove end slash so user can land on `/test` instead of `/test/`
  servedPath = servedPath.slice(0, -1);
  return function redirectServedPathMiddleware(req, res, next) {
    if (
      servedPath === '' ||
      req.url === servedPath ||
      req.url.startsWith(servedPath)
    ) {
      next();
    } else {
      const newPath = path.posix.join(
        servedPath,
        req.path !== '/' ? req.path : ''
      );
      res.redirect(newPath);
    }
  };
}
