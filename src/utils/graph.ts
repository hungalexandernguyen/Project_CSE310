import { haversine } from './haversine';
import streetsGeoJSON from '../../assets/streets.json';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface LatLng {
  latitude: number;
  longitude: number;
}

interface Edge {
  neighbourKey: string;
  weight: number; // metres
  coord: LatLng;
}

type AdjacencyList = Map<string, Edge[]>;

export interface GraphData {
  adjacency: AdjacencyList;
  nodes: Map<string, LatLng>; // nodeKey → coordinate
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

/** Round to 5 decimal places (~1 m precision) for node key matching */
function nodeKey(lat: number, lng: number): string {
  return `${lat.toFixed(5)},${lng.toFixed(5)}`;
}

function addEdge(adj: AdjacencyList, fromKey: string, toKey: string, toCoord: LatLng, weight: number) {
  if (!adj.has(fromKey)) adj.set(fromKey, []);
  adj.get(fromKey)!.push({ neighbourKey: toKey, weight, coord: toCoord });
}

// ──────────────────────────────────────────────
// Graph Builder
// ──────────────────────────────────────────────

export function buildGraph(): GraphData {
  const adjacency: AdjacencyList = new Map();
  const nodes: Map<string, LatLng> = new Map();

  const features = (streetsGeoJSON as any).features as any[];

  for (const feature of features) {
    const geom = feature.geometry;
    if (!geom || geom.type !== 'MultiLineString') continue;

    for (const lineString of geom.coordinates as number[][][]) {
      for (let i = 0; i < lineString.length - 1; i++) {
        // GeoJSON: [longitude, latitude]
        const [lng1, lat1] = lineString[i];
        const [lng2, lat2] = lineString[i + 1];

        const key1 = nodeKey(lat1, lng1);
        const key2 = nodeKey(lat2, lng2);
        const coord1: LatLng = { latitude: lat1, longitude: lng1 };
        const coord2: LatLng = { latitude: lat2, longitude: lng2 };
        const dist = haversine(lat1, lng1, lat2, lng2);

        nodes.set(key1, coord1);
        nodes.set(key2, coord2);

        // Bidirectional edges
        addEdge(adjacency, key1, key2, coord2, dist);
        addEdge(adjacency, key2, key1, coord1, dist);
      }
    }
  }

  return { adjacency, nodes };
}

// ──────────────────────────────────────────────
// Snap to Nearest Graph Node
// ──────────────────────────────────────────────

export function snapToGraph(graph: GraphData, lat: number, lng: number): string {
  let bestKey = '';
  let bestDist = Infinity;

  for (const [key, coord] of graph.nodes) {
    const d = haversine(lat, lng, coord.latitude, coord.longitude);
    if (d < bestDist) {
      bestDist = d;
      bestKey = key;
    }
  }
  return bestKey;
}

// ──────────────────────────────────────────────
// A* Pathfinding
// ──────────────────────────────────────────────

/**
 * A* algorithm on the campus road graph.
 *
 * @param graph   - The adjacency list built from streets.json
 * @param startKey - Node key of the start position (user location)
 * @param endKey   - Node key of the destination (building entrance)
 * @returns Ordered array of LatLng waypoints along the shortest path,
 *          or null if no path exists.
 */
export function astar(
  graph: GraphData,
  startKey: string,
  endKey: string
): LatLng[] | null {
  if (startKey === endKey) {
    const coord = graph.nodes.get(startKey);
    return coord ? [coord] : null;
  }

  const endCoord = graph.nodes.get(endKey);
  if (!endCoord) return null;

  // g(n): actual cost from start to n
  const gScore = new Map<string, number>();
  gScore.set(startKey, 0);

  // f(n) = g(n) + h(n)
  const fScore = new Map<string, number>();
  const startCoord = graph.nodes.get(startKey)!;
  fScore.set(startKey, haversine(startCoord.latitude, startCoord.longitude, endCoord.latitude, endCoord.longitude));

  // came_from: reconstruct path
  const cameFrom = new Map<string, string>();

  // Open set as a min-heap (simple sorted array for small graphs)
  // Each entry: [fScore, nodeKey]
  const openSet: [number, string][] = [[fScore.get(startKey)!, startKey]];
  const openSetKeys = new Set<string>([startKey]);

  while (openSet.length > 0) {
    // Pop node with lowest fScore
    openSet.sort((a, b) => a[0] - b[0]);
    const [, current] = openSet.shift()!;
    openSetKeys.delete(current);

    if (current === endKey) {
      // Reconstruct path
      const path: LatLng[] = [];
      let node: string | undefined = current;
      while (node) {
        const coord = graph.nodes.get(node);
        if (coord) path.unshift(coord);
        node = cameFrom.get(node);
      }
      return path;
    }

    const neighbours = graph.adjacency.get(current) ?? [];
    const currentG = gScore.get(current) ?? Infinity;

    for (const { neighbourKey, weight, coord } of neighbours) {
      const tentativeG = currentG + weight;

      if (tentativeG < (gScore.get(neighbourKey) ?? Infinity)) {
        cameFrom.set(neighbourKey, current);
        gScore.set(neighbourKey, tentativeG);
        const h = haversine(coord.latitude, coord.longitude, endCoord.latitude, endCoord.longitude);
        const f = tentativeG + h;
        fScore.set(neighbourKey, f);

        if (!openSetKeys.has(neighbourKey)) {
          openSet.push([f, neighbourKey]);
          openSetKeys.add(neighbourKey);
        }
      }
    }
  }

  return null; // No path found
}
