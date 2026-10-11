import * as THREE from 'three';
import { destinations, careerStops, arrival, type Point } from '../data/world';
import { career } from '../data/career';
import { createEnvironment } from './environment';
import { createAvatar } from './avatar';
import { SceneKit } from './geometry';
import { sceneThemes, type ThemeName } from './theme';
import { cameraRelativeInput, moveOnGround, enteredDoor, isOnGround, isInsideBuilding } from './movement';

const STORAGE_KEY='portfolio-world-v1';
const MOVEMENT_KEYS=new Set(['w','a','s','d','arrowup','arrowleft','arrowdown','arrowright']);

export function mountWorld(stage:HTMLElement): () => void {
  const canvas=stage.querySelector<HTMLCanvasElement>('canvas')!;
  const loadingStarted=performance.now();
  const status=document.querySelector<HTMLElement>('[data-world-status]')!;
  const explore=document.querySelector<HTMLButtonElement>('[data-explore]')!;
  const pause=document.querySelector<HTMLButtonElement>('[data-pause-world]')!;
  const reset=document.querySelector<HTMLButtonElement>('[data-reset-world]')!;
  const panel=document.querySelector<HTMLElement>('[data-career-panel]')!;
  const close=panel.querySelector<HTMLButtonElement>('[data-close-career]')!;
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const listeners=new AbortController(), signal=listeners.signal;
  let renderer:THREE.WebGLRenderer;
  try {
    renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
  } catch {
    stage.dataset.worldState='fallback';status.textContent='Explore the campus using the destinations below.';
    explore.disabled=true;pause.disabled=true;return()=>listeners.abort();
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,window.innerWidth<760?1.4:1.8));
  renderer.shadowMap.enabled=window.innerWidth>=760;
  renderer.shadowMap.type=THREE.PCFShadowMap;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  const scene=new THREE.Scene();
  const camera=new THREE.OrthographicCamera(-20,20,15,-15,.1,150);
  camera.position.set(31,36,43);camera.lookAt(0,0,0);
  const kit=new SceneKit();const environment=createEnvironment(kit);scene.add(environment.root);
  const avatar=createAvatar(kit);scene.add(avatar.root);
  const sun=new THREE.DirectionalLight('#fff6e8',3.2);sun.position.set(-12,28,12);sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-22;sun.shadow.camera.right=22;sun.shadow.camera.top=22;sun.shadow.camera.bottom=-22;
  sun.shadow.normalBias=.06;sun.shadow.bias=-.0003;scene.add(sun);
  const fill=new THREE.HemisphereLight('#e8f2f1','#98a495',2.4);scene.add(fill);
  let point:Point={...arrival};let angle=0;let visible=true;let lost=false;let disposed=false;let navigating=false;
  let paused=motion.matches;let raf:number|null=null;let lastTime=0;let elapsed=0;let pointerDown:Point|undefined;
  let labelsDirty=true;let fpsStarted=0;let frameCount=0;let totalFrames=0;
  let returnFocus:HTMLElement|null=null;
  const keys=new Set<string>();const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2();
  try {
    const saved=JSON.parse(sessionStorage.getItem(STORAGE_KEY)??'null');
    if(saved&&Number.isFinite(saved.x)&&Number.isFinite(saved.z)&&isOnGround(saved)&&!isInsideBuilding(saved))point={x:saved.x,z:saved.z};
  } catch {}
  function save(){try{sessionStorage.setItem(STORAGE_KEY,JSON.stringify(point));}catch{}}
  function queue(){if(raf===null&&visible&&!document.hidden&&!lost&&!disposed)raf=requestAnimationFrame(frame);}
  function clearKeys(){keys.clear();queue();}
  function theme(){
    const name:ThemeName=document.documentElement.dataset.theme==='dark'?'dark':'light';const colors=sceneThemes[name];
    kit.setTheme(name);sun.color.set(colors.key);fill.color.set(colors.ambient);fill.groundColor.set(colors.rock);
    sun.intensity=name==='dark'?2.3:3.2;fill.intensity=name==='dark'?2.6:2.4;renderer.toneMappingExposure=colors.exposure;queue();
  }
  function resize(){
    const width=stage.clientWidth,height=stage.clientHeight,aspect=width/Math.max(1,height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,window.innerWidth<760?1.4:1.8));
    renderer.shadowMap.enabled=window.innerWidth>=760;
    const halfWidth=window.innerWidth<760?17.3:19.6;
    camera.left=-halfWidth;camera.right=halfWidth;camera.top=halfWidth/aspect;camera.bottom=-halfWidth/aspect;
    camera.zoom=window.innerWidth<760?.9:1;camera.updateProjectionMatrix();
    renderer.setSize(width,height,false);labelsDirty=true;queue();
  }
  function navigate(id:string){
    const destination=destinations.find(d=>d.id===id);if(!destination||navigating)return;
    navigating=true;save();clearKeys();status.textContent=`Opening ${destination.label}…`;window.location.assign(destination.href);
  }
  function showCareer(id:string,focus=true){
    const item=career.find(c=>c.id===id);if(!item)return;
    panel.querySelector('[data-career-name]')!.textContent=item.name;
    panel.querySelector('[data-career-role]')!.textContent=`${item.role} · ${item.dates}`;
    panel.querySelector('[data-career-copy]')!.textContent=item.details;
    const link=panel.querySelector<HTMLAnchorElement>('[data-career-link]')!;link.href=item.link;
    link.textContent='Explore related work ↗';panel.hidden=false;
    if(focus){returnFocus=document.activeElement as HTMLElement;clearKeys();close.focus();}
  }
  function projectLabels(){
    const size={width:stage.clientWidth,height:stage.clientHeight};
    stage.querySelectorAll<HTMLElement>('[data-landmark]').forEach(label=>{
      const destination=destinations.find(d=>d.id===label.dataset.landmark);
      const stop=careerStops.find(s=>s.id===label.dataset.landmark);
      const p=destination?{x:destination.position.x,z:destination.position.z+destination.depth/2+.62,y:.5}:stop?{...stop.position,y:2.85}:null;
      if(!p)return;const projected=new THREE.Vector3(p.x,p.y,p.z).project(camera);
      label.style.left=`${(projected.x*.5+.5)*size.width}px`;label.style.top=`${(-projected.y*.5+.5)*size.height}px`;
      label.hidden=Math.abs(projected.x)>1.03||Math.abs(projected.y)>1.03;
    });
  }
  function frame(now:number){
    raf=null;if(disposed||lost)return;
    const dt=Math.min(.04,lastTime?(now-lastTime)/1000:.016);lastTime=now;elapsed+=dt;
    const horizontal=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));
    const vertical=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));
    const input=cameraRelativeInput(horizontal,vertical,Math.atan2(camera.position.x,camera.position.z));
    const previous=point;point=moveOnGround(point,{x:input.x*3.6*dt,z:input.z*3.6*dt});
    const moving=Math.hypot(point.x-previous.x,point.z-previous.z)>.00001;
    if(moving)angle=Math.atan2(point.x-previous.x,point.z-previous.z);
    avatar.root.position.set(point.x,.28,point.z);avatar.root.rotation.y=angle;
    avatar.update(elapsed,moving,!paused&&!motion.matches);
    stage.dataset.avatarX=point.x.toFixed(2);stage.dataset.avatarZ=point.z.toFixed(2);
    const destination=enteredDoor(previous,point);if(destination){point=previous;navigate(destination);}
    environment.animated.forEach((drone,i)=>{drone.position.y=drone.userData.baseY+(!paused&&!motion.matches?Math.sin(elapsed*.8+i)*.18:0);});
    const near=careerStops.find(s=>Math.hypot(s.position.x-point.x,s.position.z-point.z)<2.2);
    if(near&&stage.dataset.nearCareer!==near.id){stage.dataset.nearCareer=near.id;status.textContent=career.find(c=>c.id===near.id)!.description;}
    if(!near&&stage.dataset.nearCareer){delete stage.dataset.nearCareer;status.textContent='Walk into a doorway, or select a building.';}
    if(labelsDirty){camera.updateMatrixWorld();projectLabels();labelsDirty=false;}renderer.render(scene,camera);
    stage.dataset.frames=String(++totalFrames);
    frameCount++;if(now-fpsStarted>=1000){stage.dataset.fps=String(Math.round(frameCount*1000/(now-fpsStarted)));fpsStarted=now;frameCount=0;}
    stage.dataset.triangles=String(renderer.info.render.triangles);stage.dataset.drawCalls=String(renderer.info.render.calls);
    if(keys.size||(!paused&&!motion.matches))queue();
  }
  canvas.addEventListener('keydown',event=>{
    const key=event.key.toLowerCase();if(MOVEMENT_KEYS.has(key)){event.preventDefault();keys.add(key);queue();}
    else if(event.key==='Escape'){clearKeys();explore.focus();status.textContent='Controls released. Scroll to explore the portfolio.';}
  },{signal});
  canvas.addEventListener('keyup',event=>{keys.delete(event.key.toLowerCase());queue();},{signal});
  canvas.addEventListener('blur',clearKeys,{signal});window.addEventListener('blur',clearKeys,{signal});
  canvas.addEventListener('pointerdown',event=>{pointerDown={x:event.clientX,z:event.clientY};},{signal});
  canvas.addEventListener('pointerup',event=>{
    if(!pointerDown||Math.hypot(pointerDown.x-event.clientX,pointerDown.z-event.clientY)>8)return;
    const rect=canvas.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
    raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(environment.pickables,false)[0];
    if(hit){const {kind,id}=hit.object.userData;if(kind==='page')navigate(id);else showCareer(id);}
  },{signal});
  canvas.addEventListener('pointermove',event=>{
    const rect=canvas.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
    raycaster.setFromCamera(pointer,camera);canvas.style.cursor=raycaster.intersectObjects(environment.pickables,false).length?'pointer':'default';
  },{signal});
  stage.querySelectorAll<HTMLButtonElement>('[data-career-stop]').forEach(button=>button.addEventListener('click',()=>showCareer(button.dataset.careerStop!),{signal}));
  close.addEventListener('click',()=>{panel.hidden=true;returnFocus?.focus();},{signal});
  panel.addEventListener('keydown',event=>{if(event.key==='Escape'){panel.hidden=true;returnFocus?.focus();}},{signal});
  explore.addEventListener('click',()=>{canvas.focus({preventScroll:true});status.textContent='Use WASD or arrow keys. Escape releases controls.';queue();},{signal});
  pause.addEventListener('click',()=>{paused=!paused;pause.setAttribute('aria-pressed',String(paused));pause.textContent=paused?'Resume motion':'Pause motion';queue();},{signal});
  reset.addEventListener('click',()=>{point={...arrival};clearKeys();save();queue();},{signal});
  document.querySelectorAll<HTMLButtonElement>('[data-direction]').forEach(button=>{
    const key=button.dataset.direction!;
    button.addEventListener('pointerdown',event=>{event.preventDefault();button.setPointerCapture(event.pointerId);keys.add(key);queue();},{signal});
    for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,()=>{keys.delete(key);queue();},{signal});
  });
  document.addEventListener('portfolio:theme',theme,{signal});
  document.addEventListener('visibilitychange',()=>{clearKeys();lastTime=0;if(document.hidden&&raf!==null){cancelAnimationFrame(raf);raf=null;}else queue();},{signal});
  motion.addEventListener('change',()=>{paused=motion.matches;pause.setAttribute('aria-pressed',String(paused));pause.textContent=paused?'Resume motion':'Pause motion';queue();},{signal});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;clearKeys();stage.dataset.worldState='fallback';status.textContent='The 3D view paused. All destinations remain available below.';},{signal});
  canvas.addEventListener('webglcontextrestored',()=>{lost=false;stage.dataset.worldState='ready';queue();},{signal});
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(stage);
  const visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible&&raf!==null){cancelAnimationFrame(raf);raf=null;clearKeys();}else{lastTime=0;queue();}},{rootMargin:'50px'});visibility.observe(stage);
  theme();resize();stage.dataset.worldState='ready';pause.setAttribute('aria-pressed',String(paused));pause.textContent=paused?'Resume motion':'Pause motion';
  stage.dataset.loadMs=String(Math.round(performance.now()-loadingStarted));
  status.textContent='Walk into a doorway, or select a building.';
  window.addEventListener('pageshow',()=>{navigating=false;queue();},{signal});
  function dispose(){
    if(disposed)return;disposed=true;save();listeners.abort();if(raf!==null)cancelAnimationFrame(raf);
    resizeObserver.disconnect();visibility.disconnect();kit.dispose();
    scene.traverse(object=>{if(object instanceof THREE.Mesh){if(![...kit.geometries.values()].includes(object.geometry))object.geometry.dispose();
      const materials=Array.isArray(object.material)?object.material:[object.material];materials.filter(m=>![...kit.materials.values()].includes(m as THREE.MeshStandardMaterial)).forEach(m=>m.dispose());}
      if(object instanceof THREE.LineSegments){object.geometry.dispose();(object.material as THREE.Material).dispose();}});
    renderer.dispose();
  }
  window.addEventListener('pagehide',event=>{save();clearKeys();if(!event.persisted)dispose();},{signal});
  return dispose;
}
