import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { destinations, doorFor, arrival, bridges } from '../src/data/world';
import { enteredDoor, moveOnGround, isOnGround, isInsideBuilding, isometricInput } from '../src/world/movement';
import { canPublish, previewAllowed, slugify, articleUrl } from '../src/lib/content-policy';
import { splitFrontmatter, renderLegacyMarkdown, convertLiquid, plainText } from '../src/lib/legacy-loader';

test('draft previews are never enabled in a production build',()=>{
  assert.equal(previewAllowed('production',true),false);
  assert.equal(previewAllowed('development',true),true);
  assert.equal(canPublish({published:false}),false);
  assert.equal(canPublish({}),true);
});
test('all six doorways trigger only when deliberately crossed from the front',()=>{
  for(const d of destinations){const door=doorFor(d);
    const before={x:door.x,z:door.z+.18},after={x:door.x,z:door.z+.05};
    assert.equal(enteredDoor(before,after),d.id);
    assert.equal(enteredDoor(after,before),undefined);
    assert.equal(enteredDoor({...before,x:door.x+.9},{...after,x:door.x+.9}),undefined);
    assert.ok(isOnGround(before));assert.ok(!isInsideBuilding(after));
  }
});
test('movement cannot walk off an island or through a wall',()=>{
  assert.ok(isOnGround(arrival));assert.ok(!isInsideBuilding(arrival));
  assert.equal(isOnGround({x:100,z:100}),false);
  const building=destinations[0];const outside={x:building.position.x+building.width/2+.2,z:building.position.z};
  const result=moveOnGround(outside,{x:-.4,z:0});assert.deepEqual(result,outside);
});
test('input permits only the four world-axis isometric directions',()=>{
  for(const [x,z] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1]]){
    const v=isometricInput(x,z);assert.equal(Math.hypot(v.x,v.z),1);assert.ok(v.x===0||v.z===0);
  }
  assert.deepEqual(isometricInput(0,0),{x:0,z:0});
});
test('Samsung spawn and every door connect through orthogonal avenues',()=>{
  assert.deepEqual(arrival,{x:8,z:-9.5});
  for(const [a,b] of bridges)assert.ok(a.x===b.x||a.z===b.z);
  for(const d of destinations){
    const avenue=d.position.z<0?.6:9,door=doorFor(d);
    const waypoints=[arrival,{x:4,z:-9.5},{x:4,z:avenue},{x:door.x,z:avenue},{x:door.x,z:door.z+.18}];
    let p={...arrival};
    for(const target of waypoints.slice(1)){
      for(let i=0;i<1500 && Math.hypot(p.x-target.x,p.z-target.z)>.001;i++){
        const delta={x:Math.sign(target.x-p.x)*Math.min(.06,Math.abs(target.x-p.x)),z:Math.sign(target.z-p.z)*Math.min(.06,Math.abs(target.z-p.z))};
        const next=moveOnGround(p,delta);assert.notDeepEqual(next,p,`Blocked route to ${d.id}`);p=next;
      }
      assert.ok(Math.hypot(p.x-target.x,p.z-target.z)<.001);
    }
    assert.equal(enteredDoor(p,moveOnGround(p,{x:0,z:-.13})),d.id);
  }
});
test('legacy slugs and alias spellings remain stable',()=>{
  assert.equal(slugify('linear regression'),slugify('linear-regression'));
  assert.equal(slugify('algorithms comparision'),'algorithms-comparision');
  assert.equal(articleUrl('diy-wired-arduino-pro-micro-gamepad'),'/blog/diy-wired-arduino-pro-micro-gamepad/');
  assert.throws(()=>articleUrl('../draft'));
});
test('the existing multiline book and Hindi descriptions survive parsing',async()=>{
  const book=splitFrontmatter(await readFile('_mybooks/dreamdis.markdown','utf8'));
  assert.match(String(book.data.description),/Ratheesh/);assert.match(String(book.data.description),/Shamiksha/);
  const hindi=splitFrontmatter(await readFile('_mybooks/aatmsaat.markdown','utf8'));
  assert.match(String(hindi.data.title),/आत्मसात/);
});
test('raw HTML headings get stable TOC targets and active scripts are excluded',()=>{
  const result=renderLegacyMarkdown('<h2>First heading</h2><h2>First heading</h2><script>alert(1)</script><img src="/assets/a.png" srcset="/assets/a.png 100w, /assets/a.png 500w">');
  assert.deepEqual(result.headings.map(h=>h.slug),['first-heading','first-heading-1']);
  assert.match(result.html,/id="first-heading-1"/);assert.ok(!result.html.includes('<script'));assert.ok(!result.html.includes('srcset'));
});
test('imported metadata entities display as readable plain text',()=>{
  assert.equal(plainText('you&#8217;re &amp; <b>curious</b>'),'you’re & curious');
  assert.equal(plainText('&#x2014; &quot;notes&quot;'),'— "notes"');
});
test('relative iframe and video survive the content renderer',()=>{
  const {html}=renderLegacyMarkdown('<iframe title="IK" src="/assets/teleoperation/ik-2d.html"></iframe><video controls><source src="/assets/teleoperation/a.mp4" type="video/mp4"></video>');
  assert.ok(/<iframe[^>]*src="\/assets\/teleoperation\/ik-2d.html"/.test(html));assert.ok(html.includes('<video'));
});
test('local teleoperation conversion preserves media, iframe and diagram',async(t)=>{
  const source=await readFile('_blogs/vr-teleoperation-so101-isaac-sim.md','utf8').catch(error=>{if(error.code==='ENOENT')return null;throw error;});
  if(source===null){t.skip('Teleoperation source absent');return;}
  const original=splitFrontmatter(source);
  assert.equal(original.data.published,true);
  const converted=await convertLiquid(original.body);const {html}=renderLegacyMarkdown(converted);
  assert.ok(!converted.includes('{{'));assert.match(html,/\/demos\/ik-2d\//);
  assert.ok(html.includes('<video'));assert.ok(html.includes('teleop-flow-grid'));assert.match(html,/data-portfolio-demo/);assert.match(html,/src="\/demos\/so101\/"/);
  assert.ok(/<iframe[^>]*src="\/demos\/ik-2d\/"/.test(html));
});
