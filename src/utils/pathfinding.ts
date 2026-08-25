import { IndoorNode, IndoorEdge, MOCK_NODES, MOCK_EDGES } from './indoor_graph';

export function findIndoorPath(
  startId: string,
  endId: string,
  nodes: Record<string, IndoorNode> = MOCK_NODES,
  edges: IndoorEdge[] = MOCK_EDGES
): IndoorNode[] {
  // 1. Xây dựng đồ thị vô hướng (Bi-directional graph)
  const adjacencyList: Record<string, { node: string; weight: number }[]> = {};

  Object.keys(nodes).forEach((id) => {
    adjacencyList[id] = [];
  });

  edges.forEach((edge) => {
    if (adjacencyList[edge.from] && adjacencyList[edge.to]) {
      adjacencyList[edge.from].push({ node: edge.to, weight: edge.weight });
      adjacencyList[edge.to].push({ node: edge.from, weight: edge.weight }); 
    }
  });

  // 2. Thuật toán Dijkstra
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  Object.keys(nodes).forEach((id) => {
    distances[id] = Infinity;
    previous[id] = null;
    unvisited.add(id);
  });

  distances[startId] = 0;

  while (unvisited.size > 0) {
    let currNode: string | null = null;
    let minDistance = Infinity;

    // Tìm node có khoảng cách nhỏ nhất trong tập chưa thăm
    unvisited.forEach((node) => {
      if (distances[node] < minDistance) {
        minDistance = distances[node];
        currNode = node;
      }
    });

    if (currNode === null) break; // Không thể đến được các node còn lại
    if (currNode === endId) break; // Đã tìm thấy đích

    unvisited.delete(currNode);

    adjacencyList[currNode].forEach((neighbor) => {
      if (unvisited.has(neighbor.node)) {
        const alt = distances[currNode!] + neighbor.weight;
        if (alt < distances[neighbor.node]) {
          distances[neighbor.node] = alt;
          previous[neighbor.node] = currNode;
        }
      }
    });
  }

  // 3. Truy xuất ngược (Backtrack) để lấy lộ trình
  const path: IndoorNode[] = [];
  let curr: string | null = endId;
  while (curr) {
    if (nodes[curr]) {
      path.unshift(nodes[curr]);
    }
    curr = previous[curr];
  }

  // Nếu điểm đầu của mảng không phải là điểm bắt đầu -> Không có đường đi
  if (path.length > 0 && path[0].id !== startId) {
    return []; 
  }

  return path;
}
