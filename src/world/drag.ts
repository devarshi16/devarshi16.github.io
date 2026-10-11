import type { Point } from '../data/world';

export const DRAG_DEAD_ZONE=12;
const directions=[
  {screen:{x:-Math.sqrt(3)/2,y:-.5},world:{x:-1,z:0}},
  {screen:{x:Math.sqrt(3)/2,y:-.5},world:{x:0,z:-1}},
  {screen:{x:-Math.sqrt(3)/2,y:.5},world:{x:0,z:1}},
  {screen:{x:Math.sqrt(3)/2,y:.5},world:{x:1,z:0}},
];

/** Snap a screen-space drag to a ground axis, with a quiet center and stable seams. */
export function dragInput(dx:number,dy:number,previous:Point={x:0,z:0}):Point {
  const length=Math.hypot(dx,dy);
  if(length<=DRAG_DEAD_ZONE)return {x:0,z:0};
  const scored=directions.map(direction=>({...direction,score:(dx*direction.screen.x+dy*direction.screen.y)/length}));
  const best=scored.reduce((best,next)=>next.score>best.score?next:best);
  const held=scored.find(direction=>direction.world.x===previous.x&&direction.world.z===previous.z);
  // A small angular margin avoids swapping direction when a thumb rests on a seam.
  return {...(held&&best.score-held.score<.12?held:best).world};
}
