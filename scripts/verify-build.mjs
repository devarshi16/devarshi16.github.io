import { readFile, readdir, stat } from 'node:fs/promises';
import { parse } from 'yaml';
import assert from 'node:assert/strict';

const read=path=>readFile(`dist/${path}`,'utf8');
for(const file of await readdir('_blogs')) {
  if(!/\.(md|markdown)$/.test(file))continue;
  const source=await readFile(`_blogs/${file}`,'utf8');const meta=parse(source.split(/^---\s*$/m)[1]);const id=file.replace(/\.(md|markdown)$/,'');
  let exists=false;try{exists=(await stat(`dist/blog/${id}/index.html`)).isFile();}catch{}
  assert.equal(exists,meta.published!==false,`Publication/route mismatch: ${id}`);
  if(meta.published===false)for(const surface of ['index.html','blog/index.html','search.json','feed.xml','sitemap.xml'])assert.ok(!(await read(surface)).includes(id),`Draft leaked into ${surface}`);
}
for(const file of await readdir('_mybooks'))if(file.endsWith('.markdown'))await stat(`dist/books/${file.replace('.markdown','')}/index.html`);
for(const file of [...(await readdir('tags')).map(name=>`tags/${name}`),'poetry.md']) {
  const meta=parse((await readFile(file,'utf8')).split(/^---\s*$/m)[1]);
  const url=meta.permalink||`/tags/${file.replace(/^tags\//,'').replace('.md','')}/`;await stat(`dist${url}index.html`);
}
for(const path of ['blog.html','404.html','assets/Devarshi_Aggarwal_CV.pdf'])await stat(`dist/${path}`);
const html=await read('index.html');assert.ok(!html.includes('{{'));assert.ok(html.includes('data-world-stage'));
console.log('Verified legacy article/book/tag routes, draft exclusions, static entry points, and homepage.');
