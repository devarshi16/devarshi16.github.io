import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import model from './so101-model.json';
import { armJoints,forwardKinematics,home,ikStep,originMatrix,poseError,poseFromJoints } from './kinematics';

async function loadGeometry(name:string,signal:AbortSignal) {
  const response=await fetch(`/robots/so101/${name}.mesh`,{signal});if(!response.ok)throw new Error(`Model part unavailable: ${name}`);
  const buffer=await response.arrayBuffer(),header=new DataView(buffer);
  const vertices=header.getUint32(4,true),indices=header.getUint32(8,true);
  if(header.getUint32(0,true)!==0x534f3130||buffer.byteLength!==12+vertices*12+indices*4)throw new Error('Invalid model geometry');
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(buffer,12,vertices*3),3));
  geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(buffer,12+vertices*12,indices),1));geometry.computeVertexNormals();
  return geometry;
}
export async function mountSO101(root:HTMLElement) {
  const canvas=root.querySelector<HTMLCanvasElement>('canvas')!,abort=new AbortController(),signal=abort.signal;
  const names=[...new Set(model.links.flatMap(link=>link.visuals.map(v=>v.mesh)))];
  const geometries=new Map<string,THREE.BufferGeometry>();
  let teardown=()=>abort.abort();
  window.addEventListener('pagehide',event=>{if(!event.persisted)teardown();},{signal});
  try{await Promise.all(names.map(async name=>geometries.set(name,await loadGeometry(name,signal))));}
  catch(error){geometries.forEach(g=>g.dispose());if(!signal.aborted)throw error;return;}
  if(signal.aborted){geometries.forEach(g=>g.dispose());return;}
  let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});}
  catch{geometries.forEach(g=>g.dispose());throw new Error('WebGL unavailable');}
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.shadowMap.type=THREE.PCFShadowMap;
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(40,1,.005,5);camera.up.set(0,0,1);
  const orbit=new OrbitControls(camera,canvas);orbit.minDistance=.2;orbit.maxDistance=1.8;orbit.maxPolarAngle=Math.PI*.48;orbit.enableDamping=false;
  function resetCamera(){orbit.target.set(.15,-.045,.17);const offset=new THREE.Vector3(.55,-.65,.43).multiplyScalar(Math.max(1,.95/camera.aspect));camera.position.copy(orbit.target).add(offset);orbit.update();queue();}
  const printed=new THREE.MeshStandardMaterial({color:'#9cb49a',roughness:.82,flatShading:true});
  const motor=new THREE.MeshStandardMaterial({color:'#526a72',roughness:.7,metalness:.1,flatShading:true});
  const baseMaterial=new THREE.MeshStandardMaterial({color:'#ced1c7',roughness:1});
  const targetMaterial=new THREE.MeshStandardMaterial({color:'#a09dbb',transparent:true,opacity:.42,depthWrite:false,roughness:.7});
  const allMaterials:THREE.Material[]=[printed,motor,baseMaterial,targetMaterial];
  const links=new Map<string,THREE.Group>();
  model.links.forEach(link=>{
    const group=new THREE.Group();group.matrixAutoUpdate=false;scene.add(group);links.set(link.name,group);
    link.visuals.forEach(v=>{const mesh=new THREE.Mesh(geometries.get(v.mesh),v.material==='sts3215'?motor:printed);
      mesh.matrixAutoUpdate=false;mesh.matrix.copy(originMatrix(v.xyz,v.rpy).scale(new THREE.Vector3().fromArray(v.scale)));mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);});
  });
  const platform=new THREE.Mesh(new THREE.BoxGeometry(.48,.42,.02),baseMaterial);platform.position.set(.035,0,-.019);platform.receiveShadow=true;scene.add(platform);
  const grid=new THREE.GridHelper(.8,16,'#aab6b2','#ccd2ca');grid.rotation.x=Math.PI/2;grid.position.z=-.008;scene.add(grid);
  const sun=new THREE.DirectionalLight('#fff6e8',2.8);sun.position.set(-.4,-.5,1.2);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
  Object.assign(sun.shadow.camera,{left:-.5,right:.5,top:.5,bottom:-.5,near:.05,far:2});sun.shadow.bias=-.0001;sun.shadow.normalBias=.001;scene.add(sun);
  const fill=new THREE.HemisphereLight('#e8f2f1','#98a495',2);fill.position.set(0,0,1);scene.add(fill);
  const target=new THREE.Group();scene.add(target);
  const cube=new THREE.Mesh(new THREE.BoxGeometry(.045,.045,.045),targetMaterial);target.add(cube);
  const edge=new THREE.LineSegments(new THREE.EdgesGeometry(cube.geometry),new THREE.LineBasicMaterial({color:'#827b96'}));target.add(edge);
  const ee=new THREE.Group();scene.add(ee);
  const dot=new THREE.Mesh(new THREE.SphereGeometry(.0035,12,8),new THREE.MeshBasicMaterial({color:'#547d69'}));ee.add(dot);
  function axes(parent:THREE.Group,length:number){
    const colors=['#a77f83','#8fa58d','#789ca6'];for(let i=0;i<3;i++){const axis=new THREE.Vector3();axis.setComponent(i,1);parent.add(new THREE.ArrowHelper(axis,new THREE.Vector3(),length,colors[i],length*.22,length*.1));}
  }
  axes(target,.05);axes(ee,.025);
  const errorLine=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),new THREE.LineDashedMaterial({color:'#a9957e',dashSize:.005,gapSize:.003}));scene.add(errorLine);
  const transform=new TransformControls(camera,canvas);transform.setSize(.82);transform.attach(target);scene.add(transform.getHelper());
  // Tone down the standard RGB gizmo to the portfolio's diagram colours.
  transform.getHelper().traverse(object=>{
    const materials=(object as THREE.Mesh).material;if(!materials)return;
    for(const material of Array.isArray(materials)?materials:[materials])if('color' in material){
      const color=(material as THREE.MeshBasicMaterial).color,hex=color.getHex(),palette:Record<number,string>={0xff0000:'#a77f83',0x00ff00:'#8fa58d',0x0000ff:'#789ca6',0xffff00:'#c5aa87'};
      if(palette[hex])color.set(palette[hex]);
    }
  });
  let q=[...home],auto=true,running=true,visible=true,canvasVisible=true,disposed=false,lost=false,raf:number|null=null,iterations=0,stalled=0;
  const defaultPose=poseFromJoints([.4,-.1,.25,-.4,.5]);target.position.copy(defaultPose.position);target.quaternion.copy(defaultPose.quaternion);
  const controls=root.querySelector<HTMLInputElement>('[data-auto-follow]')!,orientation=root.querySelector<HTMLInputElement>('[data-solve-orientation]')!;
  const status=root.querySelector<HTMLElement>('[data-solve-status]')!;
  function pose(){return {position:target.position.clone(),quaternion:target.quaternion.clone().normalize()};}
  function queue(){if(raf===null&&!disposed&&!lost&&visible&&!document.hidden)raf=requestAnimationFrame(frame);}
  function syncInputs(){
    const euler=new THREE.Euler().setFromQuaternion(target.quaternion,'ZYX');
    const values:Record<string,number>={x:target.position.x,y:target.position.y,z:target.position.z,roll:euler.x*180/Math.PI,pitch:euler.y*180/Math.PI,yaw:euler.z*180/Math.PI};
    root.querySelectorAll<HTMLInputElement>('[data-pose-input]').forEach(input=>input.value=values[input.dataset.poseInput!].toFixed(['x','y','z'].includes(input.dataset.poseInput!)?3:1));
  }
  function restart(){iterations=0;stalled=0;running=auto;root.dataset.solved='false';status.textContent=auto?'Following the requested pose…':'Target updated. Use One IK step or enable Auto follow.';queue();}
  function renderArm(){
    const fk=forwardKinematics(q);links.forEach((group,name)=>group.matrix.copy(fk.links.get(name)!));ee.position.copy(fk.position);ee.quaternion.copy(fk.quaternion);
    const positions=errorLine.geometry.getAttribute('position') as THREE.BufferAttribute;positions.setXYZ(0,...fk.position.toArray());positions.setXYZ(1,...target.position.toArray());positions.needsUpdate=true;errorLine.geometry.computeBoundingSphere();errorLine.computeLineDistances();
    const err=poseError(q,pose());root.querySelector('[data-position-error]')!.textContent=`${(err.positionNorm*1000).toFixed(1)} mm`;
    root.querySelector('[data-rotation-error]')!.textContent=`${(err.rotationNorm*180/Math.PI).toFixed(1)}°${orientation.checked?'':' (not constrained)'}`;
    root.querySelector('[data-iterations]')!.textContent=String(iterations);
    root.dataset.ikPositionError=String(err.positionNorm);root.dataset.ikRotationError=String(err.rotationNorm);
    root.querySelectorAll<HTMLElement>('[data-joint-value]').forEach((output,i)=>output.textContent=`${(q[i]*180/Math.PI).toFixed(1)}°`);
    return err;
  }
  function step(){
    const result=ikStep(q,pose(),orientation.checked?.075:0);q=result.q;iterations++;
    stalled=result.improvement<1e-10?stalled+1:0;
    if(result.error.positionNorm<.001&&(!orientation.checked||result.error.rotationNorm<Math.PI/90)){
      running=false;status.textContent='Matched within 1 mm'+(orientation.checked?' and 2°.':'.');root.dataset.solved='true';
    }else if(stalled>=35||iterations>=900){running=false;status.textContent='Stopped with residual error. This pose may be unreachable or limited by this starting configuration.';root.dataset.solved='false';}
    else{status.textContent='Reducing position'+(orientation.checked?' and rotation':'')+' error…';root.dataset.solved='false';}
  }
  function frame(){raf=null;if(disposed||lost)return;if(running)for(let i=0;i<2&&running;i++)step();renderArm();if(canvasVisible)renderer.render(scene,camera);if(running)queue();}
  transform.addEventListener('dragging-changed',event=>{orbit.enabled=!event.value;});
  transform.addEventListener('objectChange',()=>{target.position.x=THREE.MathUtils.clamp(target.position.x,-.5,.5);target.position.y=THREE.MathUtils.clamp(target.position.y,-.5,.5);target.position.z=THREE.MathUtils.clamp(target.position.z,.005,.6);syncInputs();restart();});
  transform.addEventListener('change',queue);orbit.addEventListener('change',queue);
  root.querySelectorAll<HTMLButtonElement>('[data-transform-mode]').forEach(button=>button.addEventListener('click',()=>{
    transform.setMode(button.dataset.transformMode as 'translate'|'rotate');root.querySelectorAll('[data-transform-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));queue();
  },{signal}));
  root.querySelectorAll<HTMLInputElement>('[data-pose-input]').forEach(input=>input.addEventListener('input',()=>{
    const inputs=root.querySelectorAll<HTMLInputElement>('[data-pose-input]'),values=Array.from(inputs,i=>i.valueAsNumber);if(values.some(v=>!Number.isFinite(v)))return;
    target.position.set(THREE.MathUtils.clamp(values[0],-.5,.5),THREE.MathUtils.clamp(values[1],-.5,.5),THREE.MathUtils.clamp(values[2],.005,.6));
    target.quaternion.setFromEuler(new THREE.Euler(...values.slice(3).map(v=>v*Math.PI/180) as [number,number,number],'ZYX'));restart();
  },{signal}));
  root.querySelectorAll<HTMLInputElement>('[data-pose-input]').forEach(input=>input.addEventListener('change',syncInputs,{signal}));
  controls.addEventListener('change',()=>{auto=controls.checked;running=auto;stalled=0;status.textContent=auto?'Following the requested pose…':'Auto follow paused.';queue();},{signal});
  orientation.addEventListener('change',restart,{signal});
  root.querySelector('[data-step-ik]')!.addEventListener('click',()=>{auto=false;controls.checked=false;running=false;step();running=false;queue();},{signal});
  root.querySelector('[data-reset-arm]')!.addEventListener('click',()=>{q=[...home];restart();},{signal});
  root.querySelector('[data-reset-camera]')!.addEventListener('click',resetCamera,{signal});
  root.querySelectorAll<HTMLButtonElement>('[data-pose-preset]').forEach(button=>button.addEventListener('click',()=>{
    const preset=button.dataset.posePreset;q=[...home];
    if(preset==='outside'){target.position.set(.4,.3,.4);target.quaternion.identity();orbit.target.set(.16,.1,.2);camera.position.copy(orbit.target).add(new THREE.Vector3(.8,-.8,.6));orbit.update();}
    else{const goal=preset==='home'?poseFromJoints(home):defaultPose;target.position.copy(goal.position);target.quaternion.copy(goal.quaternion);resetCamera();}
    syncInputs();restart();
  },{signal}));
  const jointReadout=root.querySelector('[data-joint-angles]')!;
  armJoints.forEach(j=>{const row=document.createElement('div'),name=document.createElement('dt'),value=document.createElement('dd'),angle=document.createElement('span'),limits=document.createElement('small');
    name.textContent=j.name.replaceAll('_',' ');angle.dataset.jointValue='';limits.textContent=`${(j.lower*180/Math.PI).toFixed(0)}…${(j.upper*180/Math.PI).toFixed(0)}°`;value.append(angle,limits);row.append(name,value);jointReadout.append(row);
  });
  function theme(){
    const dark=document.documentElement.dataset.theme==='dark';scene.background=new THREE.Color(dark?'#29363c':'#e6eae3');printed.color.set(dark?'#8ba89a':'#9cb49a');motor.color.set(dark?'#607783':'#526a72');baseMaterial.color.set(dark?'#526771':'#ced1c7');sun.intensity=dark?2:2.8;fill.intensity=dark?2.4:2;
    for(const material of Array.isArray(grid.material)?grid.material:[grid.material]){material.color.set(dark?'#58717a':'#ffffff');material.transparent=true;material.opacity=dark?.4:.65;}queue();
  }
  function resize(){const wrap=canvas.parentElement!,width=wrap.clientWidth,height=wrap.clientHeight;renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1.3:1.7));renderer.shadowMap.enabled=innerWidth>=700;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();queue();}
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(canvas.parentElement!);
  const visibility=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.target===root)visible=entry.isIntersecting;else canvasVisible=entry.isIntersecting;}if(!visible&&raf!==null){cancelAnimationFrame(raf);raf=null;}else queue();});visibility.observe(root);visibility.observe(canvas);
  document.addEventListener('portfolio:theme',theme,{signal});document.addEventListener('visibilitychange',()=>{if(document.hidden&&raf!==null){cancelAnimationFrame(raf);raf=null;}else queue();},{signal});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;root.dataset.demoState='fallback';root.querySelector('[data-loading-message]')!.textContent='The 3D view paused. Reload the playground to restore it.';},{signal});
  canvas.addEventListener('webglcontextrestored',()=>{lost=false;root.dataset.demoState='ready';queue();},{signal});
  syncInputs();theme();resize();resetCamera();renderArm();root.dataset.demoState='ready';root.querySelectorAll<HTMLInputElement|HTMLButtonElement>('input,button').forEach(control=>control.disabled=false);queue();
  function dispose(){
    if(disposed)return;disposed=true;abort.abort();if(raf!==null)cancelAnimationFrame(raf);resizeObserver.disconnect();visibility.disconnect();orbit.dispose();transform.dispose();
    const geometrySet=new Set(geometries.values()),materialSet=new Set(allMaterials);
    scene.traverse(object=>{const rendered=object as THREE.Mesh;if(rendered.geometry)geometrySet.add(rendered.geometry);if(rendered.material)for(const material of Array.isArray(rendered.material)?rendered.material:[rendered.material])materialSet.add(material);});
    geometrySet.forEach(g=>g.dispose());materialSet.forEach(m=>m.dispose());renderer.dispose();
  }
  teardown=dispose;window.addEventListener('pageshow',queue,{signal});return dispose;
}
