import * as THREE from 'three';
import { SceneKit } from './geometry';

export function createAvatar(kit:SceneKit) {
  const root=new THREE.Group();root.scale.setScalar(.92);
  const body=kit.box(root,[.53,.64,.3],[0,1.1,0],'avatar');
  kit.box(root,[.27,.16,.035],[0,1.28,.17],'accent','#a0c8bf');
  kit.mesh(root,kit.geometry('head',()=>new THREE.BoxGeometry(.39,.43,.36)),'skin',[0,1.65,0],'#cfa883');
  kit.box(root,[.43,.12,.4],[0,1.87,0],'hair','#3e454a');
  kit.box(root,[.42,.26,.1],[0,1.75,-.16],'hair','#3e454a');
  kit.box(root,[.32,.07,.04],[0,1.68,.2],'frame');
  const arms:THREE.Group[]=[],legs:THREE.Group[]=[];
  for(const side of [-1,1]) {
    const arm=new THREE.Group();arm.position.set(side*.37,1.34,0);root.add(arm);
    kit.box(arm,[.17,.48,.18],[0,-.22,0],'avatar');kit.box(arm,[.16,.16,.17],[0,-.5,0],'skin','#cfa883');arms.push(arm);
    const leg=new THREE.Group();leg.position.set(side*.15,.8,0);root.add(leg);
    kit.box(leg,[.21,.53,.21],[0,-.25,0],'frame');kit.box(leg,[.23,.15,.36],[0,-.56,.07],'avatar');legs.push(leg);
  }
  kit.box(root,[.4,.48,.18],[0,1.13,-.22],'trunk');
  kit.box(root,[.05,.48,.04],[-.2,1.1,.17],'metal');kit.box(root,[.05,.48,.04],[.2,1.1,.17],'metal');
  return {root,update(time:number,moving:boolean,ambient:boolean){
    const walk=moving?Math.sin(time*10)*.65:0;
    legs[0].rotation.x=walk;legs[1].rotation.x=-walk;arms[0].rotation.x=-walk*.65;arms[1].rotation.x=walk*.65;
    body.position.y=1.1+(ambient&&!moving?Math.sin(time*2)*.012:0);
  }};
}
