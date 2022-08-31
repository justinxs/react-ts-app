import { readFile } from 'node:fs/promises';

let html;
export default class PageController {
  constructor() {}
  async page(ctx, next) {
    if (!html) {
      const htmlUrl = new URL('../../dist/index.html', import.meta.url);
      html = await readFile(htmlUrl, { encoding: 'utf-8' });
    }
    ctx.type = 'html';

    return (ctx.body = html);
  }
}
