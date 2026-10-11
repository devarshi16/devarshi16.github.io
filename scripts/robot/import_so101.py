"""Import a pinned official URDF; cluster render meshes at 1 mm, never FK geometry."""
from pathlib import Path
import argparse, json, struct, shutil, xml.etree.ElementTree as ET
import numpy as np
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source',default='/tmp/portfolio-so101-source',help='Directory with the pinned URDF and assets/ STLs')
SOURCE=Path(parser.parse_args().source)
DEST=Path('public/robots/so101')
root=ET.fromstring((SOURCE/'so101_new_calib.urdf').read_bytes())
revision=(SOURCE/'revision.txt').read_text().split()[0] if (SOURCE/'revision.txt').exists() else 'a758567c3978dfeefe282ede0500085a48fe8f78'
def origin(node):
 o=node.find('origin')
 return {'xyz':[float(x) for x in (o.get('xyz','0 0 0') if o is not None else '0 0 0').split()], 'rpy':[float(x) for x in (o.get('rpy','0 0 0') if o is not None else '0 0 0').split()]}
links=[]
for link in root.findall('link'):
 visuals=[]
 for v in link.findall('visual'):
  mesh=v.find('geometry/mesh')
  visuals.append({**origin(v),'mesh':Path(mesh.get('filename')).stem,'scale':[float(x) for x in mesh.get('scale','1 1 1').split()], 'material':v.find('material').get('name')})
 links.append({'name':link.get('name'),'visuals':visuals})
joints=[]
for j in root.findall('joint'):
 limit=j.find('limit');axis=j.find('axis')
 joints.append({**origin(j),'name':j.get('name'),'type':j.get('type'),'parent':j.find('parent').get('link'),'child':j.find('child').get('link'),'axis':[float(x) for x in axis.get('xyz','0 0 1').split()], 'lower':float(limit.get('lower')) if limit is not None else 0,'upper':float(limit.get('upper')) if limit is not None else 0})
data={'revision':revision,'root':'base_link','ee':'gripper_frame_link','links':links,'joints':joints}
Path('src/robot/so101-model.json').write_text(json.dumps(data,indent=2)+'\n')
DEST.mkdir(parents=True,exist_ok=True)
for filename in sorted({v['mesh'] for l in links for v in l['visuals']}):
 raw=(SOURCE/'assets'/f'{filename}.stl').read_bytes();count=struct.unpack_from('<I',raw,80)[0]
 if len(raw)!=84+50*count:raise ValueError('Expected binary STL')
 dtype=np.dtype([('normal','<f4',(3,)),('vertices','<f4',(3,3)),('attribute','<u2')])
 verts=np.frombuffer(raw,dtype=dtype,count=count,offset=84)['vertices'].reshape(-1,3).astype(float)
 cells=np.round(verts/.001).astype(np.int64)
 _,inverse=np.unique(cells,axis=0,return_inverse=True)
 n=inverse.max()+1;pos=np.zeros((n,3));np.add.at(pos,inverse,verts);pos/=np.bincount(inverse)[:,None]
 tris=inverse.reshape(-1,3);tris=tris[(tris[:,0]!=tris[:,1])&(tris[:,0]!=tris[:,2])&(tris[:,1]!=tris[:,2])]
 _,unique=np.unique(np.sort(tris,axis=1),axis=0,return_index=True);tris=tris[np.sort(unique)]
 used,remap=np.unique(tris,return_inverse=True);pos=pos[used];indices=remap.reshape(-1).astype('<u4')
 packed=struct.pack('<III',0x534f3130,len(pos),len(indices))+pos.astype('<f4').tobytes()+indices.tobytes()
 (DEST/f'{filename}.mesh').write_bytes(packed)
 print(filename,'triangles',count,'->',len(tris),'bytes',len(packed))
if (SOURCE/'LICENSE').exists():shutil.copyfile(SOURCE/'LICENSE',DEST/'LICENSE')
if not (DEST/'LICENSE').exists():raise ValueError('Retain the upstream Apache-2.0 license')
# Normalize upstream trailing whitespace, preserving every model value.
(DEST/'so101_new_calib.urdf').write_text('\n'.join(line.rstrip() for line in (SOURCE/'so101_new_calib.urdf').read_text().splitlines())+'\n')
(DEST/'SOURCES.md').write_text(f'''SO-101 model from TheRobotStudio/SO-ARM100, revision `{revision}`.
Source: https://github.com/TheRobotStudio/SO-ARM100/tree/{revision}/Simulation/SO101
Apache-2.0 license retained in LICENSE. Original URDF retained with trailing whitespace normalized.
Visual STL meshes clustered at 1 mm for a faceted browser rendering; kinematic transforms,
axes, tool frame and limits remain the original URDF values. Printed parts are recolored
to the portfolio's sage/stone palette. Binary .mesh: little-endian uint32 magic 0x534f3130,
vertex count, index count, followed by float32 XYZ positions and uint32 triangle indices.
Reproduce with scripts/robot/import_so101.py with --source pointing to the pinned SO101 directory and its assets/. This demo implements kinematic IK, without physics or collision.
''')
