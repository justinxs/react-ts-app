import { readFile } from 'node:fs/promises';

export default class PageController {
  constructor() {}
  async page(ctx, next) {
    const template = await readFile(
      new URL('../../dist/index.html', import.meta.url),
      {
        encoding: 'utf-8'
      }
    );
    ctx.type = 'html';

    return (ctx.body = template);
  }
}
