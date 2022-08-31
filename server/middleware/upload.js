import formidable from 'formidable';

export default async (ctx, next) => {
  const form = new formidable.IncomingForm({});
  await new Promise((reslove, reject) => {
    form.parse(ctx.req, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        ctx.request.body = fields;
        ctx.request.files = files;
        reslove();
      }
    });
  });
  await next();
};
