import * as THREE from 'three';
import { destinations, careerStops, arrival, type Point } from '../data/world';
import { career } from '../data/career';
import { createEnvironment } from './environment';
import { createAvatar } from './avatar';
import { SceneKit } from './geometry';
import { sceneThemes, type ThemeName } from './theme';
import { isometricInput, moveOnGround, enteredDoor, isOnGround, isInsideBuilding } from './movement';

const STORAGE_KEY='portfolio-world-grid-v2';
const MOVEMENT_KEYS=new Set(['w','a','s','d','arrowup','arrowleft','arrowdown','arrowright']);

export function mountWorld(stage:HTMLElement): () => void {
  const canvas=stage.querySelector<HTMLCanvasElement>('canvas')!;
  const loadingStarted=performance.now();
  const status=document.querySelector<HTMLElement>('[data-world-status]')!;
  const pause=document.querySelector<HTMLButtonElement>('[data-pause-world]')!;
  const reset=document.querySelector<HTMLButtonElement>('[data-reset-world]')!;
  const panel=stage.querySelector<HTMLElement>('[data-world-callout]')!;
  const hero=stage.closest<HTMLElement>('.hero')!;
  const close=panel.querySelector<HTMLButtonElement>('[data-close-callout]')!;
  const leader=stage.querySelector<SVGSVGElement>('[data-callout-leader]')!;
  const leaderPath=leader.querySelector<SVGPathElement>('[data-callout-path]')!;
  const avatarMarker=stage.querySelector<HTMLButtonElement>('[data-avatar-marker]')!;
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const listeners=new AbortController(), signal=listeners.signal;
  let renderer:THREE.WebGLRenderer;
  try { renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'}); }
  catch {stage.dataset.worldState='fallback';status.textContent='Explore the campus using the directory below.';pause.disabled=true;return()=>listeners.abort();}
  renderer.shadowMap.type=THREE.PCFShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;
  const scene=new THREE.Scene(), camera=new THREE.OrthographicCamera(-20,20,15,-15,.1,160);
  camera.position.set(34,34,34);camera.lookAt(0,-1.5,-1);
  const kit=new SceneKit(), environment=createEnvironment(kit), avatar=createAvatar(kit);
  scene.add(environment.root,avatar.root);
  const sun=new THREE.DirectionalLight('#fff6e8',3.2);sun.position.set(-12,28,12);sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-24,right:24,top:24,bottom:-24});
  sun.shadow.normalBias=.06;sun.shadow.bias=-.0003;scene.add(sun);
  const fill=new THREE.HemisphereLight('#e8f2f1','#98a495',2.4);scene.add(fill);
  let point:Point={...arrival}, angle=0, visible=true, lost=false, disposed=false, navigating=false;
  let paused=motion.matches, raf:number|null=null, lastTime=0, elapsed=0, pointerDown:Point|undefined;
  let labelsDirty=true, fpsStarted=0, frameCount=0, totalFrames=0;
  let annotation:{id:string;persistent:boolean}|null=null, returnFocus:HTMLElement|null=null;
  let hoverTimer:ReturnType<typeof setTimeout>|undefined;
  const keys=new Set<string>(), raycaster=new THREE.Raycaster(), pointer=new THREE.Vector2();
  try {
    const saved=JSON.parse(sessionStorage.getItem(STORAGE_KEY)??'null');
    if(saved&&Number.isFinite(saved.x)&&Number.isFinite(saved.z)&&isOnGround(saved)&&!isInsideBuilding(saved))point={x:saved.x,z:saved.z};
  } catch {}
  // Measure actual projected vertices once, so portrait screens fit the complete
  // campus rather than clipping its outer islands or long rock bases.
  camera.updateMatrixWorld();environment.root.updateMatrixWorld(true);
  const viewBounds=new THREE.Box3(), vertex=new THREE.Vector3();
  environment.root.traverse(object=>{
    if(!(object instanceof THREE.Mesh))return;
    const positions=object.geometry.getAttribute('position');
    for(let i=0;i<positions.count;i++)viewBounds.expandByPoint(vertex.fromBufferAttribute(positions,i).applyMatrix4(object.matrixWorld).applyMatrix4(camera.matrixWorldInverse));
  });
  const viewSize=viewBounds.getSize(new THREE.Vector3()),viewCenter=viewBounds.getCenter(new THREE.Vector3());
  function save(){try{sessionStorage.setItem(STORAGE_KEY,JSON.stringify(point));}catch{}}
  function queue(){if(raf===null&&visible&&!document.hidden&&!lost&&!disposed)raf=requestAnimationFrame(frame);}
  function clearKeys(){keys.clear();queue();}
  function project(p:{x:number;y:number;z:number}) {
    const v=new THREE.Vector3(p.x,p.y,p.z).project(camera);
    return {x:(v.x*.5+.5)*stage.clientWidth,y:(-v.y*.5+.5)*stage.clientHeight,visible:Math.abs(v.x)<1.03&&Math.abs(v.y)<1.03};
  }
  function closeAnnotation(restore=false) {
    clearTimeout(hoverTimer);annotation=null;panel.hidden=true;leader.dataset.active='false';hero.style.setProperty('--annotation-height','0px');
    avatarMarker.setAttribute('aria-expanded','false');
    if(restore)returnFocus?.focus({preventScroll:true});queue();
  }
  function positionAnnotation() {
    if(!annotation)return;
    const stop=careerStops.find(s=>s.id===annotation!.id);
    const anchor=project(stop?{...stop.position,y:2.9}:{...point,y:1.65});
    const width=stage.clientWidth,height=stage.clientHeight,pw=panel.offsetWidth,ph=panel.offsetHeight;
    const mobile=window.innerWidth<760;
    const left=mobile?(width-pw)/2:anchor.x>width/2?16:width-pw-16;
    // A phone gets an annotation below the drawing, rather than a card covering
    // the entire campus. Its leader still points back to the selected object.
    const top=mobile?height+12:Math.max(16,Math.min(height-ph-16,anchor.y-ph*.5));
    hero.style.setProperty('--annotation-height',mobile?`${ph+28}px`:'0px');
    panel.style.left=`${Math.max(14,left)}px`;panel.style.top=`${Math.max(14,top)}px`;
    leader.setAttribute('viewBox',`0 0 ${width} ${height}`);
    const startX=mobile?Math.max(left+20,Math.min(left+pw-20,anchor.x)):anchor.x>width/2?left+pw:left;
    const startY=mobile?top>anchor.y?top:top+ph:Math.max(top+24,Math.min(top+ph-24,anchor.y));
    const elbowX=mobile?startX:(startX+anchor.x)/2,elbowY=mobile?(startY+anchor.y)/2:startY;
    leaderPath.setAttribute('d',`M ${startX} ${startY} L ${elbowX} ${elbowY} L ${anchor.x} ${anchor.y}`);
  }
  function showAnnotation(id:string,persistent=true,focus=false) {
    clearTimeout(hoverTimer);
    const item=career.find(c=>c.id===id),profile=id==='avatar';if(!profile&&!item)return;
    panel.querySelector('[data-callout-eyebrow]')!.textContent=profile?'THE ENGINEER':'A STOP ALONG THE WAY';
    panel.querySelector('[data-callout-name]')!.textContent=profile?'Devarshi Aggarwal':item!.name;
    panel.querySelector('[data-callout-role]')!.textContent=profile?'Robotics & Physical AI · Samsung Electro-Mechanics':`${item!.role} · ${item!.dates}`;
    panel.querySelector('[data-callout-copy]')!.textContent=profile?'I build robot-learning systems and computer vision that moves from an idea to something useful. Based in Bengaluru, India.':item!.details;
    const link=panel.querySelector<HTMLAnchorElement>('[data-callout-link]')!;link.href=profile?'/about/':item!.link;link.textContent=profile?'About me ↗':'Explore related work ↗';
    panel.querySelector<HTMLElement>('[data-callout-cv]')!.hidden=!profile;
    returnFocus=focus?document.activeElement as HTMLElement:canvas;annotation={id,persistent};panel.hidden=false;leader.dataset.active='true';
    avatarMarker.setAttribute('aria-expanded',String(profile));clearKeys();positionAnnotation();
    if(window.innerWidth<760&&persistent)panel.scrollIntoView({block:'nearest',behavior:motion.matches?'instant':'smooth'});
    if(focus)close.focus({preventScroll:true});queue();
  }
  function theme(){
    const name:ThemeName=document.documentElement.dataset.theme==='dark'?'dark':'light',colors=sceneThemes[name];
    kit.setTheme(name);sun.color.set(colors.key);fill.color.set(colors.ambient);fill.groundColor.set(colors.rock);
    sun.intensity=name==='dark'?2.3:3.2;fill.intensity=name==='dark'?2.6:2.4;renderer.toneMappingExposure=colors.exposure;queue();
  }
  function resize(){
    const width=stage.clientWidth,height=stage.clientHeight,aspect=width/Math.max(1,height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,window.innerWidth<760?1.4:1.8));renderer.shadowMap.enabled=window.innerWidth>=760;
    const halfHeight=Math.max(viewSize.y/2,viewSize.x/(2*aspect))*1.08,halfWidth=halfHeight*aspect;
    camera.left=viewCenter.x-halfWidth;camera.right=viewCenter.x+halfWidth;
    camera.top=viewCenter.y+halfHeight;camera.bottom=viewCenter.y-halfHeight;camera.updateProjectionMatrix();
    renderer.setSize(width,height,false);labelsDirty=true;positionAnnotation();queue();
  }
  function navigate(id:string){
    const destination=destinations.find(d=>d.id===id);if(!destination||navigating)return;
    navigating=true;save();clearKeys();status.textContent=`Opening ${destination.label}…`;window.location.assign(destination.href);
  }
  function projectMarkers(){
    stage.querySelectorAll<HTMLElement>('[data-landmark]').forEach(marker=>{
      const d=destinations.find(d=>d.id===marker.dataset.landmark),stop=careerStops.find(s=>s.id===marker.dataset.landmark);
      const p=d?{x:d.position.x,z:d.position.z+d.depth/2+.29,y:1.14}:stop?{...stop.position,y:2.9}:null;
      if(!p)return;const v=project(p);marker.style.left=`${v.x}px`;marker.style.top=`${v.y}px`;marker.hidden=!v.visible;
    });
  }
  function frame(now:number){
    raf=null;if(disposed||lost)return;
    const dt=Math.min(.04,lastTime?(now-lastTime)/1000:.016);lastTime=now;elapsed+=dt;
    const key=[...keys].at(-1),horizontal=key==='d'||key==='arrowright'?1:key==='a'||key==='arrowleft'?-1:0;
    const vertical=key==='s'||key==='arrowdown'?1:key==='w'||key==='arrowup'?-1:0;
    const input=isometricInput(horizontal,vertical),previous=point;
    point=moveOnGround(point,{x:input.x*3.6*dt,z:input.z*3.6*dt});
    const moving=Math.hypot(point.x-previous.x,point.z-previous.z)>.00001;
    if(moving){angle=Math.atan2(point.x-previous.x,point.z-previous.z);if(annotation)closeAnnotation();}
    avatar.root.position.set(point.x,.28,point.z);avatar.root.rotation.y=angle;avatar.update(elapsed,moving,!paused&&!motion.matches);
    stage.dataset.avatarX=point.x.toFixed(2);stage.dataset.avatarZ=point.z.toFixed(2);
    const destination=enteredDoor(previous,point);if(destination){point=previous;navigate(destination);}
    environment.animated.forEach((drone,i)=>{drone.position.y=drone.userData.baseY+(!paused&&!motion.matches?Math.sin(elapsed*.8+i)*.18:0);});
    if(labelsDirty){projectMarkers();labelsDirty=false;}
    const v=project({...point,y:1.4});avatarMarker.style.left=`${v.x}px`;avatarMarker.style.top=`${v.y}px`;
    if(annotation)positionAnnotation();renderer.render(scene,camera);stage.dataset.frames=String(++totalFrames);
    frameCount++;if(now-fpsStarted>=1000){stage.dataset.fps=String(Math.round(frameCount*1000/(now-fpsStarted)));fpsStarted=now;frameCount=0;}
    stage.dataset.triangles=String(renderer.info.render.triangles);stage.dataset.drawCalls=String(renderer.info.render.calls);
    if(keys.size||(!paused&&!motion.matches))queue();
  }
  // Immediately available from page load. Focused navigation/form controls retain
  // their native keys; wheel and touch scrolling never pass through this handler.
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'){clearKeys();closeAnnotation(true);canvas.blur();return;}
    const key=event.key.toLowerCase(),active=document.activeElement;
    const stageRect=stage.getBoundingClientRect(),inView=visible&&stageRect.top<window.innerHeight*.5&&stageRect.bottom>window.innerHeight*.35;
    if(!MOVEMENT_KEYS.has(key)||!inView||annotation||event.altKey||event.ctrlKey||event.metaKey)return;
    if(active&&active!==document.body&&active!==canvas&&!active.hasAttribute('data-direction'))return;
    event.preventDefault();keys.add(key);queue();
  },{signal});
  document.addEventListener('keyup',event=>{keys.delete(event.key.toLowerCase());queue();},{signal});
  document.addEventListener('focusin',event=>{if(event.target!==canvas)clearKeys();},{signal});
  window.addEventListener('blur',clearKeys,{signal});
  function pick(event:PointerEvent){
    const rect=canvas.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
    raycaster.setFromCamera(pointer,camera);return raycaster.intersectObjects(environment.pickables,false)[0];
  }
  canvas.addEventListener('pointerdown',event=>{pointerDown={x:event.clientX,z:event.clientY};},{signal});
  canvas.addEventListener('pointerup',event=>{
    if(!pointerDown||Math.hypot(pointerDown.x-event.clientX,pointerDown.z-event.clientY)>8)return;
    const hit=pick(event);if(hit){const {kind,id}=hit.object.userData;if(kind==='page')navigate(id);else showAnnotation(id,true);}
    else closeAnnotation();pointerDown=undefined;
  },{signal});
  canvas.addEventListener('pointermove',event=>{canvas.style.cursor=pick(event)?'pointer':'default';},{signal});
  stage.querySelectorAll<HTMLButtonElement>('[data-career-stop]').forEach(button=>button.addEventListener('click',()=>showAnnotation(button.dataset.careerStop!,true,eventIsKeyboard()),{signal}));
  function eventIsKeyboard(){return document.activeElement?.matches(':focus-visible')??false;}
  avatarMarker.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'&&!annotation?.persistent)showAnnotation('avatar',false);},{signal});
  function scheduleClose(){if(annotation&&!annotation.persistent)hoverTimer=setTimeout(()=>closeAnnotation(),250);}
  avatarMarker.addEventListener('pointerleave',scheduleClose,{signal});
  avatarMarker.addEventListener('click',()=>showAnnotation('avatar',true,eventIsKeyboard()),{signal});
  panel.addEventListener('pointerenter',()=>clearTimeout(hoverTimer),{signal});panel.addEventListener('pointerleave',scheduleClose,{signal});
  close.addEventListener('click',()=>closeAnnotation(true),{signal});
  pause.addEventListener('click',()=>{paused=!paused;pause.setAttribute('aria-pressed',String(paused));pause.textContent=paused?'Resume motion':'Pause motion';queue();},{signal});
  reset.addEventListener('click',()=>{point={...arrival};clearKeys();closeAnnotation();save();canvas.focus({preventScroll:true});queue();},{signal});
  document.querySelectorAll<HTMLButtonElement>('[data-direction]').forEach(button=>{
    const key=button.dataset.direction!;
    button.addEventListener('pointerdown',event=>{event.preventDefault();closeAnnotation();button.setPointerCapture(event.pointerId);keys.add(key);queue();},{signal});
    for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,()=>{keys.delete(key);queue();},{signal});
    button.addEventListener('keydown',event=>{if(event.key===' '||event.key==='Enter'){event.preventDefault();keys.add(key);queue();}},{signal});
    button.addEventListener('keyup',event=>{if(event.key===' '||event.key==='Enter'){keys.delete(key);queue();}},{signal});
  });
  document.addEventListener('portfolio:theme',theme,{signal});
  document.addEventListener('visibilitychange',()=>{clearKeys();lastTime=0;if(document.hidden&&raf!==null){cancelAnimationFrame(raf);raf=null;}else queue();},{signal});
  motion.addEventListener('change',()=>{paused=motion.matches;pause.setAttribute('aria-pressed',String(paused));pause.textContent=paused?'Resume motion':'Pause motion';queue();},{signal});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;clearKeys();closeAnnotation();stage.dataset.worldState='fallback';status.textContent='The 3D view paused. All destinations remain in the directory.';},{signal});
  canvas.addEventListener('webglcontextrestored',()=>{lost=false;stage.dataset.worldState='ready';queue();},{signal});
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(stage);
  const visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible&&raf!==null){cancelAnimationFrame(raf);raf=null;clearKeys();}else{lastTime=0;queue();}},{rootMargin:'50px'});visibility.observe(stage);
  theme();resize();stage.dataset.worldState='ready';pause.setAttribute('aria-pressed',String(paused));pause.textContent=paused?'Resume motion':'Pause motion';
  stage.dataset.loadMs=String(Math.round(performance.now()-loadingStarted));status.textContent='Arrow keys move in four isometric directions. Enter a doorway or select a building. Scroll for more.';
  window.addEventListener('pageshow',()=>{navigating=false;queue();},{signal});
  function dispose(){
    if(disposed)return;disposed=true;save();clearTimeout(hoverTimer);listeners.abort();if(raf!==null)cancelAnimationFrame(raf);
    resizeObserver.disconnect();visibility.disconnect();kit.dispose();
    scene.traverse(object=>{if(object instanceof THREE.Mesh){if(![...kit.geometries.values()].includes(object.geometry))object.geometry.dispose();
      const materials=Array.isArray(object.material)?object.material:[object.material];materials.filter(m=>![...kit.materials.values()].includes(m as THREE.MeshStandardMaterial)).forEach(m=>m.dispose());}
      if(object instanceof THREE.LineSegments){object.geometry.dispose();(object.material as THREE.Material).dispose();}});
    renderer.dispose();
  }
  window.addEventListener('pagehide',event=>{save();clearKeys();if(!event.persisted)dispose();},{signal});
  return dispose;
}
