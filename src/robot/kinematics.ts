import { Euler, Matrix4, Quaternion, Vector3 } from 'three';
import model from './so101-model.json';

export const armJointNames=['shoulder_pan','shoulder_lift','elbow_flex','wrist_flex','wrist_roll'];
export const armJoints=armJointNames.map(name=>model.joints.find(j=>j.name===name)!);
export const home=[0,-.35,.6,-.25,0];
export type Pose={position:Vector3;quaternion:Quaternion};
export function originMatrix(xyz:number[],rpy:number[]) {
  return new Matrix4().compose(new Vector3().fromArray(xyz),new Quaternion().setFromEuler(new Euler(rpy[0],rpy[1],rpy[2],'ZYX')),new Vector3(1,1,1));
}
export function forwardKinematics(q:number[],jaw=.45) {
  if(q.length!==5||q.some(n=>!Number.isFinite(n)))throw new Error('SO-101 expects five finite arm angles');
  const links=new Map<string,Matrix4>([[model.root,new Matrix4()]]);
  const before=new Map<string,Matrix4>();
  function linkFrame(name:string):Matrix4 {
    if(links.has(name))return links.get(name)!;
    const joint=model.joints.find(j=>j.child===name);if(!joint)throw new Error(`Unknown link: ${name}`);
    const base=linkFrame(joint.parent).clone().multiply(originMatrix(joint.xyz,joint.rpy));before.set(joint.name,base.clone());
    if(joint.type==='revolute'){
      const index=armJointNames.indexOf(joint.name),angle=index<0?jaw:q[index];
      base.multiply(new Matrix4().makeRotationAxis(new Vector3().fromArray(joint.axis),angle));
    }
    links.set(name,base);return base;
  }
  model.links.forEach(link=>linkFrame(link.name));
  const matrix=links.get(model.ee)!,position=new Vector3().setFromMatrixPosition(matrix),quaternion=new Quaternion().setFromRotationMatrix(matrix);
  const axes=armJoints.map(j=>new Vector3().fromArray(j.axis).transformDirection(before.get(j.name)!));
  const origins=armJoints.map(j=>new Vector3().setFromMatrixPosition(before.get(j.name)!));
  return {links,position,quaternion,axes,origins};
}
export function rotationError(target:Quaternion,current:Quaternion) {
  const delta=target.clone().multiply(current.clone().invert()).normalize();
  if(delta.w<0)delta.set(-delta.x,-delta.y,-delta.z,-delta.w);
  const s=Math.hypot(delta.x,delta.y,delta.z);
  return s<1e-10?new Vector3():new Vector3(delta.x,delta.y,delta.z).multiplyScalar(2*Math.atan2(s,delta.w)/s);
}
export function poseError(q:number[],target:Pose) {
  const fk=forwardKinematics(q),position=target.position.clone().sub(fk.position),rotation=rotationError(target.quaternion,fk.quaternion);
  return {position,rotation,positionNorm:position.length(),rotationNorm:rotation.length(),fk};
}
export function jacobian(q:number[],rotationWeight=.075) {
  const fk=forwardKinematics(q);
  const columns=fk.axes.map((axis,i)=>{const p=axis.clone().cross(fk.position.clone().sub(fk.origins[i]));return [...p.toArray(),...axis.clone().multiplyScalar(rotationWeight).toArray()];});
  return Array.from({length:6},(_,r)=>columns.map(column=>column[r]));
}
function solveLinear(matrix:number[][],rhs:number[]) {
  const n=rhs.length,a=matrix.map((row,i)=>[...row,rhs[i]]);
  for(let col=0;col<n;col++){
    let pivot=col;for(let i=col+1;i<n;i++)if(Math.abs(a[i][col])>Math.abs(a[pivot][col]))pivot=i;
    [a[col],a[pivot]]=[a[pivot],a[col]];const divisor=a[col][col];
    if(Math.abs(divisor)<1e-14)return Array(n).fill(0);
    for(let j=col;j<=n;j++)a[col][j]/=divisor;
    for(let i=0;i<n;i++)if(i!==col){const factor=a[i][col];for(let j=col;j<=n;j++)a[i][j]-=factor*a[col][j];}
  }
  return a.map(row=>row[n]);
}
export function ikStep(q:number[],target:Pose,rotationWeight=.075,damping=.012) {
  if(!Number.isFinite(damping)||damping<=0||!Number.isFinite(rotationWeight)||rotationWeight<0)throw new Error('Invalid solver weights');
  const error=poseError(q,target),e=[...error.position.toArray(),...error.rotation.clone().multiplyScalar(rotationWeight).toArray()],J=jacobian(q,rotationWeight);
  const A=Array.from({length:5},(_,i)=>Array.from({length:5},(_,j)=>J.reduce((sum,row)=>sum+row[i]*row[j],0)+(i===j?damping*damping:0)));
  const b=Array.from({length:5},(_,i)=>J.reduce((sum,row,r)=>sum+row[i]*e[r],0)),step=solveLinear(A,b);
  const norm=Math.hypot(...step),scale=Math.min(.8,.12/(norm||1));
  const cost=(angles:number[])=>{const err=poseError(angles,target);return err.positionNorm**2+(rotationWeight*err.rotationNorm)**2;};
  const currentCost=cost(q);let next=[...q];
  // Backtracking makes a finite joint-limited step descend the actual pose error.
  for(let alpha=scale;alpha>=scale/16;alpha/=2){
    const candidate=q.map((angle,i)=>Math.max(armJoints[i].lower,Math.min(armJoints[i].upper,angle+alpha*step[i])));
    if(cost(candidate)<currentCost){next=candidate;break;}
  }
  return {q:next,improvement:currentCost-cost(next),error:poseError(next,target)};
}
export function poseFromJoints(q:number[]):Pose {const fk=forwardKinematics(q);return {position:fk.position.clone(),quaternion:fk.quaternion.clone()};}
