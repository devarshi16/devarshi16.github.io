import * as THREE from 'three';
import { destinations, careerStops, arrival, type Point } from '../data/world';
import { career } from '../data/career';
import { createEnvironment } from './environment';
import { createAvatar } from './avatar';
import { SceneKit } from './geometry';
import { sceneThemes, type ThemeName } from './theme';
import { isometricInput, moveOnGround, enteredDoor, isOnGround, isInsideBuilding } from './movement';
import { drawingOutline, overlapsDrawing, nearbyIndicator, type DrawingPoint } from './callouts';
import { dragInput, DRAG_DEAD_ZONE } from './drag';

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
  const dragControl=stage.querySelector<SVGSVGElement>('[data-drag-control]')!;
  const dragLine=dragControl.querySelector<SVGPathElement>('[data-drag-line]')!;
  const dragThumb=dragControl.querySelector<SVGCircleElement>('[data-drag-thumb]')!;
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const listeners=new AbortController(), signal=listeners.signal;
  let renderer:THREE.WebGLRenderer;
  try { renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'}); }
  catch {stage.dataset.worldState='fallback';status.textContent='Explore the campus using the directory below.';pause.disabled=true;return()=>listeners.abort();}
  renderer.shadowMap.type=THREE.PCFShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;
  const scene=new THREE.Scene(), camera=new THREE.OrthographicCamera(-20,20,15,-15,.1,160);
  camera.position.set(34,34,34);camera.lookAt(0,-1.5,-1);
  const kit=new SceneKit();kit.anisotropy=renderer.capabilities.getMaxAnisotropy();
  const environment=createEnvironment(kit), avatar=createAvatar(kit);
  scene.add(environment.root,avatar.root);
  const sun=new THREE.DirectionalLight('#fff6e8',3.2);sun.position.set(-12,28,12);sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-24,right:24,top:24,bottom:-24});
  sun.shadow.normalBias=.06;sun.shadow.bias=-.0003;scene.add(sun);
  const fill=new THREE.HemisphereLight('#e8f2f1','#98a495',2.4);scene.add(fill);
  let point:Point={...arrival}, angle=0, visible=true, lost=false, disposed=false, navigating=false;
  let paused=motion.matches, raf:number|null=null, lastTime=0, elapsed=0;
  let gesture:{id:number;x:number;y:number;moved:boolean}|null=null, dragDirection:Point={x:0,z:0}, suppressMapClick=false;
  let labelsDirty=true, fpsStarted=0, frameCount=0, totalFrames=0;
  let annotation:{id:string;persistent:boolean}|null=null, returnFocus:HTMLElement|null=null;
  let annotationLayout:{key:string;side:'left'|'right'|null;left:number;top:number}|null=null;
  let nearIndicator:string|null=null, dismissedIndicator:string|null=null, hoveredIndicator:string|null=null, panelHovered=false;
  let hoverTimer:ReturnType<typeof setTimeout>|undefined;
  const keys=new Set<string>(), raycaster=new THREE.Raycaster(), pointer=new THREE.Vector2();
  try {
    const saved=JSON.parse(sessionStorage.getItem(STORAGE_KEY)??'null');
    if(saved&&Number.isFinite(saved.x)&&Number.isFinite(saved.z)&&isOnGround(saved)&&!isInsideBuilding(saved))point={x:saved.x,z:saved.z};
  } catch {}
  // Measure actual projected vertices once, so portrait screens fit the complete
  // campus rather than clipping its outer islands or long rock bases.
  camera.updateMatrixWorld();environment.root.updateMatrixWorld(true);
  const viewBounds=new THREE.Box3(), vertex=new THREE.Vector3(),projectedVertices:DrawingPoint[]=[];
  environment.root.traverse(object=>{
    if(!(object instanceof THREE.Mesh))return;
    const positions=object.geometry.getAttribute('position');
    for(let i=0;i<positions.count;i++){
      vertex.fromBufferAttribute(positions,i).applyMatrix4(object.matrixWorld).applyMatrix4(camera.matrixWorldInverse);
      viewBounds.expandByPoint(vertex);projectedVertices.push({x:vertex.x,y:vertex.y});
    }
  });
  const viewSize=viewBounds.getSize(new THREE.Vector3()),viewCenter=viewBounds.getCenter(new THREE.Vector3());
  const campusOutline=drawingOutline(projectedVertices);
  projectedVertices.length=0;
  function save(){try{sessionStorage.setItem(STORAGE_KEY,JSON.stringify(point));}catch{}}
  function queue(){if(raf===null&&visible&&!document.hidden&&!lost&&!disposed)raf=requestAnimationFrame(frame);}
  function finishDrag(){
    const ended=gesture;gesture=null;dragDirection={x:0,z:0};dragControl.dataset.active='false';stage.dataset.dragging='false';
    if(ended&&stage.hasPointerCapture(ended.id))stage.releasePointerCapture(ended.id);
    queue();
  }
  function clearKeys(){keys.clear();finishDrag();}
  function project(p:{x:number;y:number;z:number}) {
    const v=new THREE.Vector3(p.x,p.y,p.z).project(camera);
    return {x:(v.x*.5+.5)*stage.clientWidth,y:(-v.y*.5+.5)*stage.clientHeight,visible:Math.abs(v.x)<1.03&&Math.abs(v.y)<1.03};
  }
  function closeAnnotation(restore=false) {
    clearTimeout(hoverTimer);annotation=null;panel.hidden=true;leader.dataset.active='false';hero.style.setProperty('--annotation-height','0px');
    avatarMarker.setAttribute('aria-expanded','false');
    if(restore)returnFocus?.focus({preventScroll:true});queue();
  }
  function dismissAnnotation(restore=false) {
    dismissedIndicator=nearIndicator;hoveredIndicator=null;panelHovered=false;closeAnnotation(restore);
  }
  function syncAnnotation() {
    if(annotation?.persistent)return;
    const id=hoveredIndicator??(panelHovered?annotation?.id:null)??(nearIndicator!==dismissedIndicator?nearIndicator:null);
    if(id){if(annotation?.id!==id)showAnnotation(id,false);}
    else if(annotation)closeAnnotation();
  }
  function updateProximity() {
    const next=nearbyIndicator(point,nearIndicator);
    if(next!==nearIndicator){
      nearIndicator=next;dismissedIndicator=null;
      stage.dataset.nearIndicator=next??'';
      stage.querySelectorAll<HTMLElement>('[data-landmark]').forEach(marker=>{marker.dataset.near=String(marker.dataset.landmark===next);});
    }
    syncAnnotation();
  }
  function positionAnnotation() {
    if(!annotation)return;
    const stop=careerStops.find(s=>s.id===annotation!.id),destination=destinations.find(d=>d.id===annotation!.id);
    const anchor=project(stop?{...stop.position,y:2.9}:destination?{x:destination.position.x,z:destination.position.z+destination.depth/2+.29,y:1.14}:{...point,y:1.65});
    const width=stage.clientWidth,height=stage.clientHeight,pw=panel.offsetWidth,ph=panel.offsetHeight;
    const layoutKey=`${annotation.id}:${width}:${height}:${pw}:${ph}`;
    if(annotationLayout?.key!==layoutKey){
      const outline=campusOutline.map(p=>({x:(p.x-camera.left)/(camera.right-camera.left)*width,y:(camera.top-p.y)/(camera.top-camera.bottom)*height}));
      let side:'left'|'right'|null=null,left=(width-pw)/2,top=height+24;
      // Look for clear space beside the actual silhouette, including its rock bases.
      // Narrow screens reserve space below; the scene never shrinks or jumps.
      if(window.innerWidth>=760&&ph<height-28){
        const sides:('left'|'right')[]=anchor.x<width/2?['left','right']:['right','left'];
        const preferred=Math.max(14,Math.min(height-ph-14,anchor.y-ph*.5+56));
        const rows=[preferred,height-ph-14,14];
        for(let y=14;y<=height-ph-14;y+=24)rows.push(y);
        for(const candidate of sides){
          const x=candidate==='left'?14:width-pw-14;
          const y=rows.find(y=>!overlapsDrawing({left:x,top:y,width:pw,height:ph},outline));
          if(y!==undefined){side=candidate;left=x;top=y;break;}
        }
      }
      annotationLayout={key:layoutKey,side,left,top};
    }
    const {side,left,top}=annotationLayout;
    hero.style.setProperty('--annotation-height',side?'0px':`${ph+32}px`);
    panel.dataset.placement=side??'below';
    panel.style.left=`${Math.max(14,left)}px`;panel.style.top=`${top}px`;
    leader.setAttribute('viewBox',`0 0 ${width} ${height}`);
    const attachLeft=side?side==='right':anchor.x<width/2;
    const startX=side?attachLeft?left:left+pw:attachLeft?left+24:left+pw-24;
    const startY=side?top+ph*.5:top;
    const elbowX=side?startX+(attachLeft?-48:48):Math.max(14,Math.min(width-14,startX+(attachLeft?-48:48)));
    // From the indicator: one diagonal leg, one bend, then a horizontal shelf.
    // The arrowhead points back at the object, as in an engineering drawing.
    leaderPath.setAttribute('d',`M ${startX} ${startY} L ${elbowX} ${startY} L ${anchor.x} ${anchor.y}`);
  }
  function showAnnotation(id:string,persistent=true,focus=false) {
    clearTimeout(hoverTimer);
    const item=career.find(c=>c.id===id),destination=destinations.find(d=>d.id===id),profile=id==='avatar';if(!profile&&!item&&!destination)return;
    panel.dataset.brief=String(!persistent&&!profile);
    panel.querySelector('[data-callout-eyebrow]')!.textContent=profile?'THE ENGINEER':destination?'CAMPUS DESTINATION':'A STOP ALONG THE WAY';
    panel.querySelector('[data-callout-name]')!.textContent=profile?'Devarshi Aggarwal':destination?.label??item!.name;
    panel.querySelector('[data-callout-role]')!.textContent=profile?'Robotics & Physical AI · Samsung Electro-Mechanics':destination?.caption??`${item!.role} · ${item!.dates}`;
    panel.querySelector('[data-callout-copy]')!.textContent=profile?'I build robot-learning systems and computer vision that moves from an idea to something useful. Based in Bengaluru, India.':destination?({robotics:'Robot learning, simulation and teleoperation workflows.',vision:'Production perception, recognition and tracking systems.',maker:'Electronics projects, controllers and things made by hand.',journal:'Technical walkthroughs and experiments from the workbench.',research:'Publications and questions across vision and robotics.',studio:'My background, experience and ways to get in touch.'}[destination.id]??destination.caption):persistent?item!.details:item!.description;
    const link=panel.querySelector<HTMLAnchorElement>('[data-callout-link]')!;link.href=profile?'/about/':destination?.href??item!.link;link.textContent=profile?'About me ↗':destination?'Enter this building ↗':'Explore related work ↗';
    panel.querySelector<HTMLElement>('[data-callout-cv]')!.hidden=!profile;
    returnFocus=focus?document.activeElement as HTMLElement:canvas;annotation={id,persistent};panel.hidden=false;leader.dataset.active='true';
    avatarMarker.setAttribute('aria-expanded',String(profile));if(persistent)clearKeys();positionAnnotation();
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
    const input=gesture?.moved?dragDirection:isometricInput(horizontal,vertical),previous=point;
    point=moveOnGround(point,{x:input.x*3.6*dt,z:input.z*3.6*dt});
    const moving=Math.hypot(point.x-previous.x,point.z-previous.z)>.00001;
    if(moving)angle=Math.atan2(point.x-previous.x,point.z-previous.z);
    updateProximity();
    avatar.root.position.set(point.x,.28,point.z);avatar.root.rotation.y=angle;avatar.update(elapsed,moving,!paused&&!motion.matches);
    stage.dataset.avatarX=point.x.toFixed(2);stage.dataset.avatarZ=point.z.toFixed(2);
    const destination=enteredDoor(previous,point);if(destination){point=previous;navigate(destination);}
    environment.animated.forEach((drone,i)=>{drone.position.y=drone.userData.baseY+(!paused&&!motion.matches?Math.sin(elapsed*.8+i)*.18:0);});
    if(labelsDirty){projectMarkers();labelsDirty=false;}
    const v=project({...point,y:1.4});avatarMarker.style.left=`${v.x}px`;avatarMarker.style.top=`${v.y}px`;
    if(annotation)positionAnnotation();renderer.render(scene,camera);stage.dataset.frames=String(++totalFrames);
    frameCount++;if(now-fpsStarted>=1000){stage.dataset.fps=String(Math.round(frameCount*1000/(now-fpsStarted)));fpsStarted=now;frameCount=0;}
    stage.dataset.triangles=String(renderer.info.render.triangles);stage.dataset.drawCalls=String(renderer.info.render.calls);
    if(keys.size||dragDirection.x||dragDirection.z||(!paused&&!motion.matches))queue();
  }
  // Immediately available from page load. Focused navigation/form controls retain
  // their native keys; scrolling outside the map never passes through this handler.
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'){clearKeys();dismissAnnotation(true);canvas.blur();return;}
    const key=event.key.toLowerCase(),active=document.activeElement;
    const stageRect=stage.getBoundingClientRect(),inView=visible&&stageRect.top<window.innerHeight*.5&&stageRect.bottom>window.innerHeight*.35;
    if(!MOVEMENT_KEYS.has(key)||!inView||annotation?.persistent||event.altKey||event.ctrlKey||event.metaKey)return;
    if(active&&active!==document.body&&active!==canvas&&!active.hasAttribute('data-direction'))return;
    event.preventDefault();keys.add(key);queue();
  },{signal});
  document.addEventListener('keyup',event=>{keys.delete(event.key.toLowerCase());queue();},{signal});
  document.addEventListener('focusin',event=>{if(event.target!==canvas&&!(gesture&&stage.contains(event.target as Node)))clearKeys();},{signal});
  window.addEventListener('blur',clearKeys,{signal});
  function pick(event:PointerEvent){
    const rect=canvas.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
    raycaster.setFromCamera(pointer,camera);return raycaster.intersectObjects(environment.pickables,false)[0];
  }
  stage.addEventListener('pointerdown',event=>{
    if(!event.isPrimary||event.button!==0||gesture||lost||navigating||stage.dataset.worldState!=='ready')return;
    if((event.target as Element).closest('[data-world-callout]'))return;
    keys.clear();suppressMapClick=false;gesture={id:event.pointerId,x:event.clientX,y:event.clientY,moved:false};
  },{signal,capture:true});
  stage.addEventListener('dragstart',event=>{
    if(!(event.target as Element).closest('[data-world-callout]'))event.preventDefault();
  },{signal});
  window.addEventListener('pointermove',event=>{
    if(!gesture||gesture.id!==event.pointerId)return;
    const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y,length=Math.hypot(dx,dy);
    if(!gesture.moved&&length>DRAG_DEAD_ZONE){
      gesture.moved=true;suppressMapClick=true;
      if(annotation?.persistent)closeAnnotation();
      canvas.focus({preventScroll:true});stage.setPointerCapture(event.pointerId);
      const rect=stage.getBoundingClientRect();dragControl.style.left=`${gesture.x-rect.left}px`;dragControl.style.top=`${gesture.y-rect.top}px`;
      dragControl.dataset.active='true';stage.dataset.dragging='true';
    }
    if(!gesture.moved)return;
    event.preventDefault();dragDirection=dragInput(dx,dy,dragDirection);
    const scale=length?Math.min(length,38)/length:0,x=52+dx*scale,y=52+dy*scale;
    dragLine.setAttribute('d',`M52 52L${x} ${y}`);dragThumb.setAttribute('cx',String(x));dragThumb.setAttribute('cy',String(y));queue();
  },{signal,passive:false});
  window.addEventListener('pointerup',event=>{
    if(!gesture||gesture.id!==event.pointerId)return;
    const tap=!gesture.moved&&Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y)<=DRAG_DEAD_ZONE;
    finishDrag();
    // Native marker taps keep their links/buttons. Only the canvas needs raycasting.
    if(!tap||event.target!==canvas)return;
    const hit=pick(event);if(hit){const {kind,id}=hit.object.userData;if(kind==='page')navigate(id);else showAnnotation(id,true);}
    else dismissAnnotation();
  },{signal});
  for(const type of ['pointercancel','lostpointercapture'])window.addEventListener(type,event=>{
    // Touch starts with implicit capture on its original target. Transferring
    // capture from a marker to the map must not cancel the active drag.
    if(type==='lostpointercapture'&&event.target!==stage)return;
    if(gesture?.id===(event as PointerEvent).pointerId)finishDrag();
  },{signal});
  stage.addEventListener('click',event=>{
    if(suppressMapClick&&event.detail>0){event.preventDefault();event.stopImmediatePropagation();suppressMapClick=false;}
  },{signal,capture:true});
  canvas.addEventListener('pointermove',event=>{if(!gesture?.moved&&event.pointerType==='mouse')canvas.style.cursor=pick(event)?'pointer':'default';},{signal});
  stage.querySelectorAll<HTMLButtonElement>('[data-career-stop]').forEach(button=>button.addEventListener('click',()=>showAnnotation(button.dataset.careerStop!,true,eventIsKeyboard()),{signal}));
  function eventIsKeyboard(){return document.activeElement?.matches(':focus-visible')??false;}
  function hoverIndicator(id:string){if(annotation?.persistent)return;clearTimeout(hoverTimer);hoveredIndicator=id;syncAnnotation();}
  avatarMarker.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')hoverIndicator('avatar');},{signal});
  function scheduleClose(){clearTimeout(hoverTimer);hoverTimer=setTimeout(()=>{hoveredIndicator=null;syncAnnotation();},250);}
  stage.querySelectorAll<HTMLElement>('[data-landmark]').forEach(marker=>{
    marker.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')hoverIndicator(marker.dataset.landmark!);},{signal});
    marker.addEventListener('pointerleave',scheduleClose,{signal});
    marker.addEventListener('focus',()=>{if(marker.matches(':focus-visible'))hoverIndicator(marker.dataset.landmark!);},{signal});
    marker.addEventListener('blur',scheduleClose,{signal});
  });
  avatarMarker.addEventListener('pointerleave',scheduleClose,{signal});
  avatarMarker.addEventListener('click',()=>showAnnotation('avatar',true,eventIsKeyboard()),{signal});
  panel.addEventListener('pointerenter',()=>{clearTimeout(hoverTimer);panelHovered=true;},{signal});
  panel.addEventListener('pointerleave',()=>{panelHovered=false;scheduleClose();},{signal});
  close.addEventListener('click',()=>dismissAnnotation(true),{signal});
  pause.addEventListener('click',()=>{paused=!paused;pause.setAttribute('aria-pressed',String(paused));pause.textContent=paused?'Resume motion':'Pause motion';queue();},{signal});
  reset.addEventListener('click',()=>{point={...arrival};nearIndicator=null;dismissedIndicator=null;hoveredIndicator=null;panelHovered=false;clearKeys();closeAnnotation();save();canvas.focus({preventScroll:true});queue();},{signal});
  document.querySelectorAll<HTMLButtonElement>('[data-direction]').forEach(button=>{
    const key=button.dataset.direction!;
    button.addEventListener('pointerdown',event=>{event.preventDefault();if(annotation?.persistent)closeAnnotation();button.setPointerCapture(event.pointerId);keys.add(key);queue();},{signal});
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
  stage.dataset.loadMs=String(Math.round(performance.now()-loadingStarted));status.textContent='Drag inside the map or use arrow keys to move in four isometric directions. Tap a building or enter its doorway. Scroll outside the map for more.';
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
