import nodemon from 'nodemon';

const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || '4000';
const inspectPort = process.env.INSPECT_PORT || port - 2;

process.env.NODE_ENV = 'development';
process.env.SERVER_HOST = host || '0.0.0.0';
process.env.SERVER_PORT = port;

nodemon(
  `-e js,json,html --watch server --ignore node_modules/**node_modules --inspect=${inspectPort} ./server/index.js`
);

nodemon
  .on('start', function () {
    console.log('App has started');
  })
  .on('quit', function () {
    console.log('App has quit');
    process.exit();
  })
  .on('restart', function (files) {
    console.log('App restarted due to: ', files);
  });
