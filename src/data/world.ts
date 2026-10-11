export type Point = { x: number; z: number };
export type WorldDestination = {
  id: string; label: string; shortLabel: string; caption: string; href: string;
  position: Point; width: number; depth: number; accent: string;
};
export const destinations: WorldDestination[] = [
  { id: 'robotics', label: 'Robotics Lab', shortLabel: 'Robotics', caption: 'Learning to act', href: '/projects/robotics/', position: { x: 0, z: -3 }, width: 5.1, depth: 4.2, accent: '#789ca6' },
  { id: 'vision', label: 'Vision Observatory', shortLabel: 'Vision', caption: 'Making sense of the world', href: '/projects/vision/', position: { x: -8, z: -3 }, width: 4.1, depth: 3.7, accent: '#a09dbb' },
  { id: 'maker', label: 'Maker Workshop', shortLabel: 'Hardware', caption: 'Ideas, made tangible', href: '/projects/hardware/', position: { x: -8, z: 6 }, width: 4.2, depth: 3.5, accent: '#9cb49a' },
  { id: 'journal', label: 'Engineering Journal', shortLabel: 'Journal', caption: 'Notes from the workbench', href: '/blog.html', position: { x: 0, z: 6 }, width: 4.5, depth: 3.5, accent: '#c5aa87' },
  { id: 'research', label: 'Research Pavilion', shortLabel: 'Research', caption: 'Questions worth exploring', href: '/research/', position: { x: 8, z: -3 }, width: 4.2, depth: 3.8, accent: '#b1a0b9' },
  { id: 'studio', label: 'Profile & Contact', shortLabel: 'About', caption: 'The person behind the projects', href: '/about/', position: { x: 8, z: 6 }, width: 3.6, depth: 3.2, accent: '#bbaa96' },
];
export const careerStops = [
  { id: 'iitb', position: { x: -8, z: -11 } },
  { id: 'jio', position: { x: 0, z: -11 } },
  { id: 'samsung', position: { x: 8, z: -11 } },
];
export const arrival: Point = { x: 8, z: -9.5 };
export const regions = [
  ...destinations.map(d => ({ x: d.position.x, z: d.position.z + .9, width: d.width + 2.8, depth: d.depth + 3.2 })),
  ...careerStops.map(d => ({ x: d.position.x, z: d.position.z, width: 4.4, depth: 4.2 })),
];
// World-axis avenues project into the four isometric directions. Junctions are
// continuous and leave a clear lane beside each building instead of diagonal cuts.
export const bridges: [Point, Point][] = [
  [{ x: -8, z: -9.5 }, { x: 8, z: -9.5 }],
  [{ x: -4, z: -9.5 }, { x: -4, z: 9 }],
  [{ x: 4, z: -9.5 }, { x: 4, z: 9 }],
  [{ x: -8, z: .6 }, { x: 8, z: .6 }],
  [{ x: -8, z: 9 }, { x: 8, z: 9 }],
];
export function doorFor(destination: WorldDestination) {
  return { x: destination.position.x, z: destination.position.z + destination.depth / 2 };
}
