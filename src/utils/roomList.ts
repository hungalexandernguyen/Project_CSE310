/**
 * roomList.ts — Helper lấy danh sách phòng từ indoor_graph
 * Group theo buildingId và tầng, chỉ lấy node type === 'room'
 */

import { MOCK_NODES, IndoorNode, FloorLevel } from './indoor_graph';

export interface RoomSection {
  floor: FloorLevel;
  floorLabel: string;
  rooms: IndoorNode[];
}

const FLOOR_LABELS: Record<FloorLevel, string> = {
  G: 'Tầng G (Trệt)',
  '1': 'Tầng 1',
  '2': 'Tầng 2',
  '3': 'Tầng 3',
};

const FLOOR_ORDER: FloorLevel[] = ['G', '1', '2', '3'];

/**
 * Trả về danh sách phòng của một tòa, đã group theo tầng.
 * @param buildingId  vd: 'b11', 'b8'
 */
export function getRoomsByBuilding(buildingId: string): RoomSection[] {
  const allRooms = Object.values(MOCK_NODES).filter(
    (node) => node.buildingId === buildingId && node.type === 'room'
  );

  const grouped: Partial<Record<FloorLevel, IndoorNode[]>> = {};
  allRooms.forEach((room) => {
    if (!grouped[room.floor]) grouped[room.floor] = [];
    grouped[room.floor]!.push(room);
  });

  return FLOOR_ORDER
    .filter((f) => !!grouped[f])
    .map((f) => ({
      floor: f,
      floorLabel: FLOOR_LABELS[f],
      rooms: grouped[f]!.sort((a, b) =>
        (a.label ?? a.id).localeCompare(b.label ?? b.id)
      ),
    }));
}

/**
 * Tìm node phòng theo id.
 */
export function getRoomById(id: string): IndoorNode | undefined {
  return MOCK_NODES[id];
}
