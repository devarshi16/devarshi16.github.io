import { destinations, regions, bridges, doorFor, type Point } from '../data/world';

function distanceToSegment(point: Point, a: Point, b: Point): number {
  const dx = b.x - a.x, dz = b.z - a.z;
  const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.z - a.z) * dz) / (dx * dx + dz * dz || 1)));
  return Math.hypot(point.x - a.x - t * dx, point.z - a.z - t * dz);
}
export function isOnGround(point: Point): boolean {
  return regions.some(r => Math.abs(point.x - r.x) <= r.width / 2 - .16 && Math.abs(point.z - r.z) <= r.depth / 2 - .16)
    || bridges.some(([a, b]) => distanceToSegment(point, a, b) < .66);
}
export function isInsideBuilding(point: Point): boolean {
  return destinations.some(d => Math.abs(point.x - d.position.x) < d.width / 2 + .13 &&
    Math.abs(point.z - d.position.z) < d.depth / 2 + .13 &&
    !(Math.abs(point.x - d.position.x) < .66 && point.z > d.position.z));
}
export function moveOnGround(from: Point, delta: Point): Point {
  const legal = (p: Point) => isOnGround(p) && !isInsideBuilding(p);
  const target = { x: from.x + delta.x, z: from.z + delta.z };
  if (legal(target)) return target;
  const slideX = { x: target.x, z: from.z };
  if (legal(slideX)) return slideX;
  const slideZ = { x: from.x, z: target.z };
  return legal(slideZ) ? slideZ : from;
}
export function enteredDoor(from: Point, to: Point): string | undefined {
  for (const d of destinations) {
    const door = doorFor(d);
    if (from.z >= door.z + .12 && to.z < door.z + .12 && to.z >= d.position.z && Math.abs(to.x - door.x) < .61) return d.id;
  }
}
export function isometricInput(horizontal: number, vertical: number): Point {
  // One world axis at a time: NW / NE / SW / SE in the isometric camera.
  // The runtime supplies the most recently held key; the fallback also remains cardinal.
  if (vertical) return { x: 0, z: Math.sign(vertical) };
  return { x: Math.sign(horizontal), z: 0 };
}
