import test from 'node:test';
import assert from 'node:assert/strict';
import { Quaternion,Vector3 } from 'three';
import { forwardKinematics,jacobian,rotationError,ikStep,poseFromJoints,home,armJoints,poseError } from '../src/robot/kinematics';

test('SO-101 geometric Jacobian agrees with finite differences for all five joints',()=>{
  const q=[.3,-.2,.4,-.5,.6],fk=forwardKinematics(q),J=jacobian(q,1),eps=1e-6;
  for(let j=0;j<5;j++){
    const qp=[...q];qp[j]+=eps;const next=forwardKinematics(qp);
    const v=[...next.position.clone().sub(fk.position).divideScalar(eps).toArray(),...rotationError(next.quaternion,fk.quaternion).divideScalar(eps).toArray()];
    for(let r=0;r<6;r++)assert.ok(Math.abs(v[r]-J[r][j])<2e-6,`J[${r},${j}] differs`);
  }
});
test('pose IK converges on realizable SO-101 target poses',()=>{
  for(const desired of [[.4,-.1,.25,-.4,.5],[-.45,-.5,.8,-.6,-.6],[.1,.2,-.3,.4,.2]]){
    const target=poseFromJoints(desired);let q=[...home];
    for(let i=0;i<700;i++)q=ikStep(q,target).q;
    const error=poseError(q,target);assert.ok(error.positionNorm<.001);assert.ok(error.rotationNorm<.035);
  }
});
test('unreachable pose keeps finite bounded joints and honest residuals',()=>{
  const target={position:new Vector3(.9,.9,.9),quaternion:new Quaternion()};let q=[...home];
  for(let i=0;i<400;i++)q=ikStep(q,target).q;
  q.forEach((angle,i)=>assert.ok(Number.isFinite(angle)&&angle>=armJoints[i].lower&&angle<=armJoints[i].upper));
  assert.ok(poseError(q,target).positionNorm>.5);
});
test('quaternion sign does not change orientation error and position-only mode works',()=>{
  const q=new Quaternion().setFromAxisAngle(new Vector3(0,0,1),Math.PI-.001),negative=q.clone();negative.set(-q.x,-q.y,-q.z,-q.w);
  assert.ok(rotationError(q,new Quaternion()).distanceTo(rotationError(negative,new Quaternion()))<1e-8);
  const target=poseFromJoints([.4,-.1,.25,-.4,.5]);target.quaternion.setFromAxisAngle(new Vector3(1,0,0),2);
  let angles=[...home];for(let i=0;i<600;i++)angles=ikStep(angles,target,0).q;
  assert.ok(poseError(angles,target).positionNorm<.001);
});

test('all packed model meshes have valid positions and triangle indices',async()=>{
  const {readFile,readdir}=await import('node:fs/promises');
  for(const name of (await readdir('public/robots/so101')).filter(n=>n.endsWith('.mesh'))){
    const bytes=await readFile(`public/robots/so101/${name}`),n=bytes.readUInt32LE(4),count=bytes.readUInt32LE(8);
    assert.equal(bytes.readUInt32LE(0),0x534f3130);assert.equal(bytes.length,12+n*12+count*4);assert.equal(count%3,0);
    for(let i=0;i<n*3;i++)assert.ok(Number.isFinite(bytes.readFloatLE(12+i*4)));
    for(let i=0;i<count;i++)assert.ok(bytes.readUInt32LE(12+n*12+i*4)<n);
  }
});
