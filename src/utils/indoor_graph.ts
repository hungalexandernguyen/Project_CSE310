/**
 * indoor_graph.ts — Tòa B11, B8 — đầy đủ 4 tầng mỗi tòa
 *
 * Tất cả tọa độ (x, y) là TÂM của phần tử SVG.
 *
 * ── B11 viewBox: 0 0 3047 797/812/820 ──────────────────────────
 *   hall_2 (trên): y=188, h=64 → tâm y=220
 *   hall_4 (dưới): y=529, h=54 → tâm y=556  (T.G và T.1)
 *   hall_3 (dưới): y=535, h=54 → tâm y=562  (T.2 và T.3)
 *   hall_6 (dọc):  x=1429, w=86 → tâm x=1472
 *
 * ── B8 viewBox: 0 0 2971 786 ──────────────────────────────────
 *   hall   (trên): y=188/190, h=64 → tâm y=222
 *   hall_4 (dưới): y=529/531, h=54 → tâm y=558
 *   hall_6 (dọc):  x=1353, w=86 → tâm x=1396
 *
 * ── B10 viewBox: 0 0 2895 773 ─────────────────────────────────
 *   NOTE: B10 SVG dùng transform rotate(-179.983°) → layout bị lật,
 *   cần tính toán phức tạp hơn (sẽ bổ sung sau khi có thêm thông tin)
 */

export type FloorLevel = 'G' | '1' | '2' | '3';

export interface IndoorNode {
  id: string;
  buildingId: string;
  floor: FloorLevel;
  x: number;
  y: number;
  type: 'room' | 'stairs' | 'elevator' | 'waypoint';
  label?: string;
}

export interface IndoorEdge {
  from: string;
  to: string;
  weight: number;
}

// ================================================================
// HẰNG SỐ HÀNH LANG
// ================================================================
// B11 Tầng G, 1
const B11_G1 = { top: 220, bot: 556, mid: 1472 };
// B11 Tầng 2, 3
const B11_23 = { top: 226, bot: 562, mid: 1472 };
// B8 tất cả tầng: hall(trên) y=190,h=64→222 | hall_4(dưới) y=531,h=54→558 | hall_6 x=1353,w=86→1396
const B8 = { top: 222, bot: 558, mid: 1396 };

export const MOCK_NODES: Record<string, IndoorNode> = {

  // ╔══════════════════════════════════════════════════════════════╗
  // ║                        TÒA B11                               ║
  // ╚══════════════════════════════════════════════════════════════╝

  // ── B11 TẦNG G ──────────────────────────────────────────────
  // Dãy trên (y tâm=95, door y=220)
  // 108: path M300 2 H1429 V188 → tâm (864,95)
  'room_G_108': { id:'room_G_108', buildingId:'b11', floor:'G', x:864,  y:95,  type:'room', label:'Phòng 108' },
  'door_G_108': { id:'door_G_108', buildingId:'b11', floor:'G', x:864,  y:B11_G1.top, type:'waypoint' },
  // 106: rect x=1515,y=4,w=209,h=184 → tâm (1619,96)
  'room_G_106': { id:'room_G_106', buildingId:'b11', floor:'G', x:1619, y:96,  type:'room', label:'Phòng 106' },
  'door_G_106': { id:'door_G_106', buildingId:'b11', floor:'G', x:1619, y:B11_G1.top, type:'waypoint' },
  // 104: rect x=1724,y=2,w=607,h=186 → tâm (2027,95)
  'room_G_104': { id:'room_G_104', buildingId:'b11', floor:'G', x:2027, y:95,  type:'room', label:'Phòng 104' },
  'door_G_104': { id:'door_G_104', buildingId:'b11', floor:'G', x:2027, y:B11_G1.top, type:'waypoint' },
  // 102: rect x=2331,y=2,w=258,h=186 → tâm (2460,95)
  'room_G_102': { id:'room_G_102', buildingId:'b11', floor:'G', x:2460, y:95,  type:'room', label:'Phòng 102' },
  'door_G_102': { id:'door_G_102', buildingId:'b11', floor:'G', x:2460, y:B11_G1.top, type:'waypoint' },
  // Dãy dưới (y tâm=680, door y=556)
  // 103: path M349 587 H1429 V773 → tâm (889,680)
  'room_G_103': { id:'room_G_103', buildingId:'b11', floor:'G', x:889,  y:680, type:'room', label:'Phòng 103' },
  'door_G_103': { id:'door_G_103', buildingId:'b11', floor:'G', x:889,  y:B11_G1.bot, type:'waypoint' },
  // 101: rect x=1515,y=587,w=1032,h=186 → tâm (2031,680)
  'room_G_101': { id:'room_G_101', buildingId:'b11', floor:'G', x:2031, y:680, type:'room', label:'Phòng 101' },
  'door_G_101': { id:'door_G_101', buildingId:'b11', floor:'G', x:2031, y:B11_G1.bot, type:'waypoint' },
  // Ngã tư hành lang
  'wp_G_top_mid': { id:'wp_G_top_mid', buildingId:'b11', floor:'G', x:B11_G1.mid, y:B11_G1.top, type:'waypoint' },
  'wp_G_bot_mid': { id:'wp_G_bot_mid', buildingId:'b11', floor:'G', x:B11_G1.mid, y:B11_G1.bot, type:'waypoint' },
  // Cầu thang
  'stairs_G_mid_top':  { id:'stairs_G_mid_top',  buildingId:'b11', floor:'G', x:1472, y:101, type:'stairs', label:'Cầu thang' },
  'stairs_G_mid_bot':  { id:'stairs_G_mid_bot',  buildingId:'b11', floor:'G', x:1472, y:701, type:'stairs' },
  'stairs_G_left_top': { id:'stairs_G_left_top', buildingId:'b11', floor:'G', x:247,  y:89,  type:'stairs' },
  'stairs_G_left_bot': { id:'stairs_G_left_bot', buildingId:'b11', floor:'G', x:306,  y:710, type:'stairs' },

  // ── B11 TẦNG 1 ──────────────────────────────────────────────
  // Dãy trên: 204 (trái), 202 (phải to)
  // 204: path M300 2 H1429 V188 → tâm (864,95)
  'room_1_204': { id:'room_1_204', buildingId:'b11', floor:'1', x:864,  y:95,  type:'room', label:'Phòng 204' },
  'door_1_204': { id:'door_1_204', buildingId:'b11', floor:'1', x:864,  y:B11_G1.top, type:'waypoint' },
  // 202: rect x=1515,y=2,w=1074,h=186 → tâm (2052,95)
  'room_1_202': { id:'room_1_202', buildingId:'b11', floor:'1', x:2052, y:95,  type:'room', label:'Phòng 202' },
  'door_1_202': { id:'door_1_202', buildingId:'b11', floor:'1', x:2052, y:B11_G1.top, type:'waypoint' },
  // Dãy dưới: 201-217
  // 217: rect x=370,y=600,w=346,h=203 → tâm (543,701)
  'room_1_217': { id:'room_1_217', buildingId:'b11', floor:'1', x:543,  y:701, type:'room', label:'Phòng 217' },
  'door_1_217': { id:'door_1_217', buildingId:'b11', floor:'1', x:543,  y:B11_G1.bot, type:'waypoint' },
  // 215: rect x=716,y=597,w=197,h=203 → tâm (814,698)
  'room_1_215': { id:'room_1_215', buildingId:'b11', floor:'1', x:814,  y:698, type:'room', label:'Phòng 215' },
  'door_1_215': { id:'door_1_215', buildingId:'b11', floor:'1', x:814,  y:B11_G1.bot, type:'waypoint' },
  // 213: rect x=913,y=597,w=181,h=203 → tâm (1003,698)
  'room_1_213': { id:'room_1_213', buildingId:'b11', floor:'1', x:1003, y:698, type:'room', label:'Phòng 213' },
  'door_1_213': { id:'door_1_213', buildingId:'b11', floor:'1', x:1003, y:B11_G1.bot, type:'waypoint' },
  // 211: rect x=1094,y=597,w=181,h=203 → tâm (1184,698)
  'room_1_211': { id:'room_1_211', buildingId:'b11', floor:'1', x:1184, y:698, type:'room', label:'Phòng 211' },
  'door_1_211': { id:'door_1_211', buildingId:'b11', floor:'1', x:1184, y:B11_G1.bot, type:'waypoint' },
  // 209: rect x=1275,y=597,w=154,h=203 → tâm (1352,698)
  'room_1_209': { id:'room_1_209', buildingId:'b11', floor:'1', x:1352, y:698, type:'room', label:'Phòng 209' },
  'door_1_209': { id:'door_1_209', buildingId:'b11', floor:'1', x:1352, y:B11_G1.bot, type:'waypoint' },
  // 207: rect x=1505,y=594,w=165,h=203 → tâm (1587,695)
  'room_1_207': { id:'room_1_207', buildingId:'b11', floor:'1', x:1587, y:695, type:'room', label:'Phòng 207' },
  'door_1_207': { id:'door_1_207', buildingId:'b11', floor:'1', x:1587, y:B11_G1.bot, type:'waypoint' },
  // 205: rect x=1666,y=594,w=210,h=203 → tâm (1771,695)
  'room_1_205': { id:'room_1_205', buildingId:'b11', floor:'1', x:1771, y:695, type:'room', label:'Phòng 205' },
  'door_1_205': { id:'door_1_205', buildingId:'b11', floor:'1', x:1771, y:B11_G1.bot, type:'waypoint' },
  // 203: rect x=1876,y=595,w=339,h=215 → tâm (2045,702)
  'room_1_203': { id:'room_1_203', buildingId:'b11', floor:'1', x:2045, y:702, type:'room', label:'Phòng 203' },
  'door_1_203': { id:'door_1_203', buildingId:'b11', floor:'1', x:2045, y:B11_G1.bot, type:'waypoint' },
  // 201: rect x=2215,y=597,w=332,h=215 → tâm (2381,704)
  'room_1_201': { id:'room_1_201', buildingId:'b11', floor:'1', x:2381, y:704, type:'room', label:'Phòng 201' },
  'door_1_201': { id:'door_1_201', buildingId:'b11', floor:'1', x:2381, y:B11_G1.bot, type:'waypoint' },
  // Ngã tư
  'wp_1_top_mid': { id:'wp_1_top_mid', buildingId:'b11', floor:'1', x:B11_G1.mid, y:B11_G1.top, type:'waypoint' },
  'wp_1_bot_mid': { id:'wp_1_bot_mid', buildingId:'b11', floor:'1', x:B11_G1.mid, y:B11_G1.bot, type:'waypoint' },
  // Cầu thang
  'stairs_1_mid_top':  { id:'stairs_1_mid_top',  buildingId:'b11', floor:'1', x:1472, y:101, type:'stairs', label:'Cầu thang' },
  'stairs_1_mid_bot':  { id:'stairs_1_mid_bot',  buildingId:'b11', floor:'1', x:1472, y:701, type:'stairs' },
  'stairs_1_left_top': { id:'stairs_1_left_top', buildingId:'b11', floor:'1', x:247,  y:89,  type:'stairs' },
  'stairs_1_left_bot': { id:'stairs_1_left_bot', buildingId:'b11', floor:'1', x:306,  y:716, type:'stairs' },

  // ── B11 TẦNG 2 ──────────────────────────────────────────────
  // hall(trên) y=194,h=64→tâm y=226 | hall_3(dưới) y=535,h=54→tâm y=562
  // Dãy trên: chỉ có 202 (phía phải)
  // 202: rect x=2393,y=8,w=196,h=186 → tâm (2491,101)
  'room_2_202': { id:'room_2_202', buildingId:'b11', floor:'2', x:2491, y:101, type:'room', label:'Phòng 202' },
  'door_2_202': { id:'door_2_202', buildingId:'b11', floor:'2', x:2491, y:B11_23.top, type:'waypoint' },
  // Dãy dưới: 311,309,307,305A/B,301A/B
  // 311: rect x=370,y=606,w=346,h=203 → tâm (543,707)
  'room_2_311': { id:'room_2_311', buildingId:'b11', floor:'2', x:543,  y:707, type:'room', label:'Phòng 311' },
  'door_2_311': { id:'door_2_311', buildingId:'b11', floor:'2', x:543,  y:B11_23.bot, type:'waypoint' },
  // 309: rect x=716,y=603,w=378,h=203 → tâm (905,704)
  'room_2_309': { id:'room_2_309', buildingId:'b11', floor:'2', x:905,  y:704, type:'room', label:'Phòng 309' },
  'door_2_309': { id:'door_2_309', buildingId:'b11', floor:'2', x:905,  y:B11_23.bot, type:'waypoint' },
  // 307: rect x=1094,y=603,w=335,h=203 → tâm (1261,704)
  'room_2_307': { id:'room_2_307', buildingId:'b11', floor:'2', x:1261, y:704, type:'room', label:'Phòng 307' },
  'door_2_307': { id:'door_2_307', buildingId:'b11', floor:'2', x:1261, y:B11_23.bot, type:'waypoint' },
  // 305B: rect x=1505,y=600,w=165,h=220 → tâm (1587,710)
  'room_2_305B': { id:'room_2_305B', buildingId:'b11', floor:'2', x:1587, y:710, type:'room', label:'Phòng 305B' },
  'door_2_305B': { id:'door_2_305B', buildingId:'b11', floor:'2', x:1587, y:B11_23.bot, type:'waypoint' },
  // 305A: rect x=1670,y=606,w=159,h=212 → tâm (1749,712)
  'room_2_305A': { id:'room_2_305A', buildingId:'b11', floor:'2', x:1749, y:712, type:'room', label:'Phòng 305A' },
  'door_2_305A': { id:'door_2_305A', buildingId:'b11', floor:'2', x:1749, y:B11_23.bot, type:'waypoint' },
  // 301B: rect x=2149,y=605,w=198,h=215 → tâm (2248,712)
  'room_2_301B': { id:'room_2_301B', buildingId:'b11', floor:'2', x:2248, y:712, type:'room', label:'Phòng 301B' },
  'door_2_301B': { id:'door_2_301B', buildingId:'b11', floor:'2', x:2248, y:B11_23.bot, type:'waypoint' },
  // 301A: rect x=2356,y=603,w=191,h=215 → tâm (2451,710)
  'room_2_301A': { id:'room_2_301A', buildingId:'b11', floor:'2', x:2451, y:710, type:'room', label:'Phòng 301A' },
  'door_2_301A': { id:'door_2_301A', buildingId:'b11', floor:'2', x:2451, y:B11_23.bot, type:'waypoint' },
  // Ngã tư
  'wp_2_top_mid': { id:'wp_2_top_mid', buildingId:'b11', floor:'2', x:B11_23.mid, y:B11_23.top, type:'waypoint' },
  'wp_2_bot_mid': { id:'wp_2_bot_mid', buildingId:'b11', floor:'2', x:B11_23.mid, y:B11_23.bot, type:'waypoint' },
  // Cầu thang: stairs_right x=1429,y=20,w=86,h=174 → tâm (1472,107)
  'stairs_2_mid_top':  { id:'stairs_2_mid_top',  buildingId:'b11', floor:'2', x:1472, y:107, type:'stairs', label:'Cầu thang' },
  'stairs_2_mid_bot':  { id:'stairs_2_mid_bot',  buildingId:'b11', floor:'2', x:1472, y:707, type:'stairs' },
  'stairs_2_left_top': { id:'stairs_2_left_top', buildingId:'b11', floor:'2', x:247,  y:95,  type:'stairs' },
  'stairs_2_left_bot': { id:'stairs_2_left_bot', buildingId:'b11', floor:'2', x:306,  y:716, type:'stairs' },

  // ── B11 TẦNG 3 ──────────────────────────────────────────────
  // Cùng hall layout với Tầng 2
  // 402: rect x=2393,y=8,w=196,h=186 → tâm (2491,101)
  'room_3_402': { id:'room_3_402', buildingId:'b11', floor:'3', x:2491, y:101, type:'room', label:'Phòng 402' },
  'door_3_402': { id:'door_3_402', buildingId:'b11', floor:'3', x:2491, y:B11_23.top, type:'waypoint' },
  // 415: rect x=349,y=606,w=745,h=203 → tâm (721,707)
  'room_3_415': { id:'room_3_415', buildingId:'b11', floor:'3', x:721,  y:707, type:'room', label:'Phòng 415' },
  'door_3_415': { id:'door_3_415', buildingId:'b11', floor:'3', x:721,  y:B11_23.bot, type:'waypoint' },
  // 413: path M1094 603 H1429 V806 → tâm (1261,704)
  'room_3_413': { id:'room_3_413', buildingId:'b11', floor:'3', x:1261, y:704, type:'room', label:'Phòng 413' },
  'door_3_413': { id:'door_3_413', buildingId:'b11', floor:'3', x:1261, y:B11_23.bot, type:'waypoint' },
  // 411: path M1505 600 H1670 V820 → tâm (1587,710)
  'room_3_411': { id:'room_3_411', buildingId:'b11', floor:'3', x:1587, y:710, type:'room', label:'Phòng 411' },
  'door_3_411': { id:'door_3_411', buildingId:'b11', floor:'3', x:1587, y:B11_23.bot, type:'waypoint' },
  // 409: rect x=1670,y=606,w=159,h=212 → tâm (1749,712)
  'room_3_409': { id:'room_3_409', buildingId:'b11', floor:'3', x:1749, y:712, type:'room', label:'Phòng 409' },
  'door_3_409': { id:'door_3_409', buildingId:'b11', floor:'3', x:1749, y:B11_23.bot, type:'waypoint' },
  // 405: rect x=1990,y=606,w=159,h=214 → tâm (2069,713)
  'room_3_405': { id:'room_3_405', buildingId:'b11', floor:'3', x:2069, y:713, type:'room', label:'Phòng 405' },
  'door_3_405': { id:'door_3_405', buildingId:'b11', floor:'3', x:2069, y:B11_23.bot, type:'waypoint' },
  // 403: rect x=2149,y=605,w=198,h=215 → tâm (2248,712)
  'room_3_403': { id:'room_3_403', buildingId:'b11', floor:'3', x:2248, y:712, type:'room', label:'Phòng 403' },
  'door_3_403': { id:'door_3_403', buildingId:'b11', floor:'3', x:2248, y:B11_23.bot, type:'waypoint' },
  // 401: rect x=2356,y=603,w=191,h=215 → tâm (2451,710)
  'room_3_401': { id:'room_3_401', buildingId:'b11', floor:'3', x:2451, y:710, type:'room', label:'Phòng 401' },
  'door_3_401': { id:'door_3_401', buildingId:'b11', floor:'3', x:2451, y:B11_23.bot, type:'waypoint' },
  // Ngã tư
  'wp_3_top_mid': { id:'wp_3_top_mid', buildingId:'b11', floor:'3', x:B11_23.mid, y:B11_23.top, type:'waypoint' },
  'wp_3_bot_mid': { id:'wp_3_bot_mid', buildingId:'b11', floor:'3', x:B11_23.mid, y:B11_23.bot, type:'waypoint' },
  // Cầu thang
  'stairs_3_mid_top':  { id:'stairs_3_mid_top',  buildingId:'b11', floor:'3', x:1472, y:107, type:'stairs', label:'Cầu thang' },
  'stairs_3_mid_bot':  { id:'stairs_3_mid_bot',  buildingId:'b11', floor:'3', x:1472, y:707, type:'stairs' },
  'stairs_3_left_top': { id:'stairs_3_left_top', buildingId:'b11', floor:'3', x:245,  y:100, type:'stairs' },
  'stairs_3_left_bot': { id:'stairs_3_left_bot', buildingId:'b11', floor:'3', x:306,  y:716, type:'stairs' },


  // ╔══════════════════════════════════════════════════════════════╗
  // ║                        TÒA B8                                ║
  // ║  viewBox: 0 0 2971 786                                       ║
  // ║  hall  (trên): y=190, h=64 → tâm y=222                      ║
  // ║  hall_4(dưới): y=531, h=54 → tâm y=558                      ║
  // ║  hall_6(dọc):  x=1353, w=86 → tâm x=1396                   ║
  // ╚══════════════════════════════════════════════════════════════╝

  // ── B8 TẦNG G ───────────────────────────────────────────────
  // Dãy trên (door y=222):
  // 116: rect x=203,y=4,w=556,h=184 → tâm (481,96)
  'room_bG_116': { id:'room_bG_116', buildingId:'b8', floor:'G', x:481,  y:96,  type:'room', label:'Phòng 116' },
  'door_bG_116': { id:'door_bG_116', buildingId:'b8', floor:'G', x:481,  y:B8.top, type:'waypoint' },
  // 114: rect x=759,y=4,w=594,h=184 → tâm (1056,96)
  'room_bG_114': { id:'room_bG_114', buildingId:'b8', floor:'G', x:1056, y:96,  type:'room', label:'Phòng 114' },
  'door_bG_114': { id:'door_bG_114', buildingId:'b8', floor:'G', x:1056, y:B8.top, type:'waypoint' },
  // 112: rect x=1437,y=4,w=133,h=184 → tâm (1503,96)
  'room_bG_112': { id:'room_bG_112', buildingId:'b8', floor:'G', x:1503, y:96,  type:'room', label:'Phòng 112' },
  'door_bG_112': { id:'door_bG_112', buildingId:'b8', floor:'G', x:1503, y:B8.top, type:'waypoint' },
  // 110: rect x=1570,y=4,w=153,h=184 → tâm (1646,96)
  'room_bG_110': { id:'room_bG_110', buildingId:'b8', floor:'G', x:1646, y:96,  type:'room', label:'Phòng 110' },
  'door_bG_110': { id:'door_bG_110', buildingId:'b8', floor:'G', x:1646, y:B8.top, type:'waypoint' },
  // 108: rect x=1723,y=4,w=198,h=184 → tâm (1822,96)
  'room_bG_108': { id:'room_bG_108', buildingId:'b8', floor:'G', x:1822, y:96,  type:'room', label:'Phòng 108' },
  'door_bG_108': { id:'door_bG_108', buildingId:'b8', floor:'G', x:1822, y:B8.top, type:'waypoint' },
  // 106: rect x=1921,y=4,w=198,h=184 → tâm (2020,96)
  'room_bG_106': { id:'room_bG_106', buildingId:'b8', floor:'G', x:2020, y:96,  type:'room', label:'Phòng 106' },
  'door_bG_106': { id:'door_bG_106', buildingId:'b8', floor:'G', x:2020, y:B8.top, type:'waypoint' },
  // 104: rect x=2119,y=4,w=196,h=184 → tâm (2217,96)
  'room_bG_104': { id:'room_bG_104', buildingId:'b8', floor:'G', x:2217, y:96,  type:'room', label:'Phòng 104' },
  'door_bG_104': { id:'door_bG_104', buildingId:'b8', floor:'G', x:2217, y:B8.top, type:'waypoint' },
  // 102: rect x=2315,y=4,w=198,h=184 → tâm (2414,96)
  'room_bG_102': { id:'room_bG_102', buildingId:'b8', floor:'G', x:2414, y:96,  type:'room', label:'Phòng 102' },
  'door_bG_102': { id:'door_bG_102', buildingId:'b8', floor:'G', x:2414, y:B8.top, type:'waypoint' },
  // Dãy dưới (door y=558):
  // 111: rect x=273,y=581,w=609,h=203 → tâm (577,682)
  'room_bG_111': { id:'room_bG_111', buildingId:'b8', floor:'G', x:577,  y:682, type:'room', label:'Phòng 111' },
  'door_bG_111': { id:'door_bG_111', buildingId:'b8', floor:'G', x:577,  y:B8.bot, type:'waypoint' },
  // 109: path M882 581 H1355 V784 → tâm (1118,682)
  'room_bG_109': { id:'room_bG_109', buildingId:'b8', floor:'G', x:1118, y:682, type:'room', label:'Phòng 109' },
  'door_bG_109': { id:'door_bG_109', buildingId:'b8', floor:'G', x:1118, y:B8.bot, type:'waypoint' },
  // 107: path M1439 581 H1690 V784 → tâm (1564,682)
  'room_bG_107': { id:'room_bG_107', buildingId:'b8', floor:'G', x:1564, y:682, type:'room', label:'Phòng 107' },
  'door_bG_107': { id:'door_bG_107', buildingId:'b8', floor:'G', x:1564, y:B8.bot, type:'waypoint' },
  // 105: path M1690 581 H1921 V784 → tâm (1805,682)
  'room_bG_105': { id:'room_bG_105', buildingId:'b8', floor:'G', x:1805, y:682, type:'room', label:'Phòng 105' },
  'door_bG_105': { id:'door_bG_105', buildingId:'b8', floor:'G', x:1805, y:B8.bot, type:'waypoint' },
  // 103: path M1921 581 H2198 V784 → tâm (2059,682)
  'room_bG_103': { id:'room_bG_103', buildingId:'b8', floor:'G', x:2059, y:682, type:'room', label:'Phòng 103' },
  'door_bG_103': { id:'door_bG_103', buildingId:'b8', floor:'G', x:2059, y:B8.bot, type:'waypoint' },
  // 102_2 (phòng dưới-phải): path M2194 581 H2471 V784 → tâm (2332,682)
  'room_bG_102b': { id:'room_bG_102b', buildingId:'b8', floor:'G', x:2332, y:682, type:'room', label:'Phòng 102B' },
  'door_bG_102b': { id:'door_bG_102b', buildingId:'b8', floor:'G', x:2332, y:B8.bot, type:'waypoint' },
  // Ngã tư hành lang B8
  'wp_bG_top_mid': { id:'wp_bG_top_mid', buildingId:'b8', floor:'G', x:B8.mid, y:B8.top, type:'waypoint' },
  'wp_bG_bot_mid': { id:'wp_bG_bot_mid', buildingId:'b8', floor:'G', x:B8.mid, y:B8.bot, type:'waypoint' },
  // Cầu thang B8 Tầng G:
  // stairs_right_last: x=109,y=2,w=100,h=186 → tâm (159,95)
  'stairs_bG_left_top': { id:'stairs_bG_left_top', buildingId:'b8', floor:'G', x:159,  y:95,  type:'stairs' },
  // stairs_left_last: x=187,y=581,w=86,h=203 → tâm (230,682)
  'stairs_bG_left_bot': { id:'stairs_bG_left_bot', buildingId:'b8', floor:'G', x:230,  y:682, type:'stairs' },
  // stairs_right: x=1353,y=4,w=86,h=184 → tâm (1396,96)
  'stairs_bG_mid_top':  { id:'stairs_bG_mid_top',  buildingId:'b8', floor:'G', x:1396, y:96,  type:'stairs', label:'Cầu thang' },
  // stairs_left: x=1353,y=581,w=86,h=203 → tâm (1396,682)
  'stairs_bG_mid_bot':  { id:'stairs_bG_mid_bot',  buildingId:'b8', floor:'G', x:1396, y:682, type:'stairs' },

  // ── B8 TẦNG 1 ───────────────────────────────────────────────
  // hall(trên) y=190,h=64→222 | hall_4(dưới) y=531,h=54→558 | hall_6 x=1353,w=86→1396
  // Dãy trên: 202 (x=2315,y=6,w=198,h=184 → tâm (2414,98))
  'room_b1_202': { id:'room_b1_202', buildingId:'b8', floor:'1', x:2414, y:98,  type:'room', label:'Phòng 202' },
  'door_b1_202': { id:'door_b1_202', buildingId:'b8', floor:'1', x:2414, y:B8.top, type:'waypoint' },
  // Dãy dưới:
  // 217: rect x=761,y=583,w=357,h=203 → tâm (939,684)
  'room_b1_217': { id:'room_b1_217', buildingId:'b8', floor:'1', x:939,  y:684, type:'room', label:'Phòng 217' },
  'door_b1_217': { id:'door_b1_217', buildingId:'b8', floor:'1', x:939,  y:B8.bot, type:'waypoint' },
  // 215: path M1118 583 H1394 V786 → tâm (1256,684)
  'room_b1_215': { id:'room_b1_215', buildingId:'b8', floor:'1', x:1256, y:684, type:'room', label:'Phòng 215' },
  'door_b1_215': { id:'door_b1_215', buildingId:'b8', floor:'1', x:1256, y:B8.bot, type:'waypoint' },
  // 207: path M1895 579 H2035 V782 → tâm (1965,680)
  'room_b1_207': { id:'room_b1_207', buildingId:'b8', floor:'1', x:1965, y:680, type:'room', label:'Phòng 207' },
  'door_b1_207': { id:'door_b1_207', buildingId:'b8', floor:'1', x:1965, y:B8.bot, type:'waypoint' },
  // 205: path M2035 579 H2163 V782 → tâm (2099,680)
  'room_b1_205': { id:'room_b1_205', buildingId:'b8', floor:'1', x:2099, y:680, type:'room', label:'Phòng 205' },
  'door_b1_205': { id:'door_b1_205', buildingId:'b8', floor:'1', x:2099, y:B8.bot, type:'waypoint' },
  // 203: path M2163 579 H2318 V782 → tâm (2240,680)
  'room_b1_203': { id:'room_b1_203', buildingId:'b8', floor:'1', x:2240, y:680, type:'room', label:'Phòng 203' },
  'door_b1_203': { id:'door_b1_203', buildingId:'b8', floor:'1', x:2240, y:B8.bot, type:'waypoint' },
  // 201: path M2316 579 H2470 V782 → tâm (2393,680)
  'room_b1_201': { id:'room_b1_201', buildingId:'b8', floor:'1', x:2393, y:680, type:'room', label:'Phòng 201' },
  'door_b1_201': { id:'door_b1_201', buildingId:'b8', floor:'1', x:2393, y:B8.bot, type:'waypoint' },
  // Ngã tư
  'wp_b1_top_mid': { id:'wp_b1_top_mid', buildingId:'b8', floor:'1', x:B8.mid, y:B8.top, type:'waypoint' },
  'wp_b1_bot_mid': { id:'wp_b1_bot_mid', buildingId:'b8', floor:'1', x:B8.mid, y:B8.bot, type:'waypoint' },
  // Cầu thang B8 Tầng 1 (cùng vị trí)
  'stairs_b1_left_top': { id:'stairs_b1_left_top', buildingId:'b8', floor:'1', x:159,  y:95,  type:'stairs' },
  'stairs_b1_left_bot': { id:'stairs_b1_left_bot', buildingId:'b8', floor:'1', x:230,  y:684, type:'stairs' },
  'stairs_b1_mid_top':  { id:'stairs_b1_mid_top',  buildingId:'b8', floor:'1', x:1396, y:96,  type:'stairs', label:'Cầu thang' },
  'stairs_b1_mid_bot':  { id:'stairs_b1_mid_bot',  buildingId:'b8', floor:'1', x:1396, y:684, type:'stairs' },

  // ── B8 TẦNG 2 ───────────────────────────────────────────────
  // 302: rect x=2315,y=6,w=198,h=184 → tâm (2414,98)
  'room_b2_302': { id:'room_b2_302', buildingId:'b8', floor:'2', x:2414, y:98,  type:'room', label:'Phòng 302' },
  'door_b2_302': { id:'door_b2_302', buildingId:'b8', floor:'2', x:2414, y:B8.top, type:'waypoint' },
  // 311: rect x=273,y=583,w=632,h=203 → tâm (589,684)
  'room_b2_311': { id:'room_b2_311', buildingId:'b8', floor:'2', x:589,  y:684, type:'room', label:'Phòng 311' },
  'door_b2_311': { id:'door_b2_311', buildingId:'b8', floor:'2', x:589,  y:B8.bot, type:'waypoint' },
  // 309: path M905 583 H1394 V786 → tâm (1149,684)
  'room_b2_309': { id:'room_b2_309', buildingId:'b8', floor:'2', x:1149, y:684, type:'room', label:'Phòng 309' },
  'door_b2_309': { id:'door_b2_309', buildingId:'b8', floor:'2', x:1149, y:B8.bot, type:'waypoint' },
  // 307: path M1439 579 H1712 V782 → tâm (1575,680)
  'room_b2_307': { id:'room_b2_307', buildingId:'b8', floor:'2', x:1575, y:680, type:'room', label:'Phòng 307' },
  'door_b2_307': { id:'door_b2_307', buildingId:'b8', floor:'2', x:1575, y:B8.bot, type:'waypoint' },
  // 305: path M1712 579 H1985 V782 → tâm (1848,680)
  'room_b2_305': { id:'room_b2_305', buildingId:'b8', floor:'2', x:1848, y:680, type:'room', label:'Phòng 305' },
  'door_b2_305': { id:'door_b2_305', buildingId:'b8', floor:'2', x:1848, y:B8.bot, type:'waypoint' },
  // 303: path M1985 579 H2316 V782 → tâm (2150,680)
  'room_b2_303': { id:'room_b2_303', buildingId:'b8', floor:'2', x:2150, y:680, type:'room', label:'Phòng 303' },
  'door_b2_303': { id:'door_b2_303', buildingId:'b8', floor:'2', x:2150, y:B8.bot, type:'waypoint' },
  // 301: path M2316 579 H2470 V782 → tâm (2393,680)
  'room_b2_301': { id:'room_b2_301', buildingId:'b8', floor:'2', x:2393, y:680, type:'room', label:'Phòng 301' },
  'door_b2_301': { id:'door_b2_301', buildingId:'b8', floor:'2', x:2393, y:B8.bot, type:'waypoint' },
  // Ngã tư
  'wp_b2_top_mid': { id:'wp_b2_top_mid', buildingId:'b8', floor:'2', x:B8.mid, y:B8.top, type:'waypoint' },
  'wp_b2_bot_mid': { id:'wp_b2_bot_mid', buildingId:'b8', floor:'2', x:B8.mid, y:B8.bot, type:'waypoint' },
  // Cầu thang B8 Tầng 2
  'stairs_b2_left_top': { id:'stairs_b2_left_top', buildingId:'b8', floor:'2', x:159,  y:95,  type:'stairs' },
  'stairs_b2_left_bot': { id:'stairs_b2_left_bot', buildingId:'b8', floor:'2', x:230,  y:684, type:'stairs' },
  'stairs_b2_mid_top':  { id:'stairs_b2_mid_top',  buildingId:'b8', floor:'2', x:1396, y:96,  type:'stairs', label:'Cầu thang' },
  'stairs_b2_mid_bot':  { id:'stairs_b2_mid_bot',  buildingId:'b8', floor:'2', x:1396, y:684, type:'stairs' },

  // ── B8 TẦNG 3 ───────────────────────────────────────────────
  // 402: rect x=2315,y=6,w=198,h=184 → tâm (2414,98)
  'room_b3_402': { id:'room_b3_402', buildingId:'b8', floor:'3', x:2414, y:98,  type:'room', label:'Phòng 402' },
  'door_b3_402': { id:'door_b3_402', buildingId:'b8', floor:'3', x:2414, y:B8.top, type:'waypoint' },
  // 419: rect x=273,y=583,w=277,h=203 → tâm (411,684)
  'room_b3_419': { id:'room_b3_419', buildingId:'b8', floor:'3', x:411,  y:684, type:'room', label:'Phòng 419' },
  'door_b3_419': { id:'door_b3_419', buildingId:'b8', floor:'3', x:411,  y:B8.bot, type:'waypoint' },
  // 417: path M550 583 H797 V786 → tâm (673,684)
  'room_b3_417': { id:'room_b3_417', buildingId:'b8', floor:'3', x:673,  y:684, type:'room', label:'Phòng 417' },
  'door_b3_417': { id:'door_b3_417', buildingId:'b8', floor:'3', x:673,  y:B8.bot, type:'waypoint' },
  // 415: rect x=797,y=583,w=299,h=203 → tâm (946,684)
  'room_b3_415': { id:'room_b3_415', buildingId:'b8', floor:'3', x:946,  y:684, type:'room', label:'Phòng 415' },
  'door_b3_415': { id:'door_b3_415', buildingId:'b8', floor:'3', x:946,  y:B8.bot, type:'waypoint' },
  // 413: path M1096 583 H1353 V786 → tâm (1224,684)
  'room_b3_413': { id:'room_b3_413', buildingId:'b8', floor:'3', x:1224, y:684, type:'room', label:'Phòng 413' },
  'door_b3_413': { id:'door_b3_413', buildingId:'b8', floor:'3', x:1224, y:B8.bot, type:'waypoint' },
  // 407: path M1710 583 H1915 V786 → tâm (1812,684)
  'room_b3_407': { id:'room_b3_407', buildingId:'b8', floor:'3', x:1812, y:684, type:'room', label:'Phòng 407' },
  'door_b3_407': { id:'door_b3_407', buildingId:'b8', floor:'3', x:1812, y:B8.bot, type:'waypoint' },
  // 405: path M1915 583 H2120 V786 → tâm (2017,684)
  'room_b3_405': { id:'room_b3_405', buildingId:'b8', floor:'3', x:2017, y:684, type:'room', label:'Phòng 405' },
  'door_b3_405': { id:'door_b3_405', buildingId:'b8', floor:'3', x:2017, y:B8.bot, type:'waypoint' },
  // 403: path M2120 583 H2368 V786 → tâm (2244,684)
  'room_b3_403': { id:'room_b3_403', buildingId:'b8', floor:'3', x:2244, y:684, type:'room', label:'Phòng 403' },
  'door_b3_403': { id:'door_b3_403', buildingId:'b8', floor:'3', x:2244, y:B8.bot, type:'waypoint' },
  // 401: path M2368 583 H2483 V786 → tâm (2425,684)
  'room_b3_401': { id:'room_b3_401', buildingId:'b8', floor:'3', x:2425, y:684, type:'room', label:'Phòng 401' },
  'door_b3_401': { id:'door_b3_401', buildingId:'b8', floor:'3', x:2425, y:B8.bot, type:'waypoint' },
  // Ngã tư
  'wp_b3_top_mid': { id:'wp_b3_top_mid', buildingId:'b8', floor:'3', x:B8.mid, y:B8.top, type:'waypoint' },
  'wp_b3_bot_mid': { id:'wp_b3_bot_mid', buildingId:'b8', floor:'3', x:B8.mid, y:B8.bot, type:'waypoint' },
  // Cầu thang B8 Tầng 3
  'stairs_b3_left_top': { id:'stairs_b3_left_top', buildingId:'b8', floor:'3', x:159,  y:95,  type:'stairs' },
  'stairs_b3_left_bot': { id:'stairs_b3_left_bot', buildingId:'b8', floor:'3', x:230,  y:684, type:'stairs' },
  'stairs_b3_mid_top':  { id:'stairs_b3_mid_top',  buildingId:'b8', floor:'3', x:1396, y:96,  type:'stairs', label:'Cầu thang' },
  'stairs_b3_mid_bot':  { id:'stairs_b3_mid_bot',  buildingId:'b8', floor:'3', x:1396, y:684, type:'stairs' },
};

// ================================================================
// EDGES
// ================================================================
export const MOCK_EDGES: IndoorEdge[] = [

  // ╔══════════════════════════════════════════════════════════════╗
  // ║  B11 — EDGES                                                  ║
  // ╚══════════════════════════════════════════════════════════════╝

  // ── B11 Tầng G: Phòng ↔ Door ────────────────────────────────
  { from:'room_G_108', to:'door_G_108', weight:125 },
  { from:'room_G_106', to:'door_G_106', weight:124 },
  { from:'room_G_104', to:'door_G_104', weight:125 },
  { from:'room_G_102', to:'door_G_102', weight:125 },
  { from:'room_G_103', to:'door_G_103', weight:124 },
  { from:'room_G_101', to:'door_G_101', weight:124 },
  // Hall trên (y=220)
  { from:'door_G_108', to:'wp_G_top_mid', weight:608 },
  { from:'door_G_106', to:'wp_G_top_mid', weight:147 },
  { from:'door_G_104', to:'wp_G_top_mid', weight:555 },
  { from:'door_G_102', to:'door_G_104',   weight:433 },
  { from:'door_G_106', to:'door_G_108',   weight:755 },
  // Hall dưới (y=556)
  { from:'door_G_103', to:'wp_G_bot_mid', weight:583 },
  { from:'door_G_101', to:'wp_G_bot_mid', weight:559 },
  { from:'door_G_103', to:'door_G_101',   weight:1142 },
  // Nối trên-dưới
  { from:'wp_G_top_mid', to:'wp_G_bot_mid', weight:336 },
  // Cầu thang ↔ Hall
  { from:'stairs_G_mid_top', to:'wp_G_top_mid', weight:119 },
  { from:'stairs_G_mid_bot', to:'wp_G_bot_mid', weight:145 },

  // ── B11 Tầng 1: Phòng ↔ Door ────────────────────────────────
  { from:'room_1_204', to:'door_1_204', weight:125 },
  { from:'room_1_202', to:'door_1_202', weight:125 },
  { from:'room_1_217', to:'door_1_217', weight:145 },
  { from:'room_1_215', to:'door_1_215', weight:142 },
  { from:'room_1_213', to:'door_1_213', weight:142 },
  { from:'room_1_211', to:'door_1_211', weight:142 },
  { from:'room_1_209', to:'door_1_209', weight:142 },
  { from:'room_1_207', to:'door_1_207', weight:139 },
  { from:'room_1_205', to:'door_1_205', weight:139 },
  { from:'room_1_203', to:'door_1_203', weight:146 },
  { from:'room_1_201', to:'door_1_201', weight:148 },
  // Hall trên
  { from:'door_1_204', to:'wp_1_top_mid', weight:608 },
  { from:'door_1_202', to:'wp_1_top_mid', weight:580 },
  { from:'door_1_202', to:'door_1_204',   weight:1188 },
  // Hall dưới
  { from:'door_1_217', to:'door_1_215', weight:271 },
  { from:'door_1_215', to:'door_1_213', weight:189 },
  { from:'door_1_213', to:'door_1_211', weight:181 },
  { from:'door_1_211', to:'door_1_209', weight:168 },
  { from:'door_1_209', to:'wp_1_bot_mid', weight:120 },
  { from:'door_1_207', to:'wp_1_bot_mid', weight:115 },
  { from:'door_1_205', to:'door_1_207', weight:184 },
  { from:'door_1_203', to:'door_1_205', weight:274 },
  { from:'door_1_201', to:'door_1_203', weight:336 },
  // Nối trên-dưới
  { from:'wp_1_top_mid', to:'wp_1_bot_mid', weight:336 },
  { from:'stairs_1_mid_top', to:'wp_1_top_mid', weight:119 },
  { from:'stairs_1_mid_bot', to:'wp_1_bot_mid', weight:145 },

  // ── B11 Tầng 2: Phòng ↔ Door ────────────────────────────────
  { from:'room_2_202',  to:'door_2_202',  weight:125 },
  { from:'room_2_311',  to:'door_2_311',  weight:145 },
  { from:'room_2_309',  to:'door_2_309',  weight:142 },
  { from:'room_2_307',  to:'door_2_307',  weight:142 },
  { from:'room_2_305B', to:'door_2_305B', weight:148 },
  { from:'room_2_305A', to:'door_2_305A', weight:150 },
  { from:'room_2_301B', to:'door_2_301B', weight:150 },
  { from:'room_2_301A', to:'door_2_301A', weight:148 },
  // Hall trên
  { from:'door_2_202', to:'wp_2_top_mid', weight:1019 },
  // Hall dưới
  { from:'door_2_311',  to:'door_2_309',  weight:362 },
  { from:'door_2_309',  to:'door_2_307',  weight:356 },
  { from:'door_2_307',  to:'wp_2_bot_mid', weight:211 },
  { from:'door_2_305B', to:'wp_2_bot_mid', weight:115 },
  { from:'door_2_305A', to:'door_2_305B', weight:162 },
  { from:'door_2_301B', to:'door_2_305A', weight:499 },
  { from:'door_2_301A', to:'door_2_301B', weight:203 },
  // Nối trên-dưới
  { from:'wp_2_top_mid', to:'wp_2_bot_mid', weight:336 },
  { from:'stairs_2_mid_top', to:'wp_2_top_mid', weight:119 },
  { from:'stairs_2_mid_bot', to:'wp_2_bot_mid', weight:145 },

  // ── B11 Tầng 3: Phòng ↔ Door ────────────────────────────────
  { from:'room_3_402', to:'door_3_402', weight:125 },
  { from:'room_3_415', to:'door_3_415', weight:145 },
  { from:'room_3_413', to:'door_3_413', weight:142 },
  { from:'room_3_411', to:'door_3_411', weight:148 },
  { from:'room_3_409', to:'door_3_409', weight:150 },
  { from:'room_3_405', to:'door_3_405', weight:151 },
  { from:'room_3_403', to:'door_3_403', weight:150 },
  { from:'room_3_401', to:'door_3_401', weight:148 },
  // Hall trên
  { from:'door_3_402', to:'wp_3_top_mid', weight:1019 },
  // Hall dưới
  { from:'door_3_415', to:'wp_3_bot_mid', weight:751 },
  { from:'door_3_413', to:'wp_3_bot_mid', weight:211 },
  { from:'door_3_411', to:'wp_3_bot_mid', weight:115 },
  { from:'door_3_409', to:'door_3_411', weight:162 },
  { from:'door_3_405', to:'door_3_409', weight:320 },
  { from:'door_3_403', to:'door_3_405', weight:179 },
  { from:'door_3_401', to:'door_3_403', weight:203 },
  // Nối trên-dưới
  { from:'wp_3_top_mid', to:'wp_3_bot_mid', weight:336 },
  { from:'stairs_3_mid_top', to:'wp_3_top_mid', weight:119 },
  { from:'stairs_3_mid_bot', to:'wp_3_bot_mid', weight:145 },

  // ── B11 Chuyển tầng (cầu thang) ─────────────────────────────
  { from:'stairs_G_mid_top',  to:'stairs_1_mid_top',  weight:50 },
  { from:'stairs_1_mid_top',  to:'stairs_2_mid_top',  weight:50 },
  { from:'stairs_2_mid_top',  to:'stairs_3_mid_top',  weight:50 },
  { from:'stairs_G_mid_bot',  to:'stairs_1_mid_bot',  weight:50 },
  { from:'stairs_1_mid_bot',  to:'stairs_2_mid_bot',  weight:50 },
  { from:'stairs_2_mid_bot',  to:'stairs_3_mid_bot',  weight:50 },
  { from:'stairs_G_left_top', to:'stairs_1_left_top', weight:50 },
  { from:'stairs_1_left_top', to:'stairs_2_left_top', weight:50 },
  { from:'stairs_2_left_top', to:'stairs_3_left_top', weight:50 },

  // ╔══════════════════════════════════════════════════════════════╗
  // ║  B8 — EDGES                                                   ║
  // ╚══════════════════════════════════════════════════════════════╝

  // ── B8 Tầng G: Phòng ↔ Door ─────────────────────────────────
  { from:'room_bG_116',  to:'door_bG_116',  weight:126 },
  { from:'room_bG_114',  to:'door_bG_114',  weight:126 },
  { from:'room_bG_112',  to:'door_bG_112',  weight:126 },
  { from:'room_bG_110',  to:'door_bG_110',  weight:126 },
  { from:'room_bG_108',  to:'door_bG_108',  weight:126 },
  { from:'room_bG_106',  to:'door_bG_106',  weight:126 },
  { from:'room_bG_104',  to:'door_bG_104',  weight:126 },
  { from:'room_bG_102',  to:'door_bG_102',  weight:126 },
  { from:'room_bG_111',  to:'door_bG_111',  weight:124 },
  { from:'room_bG_109',  to:'door_bG_109',  weight:124 },
  { from:'room_bG_107',  to:'door_bG_107',  weight:124 },
  { from:'room_bG_105',  to:'door_bG_105',  weight:124 },
  { from:'room_bG_103',  to:'door_bG_103',  weight:124 },
  { from:'room_bG_102b', to:'door_bG_102b', weight:124 },
  // Hall trên — nối liên tiếp
  { from:'door_bG_116', to:'door_bG_114',   weight:575 },
  { from:'door_bG_114', to:'wp_bG_top_mid', weight:340 },
  { from:'door_bG_112', to:'wp_bG_top_mid', weight:107 },
  { from:'door_bG_110', to:'wp_bG_top_mid', weight:250 },
  { from:'door_bG_108', to:'door_bG_110',   weight:176 },
  { from:'door_bG_106', to:'door_bG_108',   weight:198 },
  { from:'door_bG_104', to:'door_bG_106',   weight:197 },
  { from:'door_bG_102', to:'door_bG_104',   weight:197 },
  // Hall dưới — nối liên tiếp
  { from:'door_bG_111', to:'door_bG_109',   weight:541 },
  { from:'door_bG_109', to:'wp_bG_bot_mid', weight:278 },
  { from:'door_bG_107', to:'wp_bG_bot_mid', weight:168 },
  { from:'door_bG_105', to:'door_bG_107',   weight:241 },
  { from:'door_bG_103', to:'door_bG_105',   weight:254 },
  { from:'door_bG_102b', to:'door_bG_103',  weight:273 },
  // Nối trên-dưới
  { from:'wp_bG_top_mid', to:'wp_bG_bot_mid', weight:336 },
  { from:'stairs_bG_mid_top', to:'wp_bG_top_mid', weight:126 },
  { from:'stairs_bG_mid_bot', to:'wp_bG_bot_mid', weight:124 },

  // ── B8 Tầng 1: Phòng ↔ Door ─────────────────────────────────
  { from:'room_b1_202', to:'door_b1_202', weight:124 },
  { from:'room_b1_217', to:'door_b1_217', weight:126 },
  { from:'room_b1_215', to:'door_b1_215', weight:126 },
  { from:'room_b1_207', to:'door_b1_207', weight:122 },
  { from:'room_b1_205', to:'door_b1_205', weight:122 },
  { from:'room_b1_203', to:'door_b1_203', weight:122 },
  { from:'room_b1_201', to:'door_b1_201', weight:122 },
  // Hall trên
  { from:'door_b1_202', to:'wp_b1_top_mid', weight:1018 },
  // Hall dưới
  { from:'door_b1_217', to:'door_b1_215', weight:317 },
  { from:'door_b1_215', to:'wp_b1_bot_mid', weight:140 },
  { from:'door_b1_207', to:'wp_b1_bot_mid', weight:569 },
  { from:'door_b1_205', to:'door_b1_207',   weight:134 },
  { from:'door_b1_203', to:'door_b1_205',   weight:141 },
  { from:'door_b1_201', to:'door_b1_203',   weight:153 },
  // Nối trên-dưới
  { from:'wp_b1_top_mid', to:'wp_b1_bot_mid', weight:336 },
  { from:'stairs_b1_mid_top', to:'wp_b1_top_mid', weight:126 },
  { from:'stairs_b1_mid_bot', to:'wp_b1_bot_mid', weight:124 },

  // ── B8 Tầng 2: Phòng ↔ Door ─────────────────────────────────
  { from:'room_b2_302', to:'door_b2_302', weight:124 },
  { from:'room_b2_311', to:'door_b2_311', weight:126 },
  { from:'room_b2_309', to:'door_b2_309', weight:126 },
  { from:'room_b2_307', to:'door_b2_307', weight:122 },
  { from:'room_b2_305', to:'door_b2_305', weight:122 },
  { from:'room_b2_303', to:'door_b2_303', weight:122 },
  { from:'room_b2_301', to:'door_b2_301', weight:122 },
  // Hall trên
  { from:'door_b2_302', to:'wp_b2_top_mid', weight:1018 },
  // Hall dưới
  { from:'door_b2_311', to:'door_b2_309',   weight:560 },
  { from:'door_b2_309', to:'wp_b2_bot_mid', weight:247 },
  { from:'door_b2_307', to:'wp_b2_bot_mid', weight:179 },
  { from:'door_b2_305', to:'door_b2_307',   weight:273 },
  { from:'door_b2_303', to:'door_b2_305',   weight:302 },
  { from:'door_b2_301', to:'door_b2_303',   weight:243 },
  // Nối trên-dưới
  { from:'wp_b2_top_mid', to:'wp_b2_bot_mid', weight:336 },
  { from:'stairs_b2_mid_top', to:'wp_b2_top_mid', weight:126 },
  { from:'stairs_b2_mid_bot', to:'wp_b2_bot_mid', weight:124 },

  // ── B8 Tầng 3: Phòng ↔ Door ─────────────────────────────────
  { from:'room_b3_402', to:'door_b3_402', weight:124 },
  { from:'room_b3_419', to:'door_b3_419', weight:126 },
  { from:'room_b3_417', to:'door_b3_417', weight:126 },
  { from:'room_b3_415', to:'door_b3_415', weight:126 },
  { from:'room_b3_413', to:'door_b3_413', weight:126 },
  { from:'room_b3_407', to:'door_b3_407', weight:122 },
  { from:'room_b3_405', to:'door_b3_405', weight:122 },
  { from:'room_b3_403', to:'door_b3_403', weight:122 },
  { from:'room_b3_401', to:'door_b3_401', weight:122 },
  // Hall trên
  { from:'door_b3_402', to:'wp_b3_top_mid', weight:1018 },
  // Hall dưới
  { from:'door_b3_419', to:'door_b3_417',   weight:262 },
  { from:'door_b3_417', to:'door_b3_415',   weight:273 },
  { from:'door_b3_415', to:'door_b3_413',   weight:278 },
  { from:'door_b3_413', to:'wp_b3_bot_mid', weight:172 },
  { from:'door_b3_407', to:'wp_b3_bot_mid', weight:416 },
  { from:'door_b3_405', to:'door_b3_407',   weight:205 },
  { from:'door_b3_403', to:'door_b3_405',   weight:227 },
  { from:'door_b3_401', to:'door_b3_403',   weight:181 },
  // Nối trên-dưới
  { from:'wp_b3_top_mid', to:'wp_b3_bot_mid', weight:336 },
  { from:'stairs_b3_mid_top', to:'wp_b3_top_mid', weight:126 },
  { from:'stairs_b3_mid_bot', to:'wp_b3_bot_mid', weight:124 },

  // ── B8 Chuyển tầng ───────────────────────────────────────────
  { from:'stairs_bG_mid_top', to:'stairs_b1_mid_top', weight:50 },
  { from:'stairs_b1_mid_top', to:'stairs_b2_mid_top', weight:50 },
  { from:'stairs_b2_mid_top', to:'stairs_b3_mid_top', weight:50 },
  { from:'stairs_bG_mid_bot', to:'stairs_b1_mid_bot', weight:50 },
  { from:'stairs_b1_mid_bot', to:'stairs_b2_mid_bot', weight:50 },
  { from:'stairs_b2_mid_bot', to:'stairs_b3_mid_bot', weight:50 },
  { from:'stairs_bG_left_top', to:'stairs_b1_left_top', weight:50 },
  { from:'stairs_b1_left_top', to:'stairs_b2_left_top', weight:50 },
  { from:'stairs_b2_left_top', to:'stairs_b3_left_top', weight:50 },
];
