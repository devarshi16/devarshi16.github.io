import { cp, mkdir, rm, readFile } from 'node:fs/promises';
import { parse } from 'yaml';

// Existing originals stay in place; the static build receives only intended assets.
const teleopSource = await readFile('_blogs/vr-teleoperation-so101-isaac-sim.md', 'utf8').catch(error => {
  if (error.code === 'ENOENT') return null;
  throw error;
});
const teleopPublished = teleopSource !== null && parse(teleopSource.split(/^---\s*$/m)[1]).published !== false;
const draftPreview = process.env.INCLUDE_DRAFTS === '1' && !process.argv.includes('--production');
await mkdir('public', { recursive: true });
await rm('public/assets', { recursive: true, force: true });
await cp('assets', 'public/assets', {
  recursive: true,
  filter: source => !source.includes('assets/teleoperation') || teleopPublished || draftPreview,
});
await cp('examples', 'public/examples', { recursive: true });
