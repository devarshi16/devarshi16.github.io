import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { destinations, careerStops, bridges, type WorldDestination } from '../data/world';
import { career } from '../data/career';
import { SceneKit, tree, lamp, robotArm } from './geometry';

export type WorldScene = { root: THREE.Group; pickables: THREE.Object3D[]; animated: THREE.Object3D[]; };

function island(kit: SceneKit, parent: THREE.Object3D, x: number, z: number, width: number, depth: number, height = 3) {
  const group = new THREE.Group(); group.position.set(x, 0, z); parent.add(group);
  const rock = kit.mesh(group, kit.geometry(`rock:${width}:${depth}:${height}`, () => {
    const g = new THREE.CylinderGeometry(1, .12, height, 7, 2); g.scale(width * .58, 1, depth * .58); return g;
  }), 'rock', [0, -height / 2 - .18, 0]); rock.rotation.y = .22;
  kit.box(group, [width, .35, depth], [0, -.04, 0], 'stone');
  kit.box(group, [width-.12, .08, depth-.12], [0, .18, 0], 'ground');
  return group;
}

function bridge(kit: SceneKit, parent: THREE.Object3D, a: {x:number;z:number}, b: {x:number;z:number}) {
  const dx=b.x-a.x, dz=b.z-a.z, length=Math.hypot(dx,dz);
  const group=new THREE.Group(); group.position.set((a.x+b.x)/2,.14,(a.z+b.z)/2); group.rotation.y=Math.atan2(dx,dz);parent.add(group);
  kit.box(group,[1.45,.2,length],[0,0,0],'stone');
  kit.box(group,[1.2,.04,length],[0,.12,0],'path');
  for(let i=-length/2+.35;i<length/2;i+=1.1) {
    kit.box(group,[1.1,.018,.035],[0,.15,i],'trunk');
  }
  for(const side of [-1,1]) {
    for(let i=-length/2+.3;i<length/2;i+=2.1) kit.box(group,[.08,.5,.08],[side*.65,.32,i],'frame');
    kit.box(group,[.06,.07,length],[side*.65,.55,0],'frame');
  }
}

function architecture(kit: SceneKit, parent: THREE.Object3D, d: WorldDestination): THREE.Group {
  const g=new THREE.Group();g.position.set(d.position.x,0,d.position.z);parent.add(g);
  const w=d.width, z=d.depth, h=d.id==='robotics'?2.9:2.35;
  kit.box(g,[w,.26,z],[0,.35,0],'stone');
  if(d.id==='robotics') {
    kit.box(g,[w,.18,.4],[0,h+.55,-z/2+.2],'wall');kit.box(g,[w,.18,.4],[0,h+.55,z/2-.2],'wall');
    kit.box(g,[.35,.18,z],[-w/2+.17,h+.55,0],'wall');kit.box(g,[.35,.18,z],[w/2-.17,h+.55,0],'wall');
    kit.box(g,[w-.65,.06,z-.75],[0,h+.63,0],'glass');
  } else {
    kit.box(g,[w,.18,z],[0,h+.55,0],'wall');
    kit.box(g,[w,.12,z+.25],[0,h+.7,0],'accent',d.accent);
  }
  kit.box(g,[w,.12,.12],[0,h+.81,z/2],'frame');
  for(const x of [-w/2+.12,w/2-.12]) for(const zz of [-z/2+.12,z/2-.12]) kit.box(g,[.2,h,.2],[x,h/2+.46,zz],'wall');
  kit.box(g,[w-.4,h-.25,.09],[0,h/2+.47,-z/2+.12],'glass');
  for(const side of [-1,1]) kit.box(g,[.08,h-.25,z-.4],[side*(w/2-.12),h/2+.47,0],'glass');
  // Open entrance, visible mullions, and warm inset panels give the facades actual depth.
  for(const side of [-1,1]) kit.box(g,[w/2-.85,h-.3,.1],[side*(w/4+.34),h/2+.47,z/2-.12],'glass');
  for(let x=-w/2+.4;x<w/2-.2;x+=.85) kit.box(g,[.05,h-.24,.08],[x,h/2+.47,-z/2+.2],'frame');
  kit.box(g,[1.22,.09,.9],[0,.32,z/2+.35],'path');
  kit.box(g,[1.17,1.9,.08],[0,1.35,z/2-.26],'frame');
  kit.box(g,[.94,1.65,.09],[0,1.32,z/2-.19],'window');
  kit.box(g,[.55,.55,.9],[-w/2+.58,.6,z/2+.65],'stone');tree(kit,g,-w/2+.56,z/2+.65,.55);
  lamp(kit,g,w/2+.5,z/2+.5);
  if(d.id==='robotics') {
    robotArm(kit,g,-1.05,-.2,.2);robotArm(kit,g,1,-.45,-2.7);
    kit.box(g,[1.6,.07,1.25],[.1,.92,.6],'path');kit.box(g,[.6,.35,.6],[.05,1.13,.6],'accent','#b1a0b9');
    kit.box(g,[1.3,.1,1.1],[-1.2,h+.87,-.5],'metal');
    for(let i=0;i<4;i++)kit.box(g,[.09,.25+i*.12,.09],[-1.55+i*.22,h+1.06+i*.06,-.5],'frame');
  } else if(d.id==='vision') {
    const lens=kit.cylinder(g,.65,1.4,[0,1.4,0],'frame');lens.rotation.x=Math.PI/2; lens.rotation.z=-.2;
    const glass=kit.cylinder(g,.54,.05,[0,1.4,.73],'glass');glass.rotation.x=Math.PI/2;
    kit.cylinder(g,.11,1,[0,.8,0],'metal');
    const dome=kit.mesh(g,kit.geometry('dome',()=>new THREE.SphereGeometry(1.2,12,6,0,Math.PI*2,0,Math.PI/2)),'glass',[0,h+.85,0]);dome.scale.set(1,.7,1);
    kit.cylinder(g,.08,.8,[0,h+1.7,0],'frame');
  } else if(d.id==='maker') {
    kit.box(g,[2.1,.16,1.2],[0,1,-.25],'trunk');
    for(const x of [-.85,.85])kit.box(g,[.12,.6,.8],[x,.7,-.25],'metal');
    kit.box(g,[.9,.08,.65],[-.3,1.14,-.2],'accent','#507e6c');
    for(let i=0;i<4;i++)kit.box(g,[.1,.08,.24],[-.6+i*.2,1.23,-.1],'frame');
    kit.box(g,[.7,.8,.65],[.7,1.4,-.25],'frame');kit.box(g,[.5,.55,.52],[.7,1.42,-.2],'window');
    kit.box(g,[1.1,.1,.75],[-.8,h+.82,-.4],'accent',d.accent);
  } else if(d.id==='journal') {
    for(let i=0;i<4;i++) {
      kit.box(g,[.26,.7+i*.08,.8],[-1.25+i*.5,1,-.3],'accent',['#b5a2ad','#91a9ac','#b9ad94','#8d9e8b'][i]);
    }
    kit.box(g,[2.9,.12,1.25],[0,1.45,-.4],'trunk');
    const book=kit.box(g,[1.9,.16,1.4],[0,h+1,0],'path');book.rotation.z=-.08;
    kit.box(g,[.12,.2,1.48],[0,h+1.05,0],'accent',d.accent);
  } else if(d.id==='research') {
    const roof=kit.mesh(g,kit.geometry('research-roof',()=>new THREE.ConeGeometry(2.3,1.3,6)),'glass',[0,h+1.28,0]);roof.rotation.y=Math.PI/6;
    const graph=kit.mesh(g,kit.geometry('graph',()=>new THREE.IcosahedronGeometry(.78,0)),'accent',[.5,1.5,0],d.accent);
    const edges=new THREE.LineSegments(new THREE.EdgesGeometry(graph.geometry),new THREE.LineBasicMaterial({color:'#d9deef'}));edges.position.copy(graph.position);g.add(edges);
    tree(kit,g,-1.1,-.25,.7);
  } else {
    kit.box(g,[1.4,.13,.7],[0,1,-.4],'trunk');
    kit.box(g,[.7,.5,.08],[0,1.32,-.5],'frame');kit.box(g,[.58,.36,.02],[0,1.32,-.44],'window');
    const roof=kit.mesh(g,kit.geometry('studio-roof',()=>new THREE.ConeGeometry(2.7,1,4)),'accent',[0,h+1.23,0],d.accent);roof.rotation.y=Math.PI/4;roof.scale.z=.9;
  }
  // Picking proxy avoids expensive recursive intersections of every prop.
  const proxy=new THREE.Mesh(new THREE.BoxGeometry(w,h+.8,z),new THREE.MeshBasicMaterial({visible:false}));
  proxy.position.set(0,h/2+.6,0);proxy.userData={kind:'page',id:d.id};g.add(proxy);
  return g;
}

function careerMonument(kit: SceneKit, parent: THREE.Object3D, id: string, x:number,z:number) {
  const data=career.find(c=>c.id===id)!;
  const g=island(kit,parent,x,z,3.4,3.2,3.8);
  kit.cylinder(g,.85,.22,[0,.35,0],'stone');
  kit.box(g,[.45,.95,.4],[0,.9,0],'metal');
  const plate=kit.box(g,[2.25,1.35,.2],[0,1.75,0],'wall');plate.rotation.y=-.12;
  kit.box(g,[2.34,.09,.26],[0,2.46,0],'accent',data.color);
  if(data.logo.endsWith('.svg')) {
    new SVGLoader().load(data.logo,svg=>{
      if(kit.disposed)return;
      const relief=new THREE.Group();
      svg.paths.forEach((path,index)=>path.toShapes().forEach((shape,part)=>{
        const geometry=new THREE.ExtrudeGeometry(shape,{depth:5,bevelEnabled:false,curveSegments:3});
        kit.geometries.set(`logo:${id}:${index}:${part}`,geometry);
        const mesh=new THREE.Mesh(geometry,kit.material('brand',`#${path.color.getHexString()}`));relief.add(mesh);
      }));
      const bounds=new THREE.Box3().setFromObject(relief),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
      relief.children.forEach(child=>child.position.set(-center.x,-center.y,0));
      const scale=Math.min(1.95/size.x,.94/size.y);relief.scale.set(scale,-scale,scale);relief.position.set(0,1.78,.12);relief.rotation.y=-.12;g.add(relief);
    },undefined,()=>{});
  } else {
    new THREE.TextureLoader().load(data.logo,texture=>{
      if(kit.disposed){texture.dispose();return;}
      texture.colorSpace=THREE.SRGBColorSpace;kit.trackedTextures.add(texture);
      const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.DoubleSide});
      const ratio=texture.image.width/texture.image.height,width=Math.min(1.8,1.04*ratio),height=width/ratio;
      const picture=new THREE.Mesh(new THREE.PlaneGeometry(width,height),material);picture.position.set(0,1.78,.115);picture.rotation.y=-.12;g.add(picture);
    },undefined,()=>{});
  }
  tree(kit,g,-1.1,.75,.6);lamp(kit,g,1.15,.65);
  const proxy=new THREE.Mesh(new THREE.BoxGeometry(2.5,2.8,1.3),new THREE.MeshBasicMaterial({visible:false}));
  proxy.position.set(0,1.4,0);proxy.userData={kind:'career',id};g.add(proxy);return proxy;
}

export function createEnvironment(kit: SceneKit): WorldScene {
  const root=new THREE.Group(), pickables:THREE.Object3D[]=[],animated:THREE.Object3D[]=[];
  island(kit,root,0,1,5.4,7.3,5.5);
  kit.cylinder(root,1.1,.04,[1.8,.24,2.4],'path',undefined,24);
  const ring=new THREE.Mesh(new THREE.RingGeometry(.93,1.01,32),kit.material('metal'));ring.rotation.x=-Math.PI/2;ring.position.set(1.8,.27,2.4);root.add(ring);
  bridges.forEach(([a,b])=>bridge(kit,root,a,b));
  destinations.forEach(d=>{
    island(kit,root,d.position.x,d.position.z+.9,d.width+2.8,d.depth+3.2,d.id==='robotics'?6.4:5);
    const building=architecture(kit,root,d);const proxy=building.children.find(o=>o.userData.kind==='page')!;pickables.push(proxy);
    tree(kit,root,d.position.x+d.width/2+.9,d.position.z-1.5,.9);
    tree(kit,root,d.position.x-d.width/2-.75,d.position.z-.6,.65);
  });
  careerStops.forEach(stop=>pickables.push(careerMonument(kit,root,stop.id,stop.position.x,stop.position.z)));
  // Small central mechanism and academic garden add interest along the paths.
  robotArm(kit,root,-1.4,1.3,-1.6);tree(kit,root,-1.8,3.5,.75);lamp(kit,root,2.3,.6);
  for(const [x,z] of [[-10,4.7],[4.6,8.6],[10.4,1.7]])tree(kit,root,x,z,.75);
  for(let i=0;i<3;i++) {
    const drone=new THREE.Group();drone.position.set(-8+i*8,5+i*.3,-5+i*5);root.add(drone);
    kit.box(drone,[.44,.16,.38],[0,0,0],'wall');
    for(const a of [-1,1])for(const b of [-1,1]){kit.beam(drone,new THREE.Vector3(),new THREE.Vector3(a*.5,.02,b*.4),.035,'frame');kit.cylinder(drone,.2,.03,[a*.5,.02,b*.4],'metal');}
    drone.userData.baseY=drone.position.y;animated.push(drone);
  }
  // Merge static geometry per material. Keep animated props and picking proxies
  // separate so interaction/lifecycle behavior does not depend on the batching.
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
