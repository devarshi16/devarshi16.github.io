import { careerStops, destinations, doorFor, type Point } from '../data/world';

// Measure approach on the walkable plane, below each elevated white indicator.
export const indicatorLocations = [
  ...destinations.map(destination => {
    const door = doorFor(destination);
    return { id: destination.id, position: { x: door.x, z: door.z + .29 } };
  }),
  ...careerStops,
];

export function nearbyIndicator(point: Point, current: string | null = null): string | null {
  const distance = (position: Point) => Math.hypot(point.x - position.x, point.z - position.z);
  const active = indicatorLocations.find(indicator => indicator.id === current);
  // A wider exit radius keeps a callout steady while walking around its edge.
  if (active && distance(active.position) <= 2.8) return active.id;
  const nearest = indicatorLocations.reduce<{ id: string | null; distance: number }>((best, indicator) => {
    const next = distance(indicator.position);
    return next <= 2.2 && next < best.distance ? { id: indicator.id, distance: next } : best;
  }, { id: null, distance: Infinity });
  return nearest.id;
}

export type DrawingPoint = { x: number; y: number };
export type DrawingRect = { left: number; top: number; width: number; height: number };

export function drawingOutline(points: DrawingPoint[]): DrawingPoint[] {
  const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  const turn = (a: DrawingPoint, b: DrawingPoint, c: DrawingPoint) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  const half = (ordered: DrawingPoint[]) => {
    const edge: DrawingPoint[] = [];
    for (const point of ordered) {
      while (edge.length >= 2 && turn(edge.at(-2)!, edge.at(-1)!, point) <= 0) edge.pop();
      edge.push(point);
    }
    return edge.slice(0, -1);
  };
  return [...half(sorted), ...half(sorted.reverse())];
}

export function overlapsDrawing(rect: DrawingRect, outline: DrawingPoint[], clearance = 16): boolean {
  const corners = [
    { x: rect.left - clearance, y: rect.top - clearance },
    { x: rect.left + rect.width + clearance, y: rect.top - clearance },
    { x: rect.left + rect.width + clearance, y: rect.top + rect.height + clearance },
    { x: rect.left - clearance, y: rect.top + rect.height + clearance },
  ];
  const axes = [{ x: 1, y: 0 }, { x: 0, y: 1 }, ...outline.map((point, index) => {
    const next = outline[(index + 1) % outline.length];
    return { x: point.y - next.y, y: next.x - point.x };
  })];
  // Separating-axis check also protects against a large card enclosing the campus.
  return !axes.some(axis => {
    const project = (point: DrawingPoint) => point.x * axis.x + point.y * axis.y;
    const drawing = outline.map(project), card = corners.map(project);
    return Math.max(...drawing) <= Math.min(...card) || Math.max(...card) <= Math.min(...drawing);
  });
}
