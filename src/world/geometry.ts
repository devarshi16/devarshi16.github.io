import * as THREE from 'three';
import { sceneThemes, type MaterialRole, type ThemeName } from './theme';

export class SceneKit {
  disposed = false;
  materials = new Map<string, THREE.MeshStandardMaterial>();
  geometries = new Map<string, THREE.BufferGeometry>();
  trackedTextures = new Set<THREE.Texture>();
  theme: ThemeName = 'light';

  material(role: MaterialRole | string, color?: string): THREE.MeshStandardMaterial {
    const key = color ? `${role}:${color}` : role;
    let material = this.materials.get(key);
    if (!material) {
      material = new THREE.MeshStandardMaterial({
        color: color ?? sceneThemes[this.theme][role as MaterialRole], roughness: role === 'glass' ? .24 : .78,
        metalness: role === 'metal' ? .25 : .02, flatShading: true,
        ...(role === 'glass' ? { transparent: true, opacity: .3, depthWrite: false, side: THREE.DoubleSide } : {}),
        ...(role === 'window' ? { emissive: sceneThemes[this.theme].windowEmission, emissiveIntensity: .12 } : {}),
      });
      this.materials.set(key, material);
    }
    return material;
  }

  geometry(key: string, build: () => THREE.BufferGeometry): THREE.BufferGeometry {
    if (!this.geometries.has(key)) this.geometries.set(key, build());
    return this.geometries.get(key)!;
  }

  mesh(parent: THREE.Object3D, geometry: THREE.BufferGeometry, role: MaterialRole | string, position: [number, number, number], color?: string) {
    const mesh = new THREE.Mesh(geometry, this.material(role, color));
    mesh.position.set(...position); mesh.castShadow = role !== 'glass'; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }

  box(parent: THREE.Object3D, size: [number, number, number], position: [number, number, number], role: MaterialRole | string = 'wall', color?: string) {
    return this.mesh(parent, this.geometry(`box:${size.join(',')}`, () => new THREE.BoxGeometry(...size)), role, position, color);
  }

  cylinder(parent: THREE.Object3D, radius: number, height: number, position: [number, number, number], role: MaterialRole | string = 'metal', color?: string, sides = 12) {
    return this.mesh(parent, this.geometry(`cyl:${radius}:${height}:${sides}`, () => new THREE.CylinderGeometry(radius, radius, height, sides)), role, position, color);
  }

  beam(parent: THREE.Object3D, from: THREE.Vector3, to: THREE.Vector3, radius: number, role: MaterialRole | string = 'metal', color?: string) {
    const direction = to.clone().sub(from);
    const beam = this.cylinder(parent, radius, direction.length(), from.clone().add(to).multiplyScalar(.5).toArray() as [number, number, number], role, color, 8);
    beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize()); return beam;
  }

  setTheme(theme: ThemeName) {
    this.theme = theme;
    for (const [key, material] of this.materials) {
      if (key.includes(':')) continue;
      const color = sceneThemes[theme][key as MaterialRole];
      if (color) material.color.set(color);
      if (key === 'window') { material.emissive.set(sceneThemes[theme].windowEmission); material.emissiveIntensity = theme === 'dark' ? .65 : .08; }
    }
  }

  dispose() {
    this.disposed = true;
    this.geometries.forEach(g => g.dispose()); this.materials.forEach(m => m.dispose());
    this.trackedTextures.forEach(t => t.dispose());
  }
}

export function tree(kit: SceneKit, parent: THREE.Object3D, x: number, z: number, scale = 1) {
  const group = new THREE.Group(); group.position.set(x, .25, z); group.scale.setScalar(scale); parent.add(group);
  kit.cylinder(group, .09, 1.3, [0, .65, 0], 'trunk', undefined, 6);
  kit.mesh(group, kit.geometry('crown', () => new THREE.IcosahedronGeometry(.78, 0)), 'foliage', [0, 1.65, 0]);
  kit.mesh(group, kit.geometry('crownSmall', () => new THREE.IcosahedronGeometry(.53, 0)), 'foliageDark', [.38, 1.2, .1]);
}

export function lamp(kit: SceneKit, parent: THREE.Object3D, x: number, z: number) {
  kit.cylinder(parent, .065, 1, [x, .7, z], 'frame', undefined, 6);
  kit.box(parent, [.25, .22, .25], [x, 1.25, z], 'window');
  kit.box(parent, [.31, .07, .31], [x, 1.4, z], 'frame');
}

export function robotArm(kit: SceneKit, parent: THREE.Object3D, x: number, z: number, angle = 0) {
  const group = new THREE.Group(); group.position.set(x, .47, z); group.rotation.y = angle; parent.add(group);
  kit.cylinder(group, .4, .18, [0, 0, 0], 'metal');
  const a = new THREE.Vector3(0, .25, 0), b = new THREE.Vector3(.12, 1.25, 0), c = new THREE.Vector3(.95, 1.8, 0), d = new THREE.Vector3(1.28, 1.3, 0);
  for (const p of [a,b,c]) kit.mesh(group, kit.geometry('joint', () => new THREE.SphereGeometry(.19, 8, 6)), 'frame', p.toArray() as [number,number,number]);
  kit.beam(group,a,b,.19,'wall'); kit.beam(group,b,c,.16,'wall'); kit.beam(group,c,d,.11,'metal');
  kit.box(group,[.18,.13,.34],[d.x,d.y,d.z],'frame');
  kit.box(group,[.07,.28,.07],[d.x,d.y-.17,d.z-.15],'metal'); kit.box(group,[.07,.28,.07],[d.x,d.y-.17,d.z+.15],'metal');
  return group;
}
