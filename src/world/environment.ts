import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { destinations, careerStops, bridges, type WorldDestination } from '../data/world';
import { career } from '../data/career';
import { SceneKit, tree, lamp, robotArm } from './geometry';

export type WorldScene = { root: THREE.Group; pickables: THREE.Object3D[]; animated: THREE.Object3D[]; };

function island(kit: SceneKit, parent: THREE.Object3D, x: number, z: number, width: number, depth: number, height = 8) {
  const group = new THREE.Group(); group.position.set(x, 0, z); parent.add(group);
  const rock = kit.mesh(group, kit.geometry(`rock:${width}:${depth}:${height}`, () => {
    const g = new THREE.CylinderGeometry(1, .05, height, 7, 3); g.scale(width * .58, 1, depth * .58); return g;
  }), 'rock', [0, -height / 2 - .18, 0]); rock.rotation.y = .22;
  kit.box(group, [width, .35, depth], [0, -.04, 0], 'stone');
  kit.box(group, [width-.12, .08, depth-.12], [0, .18, 0], 'ground');
  // Rootlets, exposed strata, mineral clusters and ledges break up the underside.
  for(let i=0;i<5;i++) {
    const a=i*Math.PI*.4+.2, radius=.43;
    const p=new THREE.Vector3(Math.cos(a)*width*radius,-1.25-i*.3,Math.sin(a)*depth*radius);
    const shard=kit.mesh(group,kit.geometry(`shard:${i}`,()=>new THREE.IcosahedronGeometry(.55+i*.08,0)),i%2?'stone':'rock',p.toArray() as [number,number,number]);
    shard.scale.set(1,.75+i*.2,.75);
    kit.beam(group,new THREE.Vector3(p.x*.86,-.25,p.z*.86),new THREE.Vector3(p.x*.78,-3.8-i*.3,p.z*.82),.045,'trunk');
  }
  kit.box(group,[1.1,.16,.65],[width*.43,-1.35,depth*.2],'stone');
  kit.box(group,[.75,.12,.5],[-width*.41,-2.1,-depth*.2],'stone');
  for(let i=0;i<3;i++) {
    const crystal=kit.mesh(group,kit.geometry('mineral',()=>new THREE.ConeGeometry(.13,.75,5)),'accent',[width*.37+i*.16,-1.02,depth*.22],'#a09dbb');
    crystal.rotation.z=-.3+i*.24;
  }
  return group;
}

function bridge(kit: SceneKit, parent: THREE.Object3D, a: {x:number;z:number}, b: {x:number;z:number}) {
  const dx=b.x-a.x, dz=b.z-a.z, length=Math.hypot(dx,dz);
  const group=new THREE.Group(); group.position.set((a.x+b.x)/2,.14,(a.z+b.z)/2); group.rotation.y=Math.atan2(dx,dz);parent.add(group);
  kit.box(group,[1.45,.2,length],[0,0,0],'stone');
  kit.box(group,[1.2,.04,length],[0,.12,0],'path');
  for(let i=-length/2+.35;i<length/2;i+=1.1) kit.box(group,[1.1,.018,.035],[0,.15,i],'trunk');
  // Low curbs keep crossing avenues open, and do not read as diagonal barriers.
  for(const side of [-1,1]) kit.box(group,[.06,.12,length],[side*.68,.13,0],'frame');
}

function signboard(kit:SceneKit,g:THREE.Object3D,d:WorldDestination,y:number) {
  const width=Math.min(5.15,d.width+.95),height=1.55,z=d.depth/2+.60;
  const board=new THREE.Mesh(kit.geometry(`board:${width}`,()=>new THREE.BoxGeometry(width,height,.18)),new THREE.MeshBasicMaterial({color:'#263e45',toneMapped:false}));
  board.position.set(0,y,z);g.add(board);
  for(const side of [-1,1])kit.box(g,[.08,.09,.6],[side*width*.36,y+.2,z-.3],'frame');
  kit.box(g,[width,.06,.21],[0,y+height/2,z],'accent',d.accent);
  // Drawn at 3x the layout size so the lettering stays sharp on high-density screens.
  const canvas=document.createElement('canvas');canvas.width=3072;canvas.height=960;
  const ctx=canvas.getContext('2d')!;ctx.scale(3,3);ctx.fillStyle='#f7f8f1';ctx.textAlign='center';ctx.textBaseline='middle';
  const lines:Record<string,string[]>={robotics:['ROBOTICS','LAB'],vision:['VISION','OBSERVATORY'],maker:['MAKER','WORKSHOP'],journal:['TECHNICAL','JOURNAL'],research:['RESEARCH','PAVILION'],studio:['PROFILE','& CONTACT']};
  ctx.font='800 128px sans-serif';ctx.fillText(lines[d.id][0],512,105,970);
  ctx.font='700 102px sans-serif';ctx.fillText(lines[d.id][1],512,237,970);
  const texture=kit.crisp(new THREE.CanvasTexture(canvas));
  const text=new THREE.Mesh(kit.geometry(`sign-plane:${width}`,()=>new THREE.PlaneGeometry(width-.12,height-.08)),new THREE.MeshBasicMaterial({map:texture,transparent:true,toneMapped:false,depthWrite:false}));
  text.position.set(0,y,z+.095);g.add(text);
}

function architecture(kit: SceneKit, parent: THREE.Object3D, d: WorldDestination): THREE.Group {
  const g=new THREE.Group();g.position.set(d.position.x,0,d.position.z);parent.add(g);
  const w=d.width,z=d.depth;
  kit.box(g,[w,.26,z],[0,.35,0],'stone');
  let signHeight=2.8, height=4.4;
  if(d.id==='robotics') {
    // Open industrial hangar with a cantilevered gantry and an unmistakable arm.
    for(const x of [-w/2+.14,w/2-.14])for(const zz of [-z/2+.14,z/2-.14])kit.box(g,[.27,2.8,.27],[x,1.85,zz],'frame');
    kit.box(g,[w,2.15,.15],[0,1.6,-z/2+.1],'wall');
    for(const side of [-1,1])kit.box(g,[.1,2.3,z-.25],[side*(w/2-.1),1.8,0],'glass');
    kit.box(g,[w+.35,.24,z+.3],[0,3.4,0],'accent',d.accent);
    kit.box(g,[w-.4,.12,.5],[0,3.6,-.9],'metal');
    for(let x=-2;x<2.1;x+=.6)kit.box(g,[.09,.16,1.4],[x,3.56,-.15],'frame');
    robotArm(kit,g,-1.25,-.2,.1);robotArm(kit,g,1.2,-.4,-2.5);
    const rooftop=robotArm(kit,g,-.2,-.25,.9);rooftop.position.y=3.6;rooftop.scale.setScalar(1.05);
    kit.box(g,[1.45,.15,1.1],[0,.7,.6],'path');signHeight=2.85;height=5.5;
  } else if(d.id==='vision') {
    // Circular observatory: solid drum, faceted dome and a large articulated telescope.
    kit.cylinder(g,1.75,1.65,[0,1.3,-.2],'wall',undefined,16);
    for(let i=0;i<12;i++) {
      const a=i*Math.PI/6;const pane=kit.box(g,[.45,.72,.045],[Math.sin(a)*1.76,1.45,Math.cos(a)*1.76-.2],'window');pane.rotation.y=a;
    }
    kit.cylinder(g,1.87,.16,[0,2.2,-.2],'frame',undefined,16);
    kit.mesh(g,kit.geometry('observatory-dome',()=>new THREE.SphereGeometry(1.84,12,6,0,Math.PI*2,0,Math.PI/2)),'accent',[0,2.27,-.2],d.accent);
    const telescope=new THREE.Group();telescope.position.set(.3,3.05,.25);telescope.rotation.x=.72;g.add(telescope);
    kit.cylinder(telescope,.46,1.85,[0,.52,0],'wall');kit.cylinder(telescope,.53,.15,[0,1.47,0],'frame');
    kit.cylinder(telescope,.4,.07,[0,1.57,0],'glass');kit.cylinder(telescope,.14,.55,[0,-.7,0],'metal');
    signHeight=2.55;height=5;
  } else if(d.id==='maker') {
    // Gabled workshop, exposed timber, chimney and a large machine-wheel emblem.
    kit.box(g,[w,2.1,.18],[0,1.55,-z/2+.1],'wall');
    for(const side of [-1,1]) {
      kit.box(g,[.18,2.1,z],[side*(w/2-.09),1.55,0],'accent',d.accent);
      for(let zz=-z/2+.3;zz<z/2;zz+=.65)kit.box(g,[.12,2.2,.12],[side*w/2,1.55,zz],'trunk');
    }
    const roof=kit.mesh(g,kit.geometry('workshop-roof',()=>new THREE.ConeGeometry(1,1.7,4)),'accent',[0,3.25,0],d.accent);
    roof.rotation.y=Math.PI/4;roof.scale.set(w*.79,1,z*.86);
    kit.box(g,[.48,2,.48],[-1.35,3,-.7],'frame');kit.box(g,[.68,.15,.68],[-1.35,4.08,-.7],'metal');
    kit.box(g,[2.2,.16,1.1],[0,1,-.25],'trunk');kit.box(g,[.9,.08,.65],[-.45,1.14,-.2],'accent','#507e6c');
    kit.box(g,[.75,.9,.65],[.65,1.5,-.25],'frame');kit.box(g,[.5,.65,.52],[.65,1.52,-.2],'window');
    const wheel=new THREE.Group();wheel.position.set(1.15,4.1,.5);wheel.rotation.y=.2;g.add(wheel);
    kit.mesh(wheel,kit.geometry('machine-wheel',()=>new THREE.TorusGeometry(.46,.08,6,16)),'metal',[0,0,0]);
    for(let i=0;i<8;i++){const a=i*Math.PI/4;const tooth=kit.box(wheel,[.22,.22,.16],[Math.cos(a)*.5,Math.sin(a)*.5,0],'metal');tooth.rotation.z=a;}
    signHeight=2.25;
  } else if(d.id==='journal') {
    // Stacked volumes form the facade; the roof is an enormous open notebook.
    for(let i=0;i<3;i++) {
      const offset=i%2?.18:-.15;
      kit.box(g,[w,.69,z],[offset,.83+i*.75,0],'wall');
      kit.box(g,[w+.18,.09,z+.12],[offset,1.2+i*.75,0],'accent',i%2?'#a09dbb':d.accent);
      for(let line=0;line<3;line++)kit.box(g,[w-.3,.018,.025],[offset,.65+i*.75+line*.16,z/2+.03],'trunk');
    }
    for(const side of [-1,1]) {
      const page=kit.box(g,[2.15,.18,z+.3],[side*1.04,3.15,0],'path');page.rotation.z=side*.19;
      for(let i=0;i<4;i++){const rule=kit.box(g,[1.6,.012,.027],[side*1.04,3.29+i*.015,-.9+i*.5],'trunk');rule.rotation.z=side*.19;}
    }
    kit.box(g,[.15,.25,z+.38],[0,3.03,0],'accent',d.accent);
    kit.beam(g,new THREE.Vector3(1.55,3.25,-.5),new THREE.Vector3(1.82,4.65,-.5),.08,'frame');
    signHeight=2.25;height=4.8;
  } else if(d.id==='research') {
    // Airy triangular pavilion, a suspended polyhedron and sparse structural ribs.
    for(const x of [-1.8,1.8])for(const zz of [-1.45,1.45])kit.beam(g,new THREE.Vector3(x,.5,zz),new THREE.Vector3(x*.8,3.3,zz*.8),.09,'frame');
    const roof=kit.mesh(g,kit.geometry('research-canopy',()=>new THREE.ConeGeometry(2.7,1.5,6)),'accent',[0,3.65,0],d.accent);roof.scale.z=.85;
    const graph=kit.mesh(g,kit.geometry('graph',()=>new THREE.IcosahedronGeometry(1.05,0)),'glass',[0,1.9,0]);
    const edges=new THREE.LineSegments(new THREE.EdgesGeometry(graph.geometry),new THREE.LineBasicMaterial({color:'#879dab'}));edges.position.copy(graph.position);g.add(edges);
    kit.cylinder(g,.09,1.4,[0,2.9,0],'metal');kit.cylinder(g,1.15,.12,[0,.55,0],'stone');
    signHeight=2.85;height=4.5;
  } else {
    // A two-storey studio with balcony and asymmetric pitched roof.
    kit.box(g,[w,2.65,z],[0,1.8,0],'wall');
    kit.box(g,[w+.16,.12,z+.18],[0,2.3,0],'trunk');
    const roof=kit.mesh(g,kit.geometry('studio-roof',()=>new THREE.ConeGeometry(1,1.25,4)),'accent',[0,3.72,0],d.accent);
    roof.rotation.y=Math.PI/4;roof.scale.set(w*.8,1,z*.84);
    for(const x of [-.95,.95])kit.box(g,[.75,.65,.08],[x,2.7,z/2+.03],'window');
    kit.box(g,[w,.14,.75],[0,2.32,z/2+.3],'stone');
    for(let x=-1.7;x<1.8;x+=.4)kit.box(g,[.06,.5,.06],[x,2.58,z/2+.65],'frame');
    kit.box(g,[w,.07,.07],[0,2.85,z/2+.65],'frame');
    kit.box(g,[1.35,.1,.65],[w/2+.65,.7,1],'trunk');
    signHeight=3.23;
  }
  // Every entrance has the same clear approach and authored physical sign.
  kit.box(g,[1.22,.09,.9],[0,.32,z/2+.35],'path');
  kit.box(g,[1.08,1.6,.13],[0,1.2,z/2+.09],'frame');
  kit.box(g,[.84,1.38,.09],[0,1.19,z/2+.17],'window');
  signboard(kit,g,d,signHeight);
  lamp(kit,g,w/2+.5,z/2+.5);
  const proxy=new THREE.Mesh(new THREE.BoxGeometry(w,height,z+.4),new THREE.MeshBasicMaterial({visible:false}));
  proxy.position.set(0,height/2+.2,0);proxy.userData={kind:'page',id:d.id};g.add(proxy);
  return g;
}

function careerMonument(kit: SceneKit, parent: THREE.Object3D, id: string, x:number,z:number) {
  const data=career.find(c=>c.id===id)!;
  const g=island(kit,parent,x,z,4.4,4.2,6.8);
  kit.cylinder(g,1.08,.22,[0,.35,-.2],'stone');
  kit.box(g,[.45,.95,.4],[0,.9,-.2],'metal');
  const round=id==='jio'||id==='iitb';
  const face=new THREE.Mesh(round?kit.geometry(`career-disc:${id}`,()=>new THREE.CylinderGeometry(1.5,1.5,.24,40)):kit.geometry('sem-board',()=>new THREE.BoxGeometry(4.45,2.05,.24)),new THREE.MeshBasicMaterial({color:'#f7f8f1',toneMapped:false}));
  face.position.set(0,2.03,-.2);if(round)face.rotation.x=Math.PI/2;g.add(face);
  if(round){const rim=kit.cylinder(g,1.56,.12,[0,2.03,-.27],'accent',data.color,40);rim.rotation.x=Math.PI/2;}
  else kit.box(g,[4.53,.09,.3],[0,3.10,-.2],'accent',data.color);
  // Rasterize SVG through the browser image loader, preserving its masks and full
  // Electro-Mechanics wordmark. SVGLoader's geometry ignores those clipping masks.
  // The image is redrawn onto a 2048px canvas: an SVG would otherwise rasterize at its
  // tiny intrinsic size (Samsung's is 241x28) and look blurry on the plaque.
  new THREE.ImageLoader().load(data.logo,image=>{
    if(kit.disposed)return;
    const natural={width:image.naturalWidth||image.width,height:image.naturalHeight||image.height};
    const scale=2048/Math.max(natural.width,natural.height),canvas=document.createElement('canvas');
    canvas.width=Math.round(natural.width*scale);canvas.height=Math.round(natural.height*scale);
    const ctx=canvas.getContext('2d')!;ctx.imageSmoothingQuality='high';ctx.drawImage(image,0,0,canvas.width,canvas.height);
    const texture=kit.crisp(new THREE.CanvasTexture(canvas));
    const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.DoubleSide,toneMapped:false});
    let width=round?2.55:4.15,height=round?2.55:width/(natural.width/natural.height);
    if(id==='iitb')height=width*natural.height/106;
    const geometry=new THREE.PlaneGeometry(width,height);
    if(id==='iitb'){
      // The official header artwork contains the seal at left. Select only that
      // region via native mesh UVs; retain the source logo without redrawing it.
      const uv=geometry.getAttribute('uv');for(let i=0;i<uv.count;i++)uv.setX(i,uv.getX(i)*106/natural.width);
    }
    const picture=new THREE.Mesh(geometry,material);picture.position.set(0,2.04,-.055);g.add(picture);
  },undefined,()=>{});
  tree(kit,g,-1.55,-.8,.72);lamp(kit,g,1.65,.65);
  const proxy=new THREE.Mesh(new THREE.BoxGeometry(round?3.3:4.6,3.7,1.4),new THREE.MeshBasicMaterial({visible:false}));
  proxy.position.set(0,1.85,-.2);proxy.userData={kind:'career',id};g.add(proxy);return proxy;
}

export function createEnvironment(kit: SceneKit): WorldScene {
  const root=new THREE.Group(), pickables:THREE.Object3D[]=[],animated:THREE.Object3D[]=[];
  bridges.forEach(([a,b])=>bridge(kit,root,a,b));
  destinations.forEach(d=>{
    island(kit,root,d.position.x,d.position.z+.9,d.width+2.8,d.depth+3.2,d.id==='robotics'?9.5:8);
    const building=architecture(kit,root,d);pickables.push(building.children.find(o=>o.userData.kind==='page')!);
    tree(kit,root,d.position.x+d.width/2+.9,d.position.z-1.4,.85);
    tree(kit,root,d.position.x-d.width/2-.75,d.position.z-.6,.65);
    kit.box(root,[1,.1,.4],[d.position.x-1.5,.65,d.position.z+d.depth/2+1],'trunk');
  });
  careerStops.forEach(stop=>pickables.push(careerMonument(kit,root,stop.id,stop.position.x,stop.position.z)));
  const ring=new THREE.Mesh(new THREE.RingGeometry(.48,.54,24),kit.material('metal'));ring.rotation.x=-Math.PI/2;ring.position.set(8,.27,-9.5);root.add(ring);
  for(const x of [-4,4])for(const z of [.6,9]){kit.box(root,[1.5,.2,1.5],[x,.14,z],'stone');lamp(kit,root,x+.8,z+.75);}
  for(let i=0;i<2;i++) {
    const drone=new THREE.Group();drone.position.set(-10+i*19,4.6+i*.4,-6+i*7);root.add(drone);
    kit.box(drone,[.44,.16,.38],[0,0,0],'wall');
    for(const a of [-1,1])for(const b of [-1,1]){kit.beam(drone,new THREE.Vector3(),new THREE.Vector3(a*.5,.02,b*.4),.035,'frame');kit.cylinder(drone,.2,.03,[a*.5,.02,b*.4],'metal');}
    drone.userData.baseY=drone.position.y;animated.push(drone);
  }
  root.updateMatrixWorld(true);
  const batches=new Map<string,{material:THREE.Material;shadow:boolean;meshes:THREE.Mesh[];geometries:THREE.BufferGeometry[]}>();
  root.traverse(object=>{
    if(!(object instanceof THREE.Mesh)||object.userData.kind)return;
    let ancestor:THREE.Object3D|null=object;
    while(ancestor){if(animated.includes(ancestor))return;ancestor=ancestor.parent;}
    const material=object.material as THREE.Material,key=`${material.uuid}:${object.castShadow}`;
    if(!batches.has(key))batches.set(key,{material,shadow:object.castShadow,meshes:[],geometries:[]});
    const source=object.geometry.index?object.geometry.toNonIndexed():object.geometry.clone();source.applyMatrix4(object.matrixWorld);
    batches.get(key)!.meshes.push(object);batches.get(key)!.geometries.push(source);
  });
  for(const [key,batch] of batches){
    const geometry=mergeGeometries(batch.geometries,false);if(!geometry)throw new Error('Static geometry could not be batched');
    kit.geometries.set(`batch:${key}`,geometry);const mesh=new THREE.Mesh(geometry,batch.material);
    mesh.castShadow=batch.shadow;mesh.receiveShadow=true;root.add(mesh);
    batch.meshes.forEach(mesh=>mesh.removeFromParent());batch.geometries.forEach(g=>g.dispose());
  }
  return {root,pickables,animated};
}
