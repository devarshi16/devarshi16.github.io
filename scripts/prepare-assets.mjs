import { cp, mkdir, rm, readFile, readdir, rename } from 'node:fs/promises';
import { parse } from 'yaml';
import sharp from 'sharp';

// Existing originals stay in place; the static build receives only intended assets.
const teleopSource = await readFile('_blogs/vr-teleoperation-so101-isaac-sim.md', 'utf8').catch(error => {
  if (error.code === 'ENOENT') return null;
  throw error;
});
const teleopPublished = teleopSource !== null && parse(teleopSource.split(/^---\s*$/m)[1]).published !== false;
const draftPreview = process.env.INCLUDE_DRAFTS === '1' && !process.argv.includes('--production');
await mkdir('public', { recursive: true });
// Keep the directory stable during a running preview: removing it while Astro
// restarts makes its public-file registry miss covers until the next restart.
if(!teleopPublished&&!draftPreview)await rm('public/assets/teleoperation',{recursive:true,force:true});
await cp('assets', 'public/assets', {
  recursive: true,
  filter: source => !source.includes('assets/teleoperation') || teleopPublished || draftPreview,
});
await cp('examples', 'public/examples', { recursive: true });

// Article-specific covers, derived from the actual source imagery. Large originals
// remain available in the article; cards never download multi-megabyte photographs.
await mkdir('public/assets/cards', { recursive: true });
const expectedCards=new Set();
for(const file of await readdir('_blogs')) {
  if(!/\.(md|markdown)$/.test(file))continue;
  const source=await readFile(`_blogs/${file}`,'utf8'),meta=parse(source.split(/^---\s*$/m)[1]);
  if(!meta.thumbnail||(meta.published===false&&!draftPreview))continue;
  if(!meta.thumbnail.startsWith('/assets/')||meta.thumbnail.includes('..'))throw new Error(`Unsupported card image: ${file}`);
  const name=`${file.replace(/\.(md|markdown)$/,'')}.webp`;expectedCards.add(name);
  await sharp(meta.thumbnail.slice(1)).rotate().resize(640,360,{fit:'contain',background:'#e6eae3'})
    .webp({quality:82}).toFile(`public/assets/cards/${name}.tmp`);
  await rename(`public/assets/cards/${name}.tmp`,`public/assets/cards/${name}`);
}
for(const name of await readdir('public/assets/cards'))if(!expectedCards.has(name))await rm(`public/assets/cards/${name}`,{force:true});
