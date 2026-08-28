/**
 * floorGeometry.ts
 *
 * Dữ liệu hình học (x, y, w, h) của các phần tử trên sơ đồ tầng,
 * trích xuất từ file SVG gốc.
 *
 * Dùng bởi IndoorFloorDecoLayer để vẽ lại toàn bộ bản đồ
 * theo phong cách "Clean Light Blueprint".
 */

export type ShapeType = 'room' | 'hall' | 'stairs' | 'elevator' | 'wc';

export interface FloorShape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;       // Nhãn hiển thị (VD: "108", "WC")
}

export type FloorGeometryMap = Record<string, Record<string, FloorShape[]>>;


const B8_1: FloorShape[] = [
  { id: '202_top', type: 'room', x: 2315, y: 6, w: 198, h: 184, label: '202' },
  { id: '204_top', type: 'room', x: 2119, y: 6, w: 196, h: 184, label: '204' },
  { id: '206_top', type: 'room', x: 1921, y: 6, w: 198, h: 184, label: '206' },
  { id: '208_top', type: 'room', x: 1723, y: 6, w: 198, h: 184, label: '208' },
  { id: '210_top', type: 'room', x: 1570, y: 6, w: 153, h: 184, label: '210' },
  { id: '212_top', type: 'room', x: 1437, y: 6, w: 133, h: 184, label: '212' },
  { id: '214_top', type: 'room', x: 1075, y: 6, w: 278, h: 184, label: '214' },
  { id: '216_top', type: 'room', x: 797, y: 6, w: 278, h: 184, label: '216' },
  { id: '218_top', type: 'room', x: 519, y: 6, w: 278, h: 184, label: '218' },
  { id: '220_top', type: 'room', x: 209, y: 6, w: 310, h: 184, label: '220' },
  { id: '201_bot', type: 'room', x: 2316, y: 579, w: 154, h: 203, label: '201' },
  { id: '203_bot', type: 'room', x: 2163, y: 579, w: 155, h: 203, label: '203' },
  { id: '205_bot', type: 'room', x: 2035, y: 579, w: 128, h: 203, label: '205' },
  { id: '207_bot', type: 'room', x: 1895, y: 579, w: 140, h: 203, label: '207' },
  { id: '209_bot', type: 'room', x: 1741, y: 579, w: 154, h: 203, label: '209' },
  { id: '211_bot', type: 'room', x: 1594, y: 579, w: 147, h: 203, label: '211' },
  { id: '213_bot', type: 'room', x: 1439, y: 579, w: 155, h: 203, label: '213' },
  { id: '215_bot', type: 'room', x: 1118, y: 583, w: 276, h: 203, label: '215' },
  { id: '217_bot', type: 'room', x: 761, y: 583, w: 357, h: 203, label: '217' },
  { id: '219_bot', type: 'room', x: 548, y: 583, w: 213, h: 203, label: '219' },
  { id: '221_bot', type: 'room', x: 273, y: 583, w: 275, h: 203, label: '221' },
  { id: 'hall', type: 'hall', x: 109, y: 190, w: 2748, h: 64 },
  { id: 'hall_2', type: 'hall', x: 187, y: 190, w: 252, h: 395 },
  { id: 'hall_3', type: 'hall', x: 187, y: 190, w: 86, h: 385 },
  { id: 'hall_4', type: 'hall', x: 187, y: 531, w: 2284, h: 54 },
  { id: 'hall_5', type: 'hall', x: 2415, y: 190, w: 60, h: 399 },
  { id: 'hall_6', type: 'hall', x: 1353, y: 190, w: 86, h: 393 },
  { id: 'WC_1', type: 'wc', x: 2513, y: 4, w: 344, h: 186 },
  { id: 'WC_2', type: 'wc', x: 0, y: 613, w: 190, h: 173 },
  { id: 'stairs_right_last', type: 'stairs', x: 109, y: 4, w: 100, h: 186 },
  { id: 'stairs_left_last', type: 'stairs', x: 187, y: 583, w: 86, h: 203 },
  { id: 'stairs_right', type: 'stairs', x: 1353, y: 6, w: 86, h: 184 },
  { id: 'stairs_left', type: 'stairs', x: 1353, y: 583, w: 86, h: 203 },
  { id: 'stairs_first', type: 'stairs', x: 2280, y: 344, w: 135, h: 99 },
  { id: 'elevator', type: 'elevator', x: 1439, y: 361, w: 72, h: 53 },
];

const B8_2: FloorShape[] = [
  { id: '302_top', type: 'room', x: 2315, y: 6, w: 198, h: 184, label: '302' },
  { id: '304_top', type: 'room', x: 2119, y: 6, w: 196, h: 184, label: '304' },
  { id: '306_top', type: 'room', x: 1921, y: 6, w: 198, h: 184, label: '306' },
  { id: '308_top', type: 'room', x: 1723, y: 6, w: 198, h: 184, label: '308' },
  { id: '310_top', type: 'room', x: 1570, y: 6, w: 153, h: 184, label: '310' },
  { id: '312_top', type: 'room', x: 1437, y: 6, w: 133, h: 184, label: '312' },
  { id: '314_top', type: 'room', x: 1075, y: 6, w: 278, h: 184, label: '314' },
  { id: '316_top', type: 'room', x: 797, y: 6, w: 278, h: 184, label: '316' },
  { id: '318_top', type: 'room', x: 519, y: 6, w: 278, h: 184, label: '318' },
  { id: '320_top', type: 'room', x: 209, y: 6, w: 310, h: 184, label: '320' },
  { id: '301_bot', type: 'room', x: 2316, y: 579, w: 154, h: 203, label: '301' },
  { id: '303_bot', type: 'room', x: 1985, y: 579, w: 331, h: 203, label: '303' },
  { id: '305_bot', type: 'room', x: 1712, y: 579, w: 273, h: 203, label: '305' },
  { id: '307_bot', type: 'room', x: 1439, y: 579, w: 273, h: 203, label: '307' },
  { id: '309_bot', type: 'room', x: 905, y: 583, w: 489, h: 203, label: '309' },
  { id: '311_bot', type: 'room', x: 273, y: 583, w: 632, h: 203, label: '311' },
  { id: 'hall', type: 'hall', x: 109, y: 190, w: 2748, h: 64 },
  { id: 'hall_2', type: 'hall', x: 187, y: 190, w: 252, h: 395 },
  { id: 'hall_3', type: 'hall', x: 187, y: 190, w: 86, h: 385 },
  { id: 'hall_4', type: 'hall', x: 187, y: 531, w: 2284, h: 54 },
  { id: 'hall_5', type: 'hall', x: 2415, y: 190, w: 60, h: 399 },
  { id: 'hall_6', type: 'hall', x: 1353, y: 190, w: 86, h: 393 },
  { id: 'WC_1', type: 'wc', x: 2513, y: 4, w: 344, h: 186 },
  { id: 'WC_2', type: 'wc', x: 0, y: 613, w: 190, h: 173 },
  { id: 'stairs_right_last', type: 'stairs', x: 109, y: 4, w: 100, h: 186 },
  { id: 'stairs_left_last', type: 'stairs', x: 187, y: 583, w: 86, h: 203 },
  { id: 'stairs_right', type: 'stairs', x: 1353, y: 6, w: 86, h: 184 },
  { id: 'stairs_left', type: 'stairs', x: 1353, y: 583, w: 86, h: 203 },
  { id: 'stairs_first', type: 'stairs', x: 2280, y: 344, w: 135, h: 99 },
  { id: 'elevator', type: 'elevator', x: 1439, y: 361, w: 72, h: 53 },
];

const B8_3: FloorShape[] = [
  { id: '402_top', type: 'room', x: 2315, y: 6, w: 198, h: 184, label: '402' },
  { id: '404_top', type: 'room', x: 2119, y: 6, w: 196, h: 184, label: '404' },
  { id: '406_top', type: 'room', x: 1921, y: 6, w: 198, h: 184, label: '406' },
  { id: '408_top', type: 'room', x: 1723, y: 6, w: 198, h: 184, label: '408' },
  { id: '410_top', type: 'room', x: 1570, y: 6, w: 153, h: 184, label: '410' },
  { id: '412_top', type: 'room', x: 1437, y: 6, w: 133, h: 184, label: '412' },
  { id: '414_top', type: 'room', x: 1075, y: 6, w: 278, h: 184, label: '414' },
  { id: '416_top', type: 'room', x: 797, y: 6, w: 278, h: 184, label: '416' },
  { id: '418_top', type: 'room', x: 519, y: 6, w: 278, h: 184, label: '418' },
  { id: '420_top', type: 'room', x: 209, y: 6, w: 310, h: 184, label: '420' },
  { id: '401_bot', type: 'room', x: 2368, y: 583, w: 115, h: 203, label: '401' },
  { id: '403_bot', type: 'room', x: 2120, y: 583, w: 248, h: 203, label: '403' },
  { id: '405_bot', type: 'room', x: 1915, y: 583, w: 205, h: 203, label: '405' },
  { id: '407_bot', type: 'room', x: 1710, y: 583, w: 205, h: 203, label: '407' },
  { id: '409_bot', type: 'room', x: 1567, y: 583, w: 143, h: 203, label: '409' },
  { id: '411_bot', type: 'room', x: 1424, y: 583, w: 143, h: 203, label: '411' },
  { id: '413_bot', type: 'room', x: 1096, y: 583, w: 257, h: 203, label: '413' },
  { id: '415_bot', type: 'room', x: 797, y: 583, w: 299, h: 203, label: '415' },
  { id: '417_bot', type: 'room', x: 550, y: 583, w: 247, h: 203, label: '417' },
  { id: '419_bot', type: 'room', x: 273, y: 583, w: 277, h: 203, label: '419' },
  { id: 'hall', type: 'hall', x: 109, y: 190, w: 2748, h: 64 },
  { id: 'hall_2', type: 'hall', x: 187, y: 190, w: 252, h: 395 },
  { id: 'hall_3', type: 'hall', x: 187, y: 190, w: 86, h: 385 },
  { id: 'hall_4', type: 'hall', x: 187, y: 531, w: 2284, h: 54 },
  { id: 'hall_5', type: 'hall', x: 2415, y: 190, w: 60, h: 399 },
  { id: 'hall_6', type: 'hall', x: 1353, y: 190, w: 86, h: 393 },
  { id: 'WC_1', type: 'wc', x: 2513, y: 4, w: 344, h: 186 },
  { id: 'WC_2', type: 'wc', x: 0, y: 613, w: 190, h: 173 },
  { id: 'stairs_right_last', type: 'stairs', x: 109, y: 4, w: 100, h: 186 },
  { id: 'stairs_left_last', type: 'stairs', x: 187, y: 583, w: 86, h: 203 },
  { id: 'stairs_right', type: 'stairs', x: 1353, y: 6, w: 86, h: 184 },
  { id: 'stairs_left', type: 'stairs', x: 1353, y: 583, w: 86, h: 203 },
  { id: 'stairs_first', type: 'stairs', x: 2280, y: 344, w: 135, h: 99 },
  { id: 'elevator', type: 'elevator', x: 1439, y: 361, w: 72, h: 53 },
];

const B8_G: FloorShape[] = [
  { id: '102_top', type: 'room', x: 2315, y: 4, w: 198, h: 184, label: '102' },
  { id: '104_top', type: 'room', x: 2119, y: 4, w: 196, h: 184, label: '104' },
  { id: '106_top', type: 'room', x: 1921, y: 4, w: 198, h: 184, label: '106' },
  { id: '108_top', type: 'room', x: 1723, y: 4, w: 198, h: 184, label: '108' },
  { id: '110_top', type: 'room', x: 1570, y: 4, w: 153, h: 184, label: '110' },
  { id: '112_top', type: 'room', x: 1437, y: 4, w: 133, h: 184, label: '112' },
  { id: '114_top', type: 'room', x: 759, y: 4, w: 594, h: 184, label: '114' },
  { id: '116_top', type: 'room', x: 203, y: 4, w: 556, h: 184, label: '116' },
  { id: '102_bot', type: 'room', x: 2194, y: 581, w: 277, h: 203, label: '102' },
  { id: '103_bot', type: 'room', x: 1921, y: 581, w: 277, h: 203, label: '103' },
  { id: '105_bot', type: 'room', x: 1690, y: 581, w: 231, h: 203, label: '105' },
  { id: '107_bot', type: 'room', x: 1439, y: 581, w: 251, h: 203, label: '107' },
  { id: '109_bot', type: 'room', x: 882, y: 581, w: 473, h: 203, label: '109' },
  { id: '111_bot', type: 'room', x: 273, y: 581, w: 609, h: 203, label: '111' },
  { id: 'hall', type: 'hall', x: 109, y: 188, w: 2748, h: 64 },
  { id: 'hall_2', type: 'hall', x: 187, y: 188, w: 252, h: 395 },
  { id: 'hall_3', type: 'hall', x: 187, y: 188, w: 86, h: 385 },
  { id: 'hall_4', type: 'hall', x: 187, y: 529, w: 2284, h: 54 },
  { id: 'hall_5', type: 'hall', x: 2415, y: 188, w: 60, h: 399 },
  { id: 'hall_6', type: 'hall', x: 1353, y: 188, w: 86, h: 393 },
  { id: 'WC_1', type: 'wc', x: 2513, y: 2, w: 344, h: 186 },
  { id: 'WC_2', type: 'wc', x: 0, y: 611, w: 190, h: 173 },
  { id: 'stairs_right_last', type: 'stairs', x: 109, y: 2, w: 100, h: 186 },
  { id: 'stairs_left_last', type: 'stairs', x: 187, y: 581, w: 86, h: 203 },
  { id: 'stairs_right', type: 'stairs', x: 1353, y: 4, w: 86, h: 184 },
  { id: 'stairs_left', type: 'stairs', x: 1353, y: 581, w: 86, h: 203 },
  { id: 'stairs_first', type: 'stairs', x: 2280, y: 342, w: 135, h: 99 },
  { id: 'elevator', type: 'elevator', x: 1439, y: 359, w: 72, h: 53 },
];

const B10_1: FloorShape[] = [
  { id: '211_top', type: 'room', x: 2247, y: 23, w: 346, h: 198, label: '211' },
  { id: '209_top', type: 'room', x: 1869, y: 18, w: 378, h: 200, label: '209' },
  { id: '207_top', type: 'room', x: 1534, y: 14, w: 335, h: 199, label: '207' },
  { id: '205_top', type: 'room', x: 1085, y: 11, w: 354, h: 197, label: '205' },
  { id: '203_top', type: 'room', x: 734, y: 8, w: 351, h: 197, label: '203' },
  { id: '201_top', type: 'room', x: 388, y: 4, w: 347, h: 197, label: '201' },
  { id: '224_bot', type: 'room', x: 2476, y: 616, w: 167, h: 186, label: '224' },
  { id: '222_bot', type: 'room', x: 2294, y: 615, w: 182, h: 186, label: '222' },
  { id: '220_bot', type: 'room', x: 2096, y: 614, w: 201, h: 187, label: '220' },
  { id: '218_bot', type: 'room', x: 1900, y: 610, w: 196, h: 186, label: '218' },
  { id: '216_bot', type: 'room', x: 1702, y: 610, w: 196, h: 186, label: '216' },
  { id: '214_bot', type: 'room', x: 1504, y: 608, w: 196, h: 186, label: '214' },
  { id: '212_bot', type: 'room', x: 1271, y: 602, w: 147, h: 185, label: '212' },
  { id: '210_bot', type: 'room', x: 1134, y: 599, w: 137, h: 186, label: '210' },
  { id: '208_bot', type: 'room', x: 936, y: 600, w: 196, h: 186, label: '208' },
  { id: '206_bot', type: 'room', x: 740, y: 595, w: 196, h: 186, label: '206' },
  { id: '204_bot', type: 'room', x: 542, y: 595, w: 196, h: 186, label: '204' },
  { id: '202_bot', type: 'room', x: 344, y: 593, w: 196, h: 186, label: '202' },
  { id: 'hall', type: 'hall', x: 2, y: 555, w: 2894, h: 64 },
  { id: 'hall_2', type: 'hall', x: 2601, y: 222, w: 71, h: 395 },
  { id: 'hall_3', type: 'hall', x: 392, y: 222, w: 2284, h: 54 },
  { id: 'hall_4', type: 'hall', x: 384, y: 196, w: 60, h: 396 },
  { id: 'hall_5', type: 'hall', x: 1420, y: 209, w: 86, h: 395 },
  { id: 'WC_1', type: 'wc', x: 0, y: 591, w: 344, h: 186 },
  { id: 'WC_2', type: 'wc', x: 2729, y: 619, w: 166, h: 177 },
  { id: 'stairs_right_last', type: 'stairs', x: 2643, y: 617, w: 86, h: 186 },
  { id: 'stairs_left_last', type: 'stairs', x: 2593, y: 23, w: 83, h: 198 },
  { id: 'stairs_right', type: 'stairs', x: 1418, y: 604, w: 86, h: 189 },
  { id: 'stairs_left', type: 'stairs', x: 1439, y: 9, w: 93, h: 200 },
  { id: 'stairs_first', type: 'stairs', x: 446, y: 341, w: 135, h: 99 },
  { id: 'elevator', type: 'elevator', x: 1350, y: 379, w: 72, h: 53 },
];

const B10_2: FloorShape[] = [
  { id: '311_top', type: 'room', x: 2352, y: 24, w: 244, h: 202, label: '311' },
  { id: '309_top', type: 'room', x: 2084, y: 19, w: 268, h: 202, label: '309' },
  { id: '307_top', type: 'room', x: 1792, y: 14, w: 293, h: 204, label: '307' },
  { id: '305_top', type: 'room', x: 1534, y: 10, w: 260, h: 202, label: '305' },
  { id: '303_top', type: 'room', x: 899, y: 11, w: 540, h: 197, label: '303' },
  { id: '301_top', type: 'room', x: 388, y: 6, w: 506, h: 197, label: '301' },
  { id: '324_bot', type: 'room', x: 2476, y: 616, w: 167, h: 186, label: '324' },
  { id: '322_bot', type: 'room', x: 2294, y: 615, w: 182, h: 186, label: '322' },
  { id: '320_bot', type: 'room', x: 2096, y: 614, w: 201, h: 187, label: '320' },
  { id: '318_bot', type: 'room', x: 1900, y: 610, w: 196, h: 186, label: '318' },
  { id: '316_bot', type: 'room', x: 1702, y: 610, w: 196, h: 186, label: '316' },
  { id: '314_bot', type: 'room', x: 1504, y: 608, w: 196, h: 186, label: '314' },
  { id: '312_bot', type: 'room', x: 1271, y: 602, w: 147, h: 185, label: '312' },
  { id: '310_bot', type: 'room', x: 1134, y: 599, w: 137, h: 186, label: '310' },
  { id: '308_bot', type: 'room', x: 936, y: 600, w: 196, h: 186, label: '308' },
  { id: '306_bot', type: 'room', x: 740, y: 595, w: 196, h: 186, label: '306' },
  { id: '304_bot', type: 'room', x: 542, y: 595, w: 196, h: 186, label: '304' },
  { id: '302_bot', type: 'room', x: 344, y: 593, w: 196, h: 186, label: '302' },
  { id: 'hall', type: 'hall', x: 2, y: 555, w: 2894, h: 64 },
  { id: 'hall_2', type: 'hall', x: 2601, y: 222, w: 71, h: 395 },
  { id: 'hall_3', type: 'hall', x: 392, y: 222, w: 2284, h: 54 },
  { id: 'hall_4', type: 'hall', x: 384, y: 196, w: 60, h: 396 },
  { id: 'hall_5', type: 'hall', x: 1420, y: 209, w: 86, h: 395 },
  { id: 'WC_1', type: 'wc', x: 0, y: 591, w: 344, h: 186 },
  { id: 'WC_2', type: 'wc', x: 2729, y: 619, w: 166, h: 177 },
  { id: 'stairs_right_last', type: 'stairs', x: 2643, y: 617, w: 86, h: 186 },
  { id: 'stairs_left_last', type: 'stairs', x: 2593, y: 23, w: 83, h: 198 },
  { id: 'stairs_right', type: 'stairs', x: 1418, y: 604, w: 86, h: 189 },
  { id: 'stairs_left', type: 'stairs', x: 1439, y: 9, w: 93, h: 200 },
  { id: 'stairs_first', type: 'stairs', x: 446, y: 341, w: 135, h: 99 },
  { id: 'elevator', type: 'elevator', x: 1350, y: 379, w: 72, h: 53 },
];

const B10_3: FloorShape[] = [
  { id: '423_top', type: 'room', x: 2436, y: 21, w: 157, h: 201, label: '423' },
  { id: '421_top', type: 'room', x: 2299, y: 18, w: 139, h: 202, label: '421' },
  { id: '419_top', type: 'room', x: 2101, y: 18, w: 198, h: 203, label: '419' },
  { id: '417_top', type: 'room', x: 1905, y: 13, w: 198, h: 203, label: '417' },
  { id: '415_top', type: 'room', x: 1707, y: 13, w: 198, h: 203, label: '415' },
  { id: '413_top', type: 'room', x: 1535, y: 11, w: 172, h: 203, label: '413' },
  { id: '411_top', type: 'room', x: 1290, y: 10, w: 149, h: 201, label: '411' },
  { id: '409_top', type: 'room', x: 1153, y: 7, w: 139, h: 202, label: '409' },
  { id: '407_top', type: 'room', x: 955, y: 7, w: 198, h: 203, label: '407' },
  { id: '405_top', type: 'room', x: 759, y: 2, w: 198, h: 203, label: '405' },
  { id: '403_top', type: 'room', x: 561, y: 2, w: 198, h: 203, label: '403' },
  { id: '401_top', type: 'room', x: 389, y: 0, w: 172, h: 203, label: '401' },
  { id: '424_bot', type: 'room', x: 2476, y: 619, w: 167, h: 186, label: '424' },
  { id: '422_bot', type: 'room', x: 2294, y: 618, w: 182, h: 186, label: '422' },
  { id: '420_bot', type: 'room', x: 2096, y: 617, w: 201, h: 187, label: '420' },
  { id: '418_bot', type: 'room', x: 1900, y: 613, w: 196, h: 186, label: '418' },
  { id: '416_bot', type: 'room', x: 1702, y: 613, w: 196, h: 186, label: '416' },
  { id: '414_bot', type: 'room', x: 1504, y: 611, w: 196, h: 186, label: '414' },
  { id: '412_bot', type: 'room', x: 1271, y: 605, w: 147, h: 185, label: '412' },
  { id: '410_bot', type: 'room', x: 1134, y: 602, w: 137, h: 186, label: '410' },
  { id: '408_bot', type: 'room', x: 936, y: 603, w: 196, h: 186, label: '408' },
  { id: '406_bot', type: 'room', x: 740, y: 598, w: 196, h: 186, label: '406' },
  { id: '404_bot', type: 'room', x: 542, y: 598, w: 196, h: 186, label: '404' },
  { id: '402_bot', type: 'room', x: 344, y: 596, w: 196, h: 186, label: '402' },
  { id: 'hall', type: 'hall', x: 2, y: 558, w: 2894, h: 64 },
  { id: 'hall_2', type: 'hall', x: 2601, y: 225, w: 71, h: 395 },
  { id: 'hall_3', type: 'hall', x: 392, y: 225, w: 2284, h: 54 },
  { id: 'hall_4', type: 'hall', x: 384, y: 199, w: 60, h: 396 },
  { id: 'hall_5', type: 'hall', x: 1420, y: 212, w: 86, h: 395 },
  { id: 'WC_1', type: 'wc', x: 0, y: 594, w: 344, h: 186 },
  { id: 'WC_2', type: 'wc', x: 2729, y: 622, w: 166, h: 177 },
  { id: 'stairs_right_last', type: 'stairs', x: 2643, y: 620, w: 86, h: 186 },
  { id: 'stairs_left_last', type: 'stairs', x: 2593, y: 26, w: 83, h: 198 },
  { id: 'stairs_right', type: 'stairs', x: 1418, y: 607, w: 86, h: 189 },
  { id: 'stairs_left', type: 'stairs', x: 1439, y: 12, w: 93, h: 200 },
  { id: 'stairs_first', type: 'stairs', x: 446, y: 344, w: 135, h: 99 },
  { id: 'elevator', type: 'elevator', x: 1350, y: 382, w: 72, h: 53 },
];

const B10_G: FloorShape[] = [
  { id: '103_top', type: 'room', x: 1504, y: 0, w: 1080, h: 191, label: '103' },
  { id: '101_top', type: 'room', x: 386, y: 0, w: 1032, h: 191, label: '101' },
  { id: '108_bot', type: 'room', x: 2436, y: 586, w: 232, h: 186, label: '108' },
  { id: '106_bot', type: 'room', x: 1504, y: 585, w: 934, h: 186, label: '106' },
  { id: '104_bot', type: 'room', x: 1293, y: 585, w: 125, h: 186, label: '104' },
  { id: '102_bot', type: 'room', x: 344, y: 585, w: 949, h: 186, label: '102' },
  { id: 'hall', type: 'hall', x: 2418, y: 191, w: 268, h: 395 },
  { id: 'hall_2', type: 'hall', x: 0, y: 522, w: 2894, h: 64 },
  { id: 'hall_3', type: 'hall', x: 2599, y: 186, w: 71, h: 399 },
  { id: 'hall_4', type: 'hall', x: 386, y: 191, w: 2284, h: 54 },
  { id: 'hall_5', type: 'hall', x: 382, y: 186, w: 60, h: 399 },
  { id: 'hall_6', type: 'hall', x: 1418, y: 191, w: 86, h: 395 },
  { id: 'WC_1', type: 'wc', x: 0, y: 585, w: 344, h: 186 },
  { id: 'WC_2', type: 'wc', x: 2743, y: 586, w: 151, h: 186 },
  { id: 'stairs_right_last', type: 'stairs', x: 2670, y: 586, w: 73, h: 186 },
  { id: 'stairs_left_last', type: 'stairs', x: 2584, y: 0, w: 102, h: 191 },
  { id: 'stairs_right', type: 'stairs', x: 1418, y: 585, w: 86, h: 184 },
  { id: 'stairs_left', type: 'stairs', x: 1418, y: 0, w: 86, h: 191 },
  { id: 'stairs_first', type: 'stairs', x: 442, y: 332, w: 135, h: 99 },
  { id: 'elevator', type: 'elevator', x: 1346, y: 361, w: 72, h: 53 },
];


// ================================================================
// TÒA B11
// ================================================================

const B11_G: FloorShape[] = [
  // Hành lang
  { id: 'hall_2', type: 'hall', x: 39, y: 188, w: 2894, h: 64, label: '' },   // hành lang ngang trên
  { id: 'hall_4', type: 'hall', x: 263, y: 529, w: 2284, h: 54, label: '' },   // hành lang ngang dưới
  { id: 'hall_3', type: 'hall', x: 263, y: 188, w: 71, h: 426, label: '' },   // hành lang dọc trái
  { id: 'hall_5', type: 'hall', x: 2491, y: 188, w: 60, h: 399, label: '' },   // hành lang dọc phải
  { id: 'hall_6', type: 'hall', x: 1429, y: 188, w: 86, h: 426, label: '' },   // hành lang dọc giữa
  { id: 'hall', type: 'hall', x: 247, y: 188, w: 268, h: 395, label: '' },   // khu vực trái
  // Phòng
  { id: '108', type: 'room', x: 300, y: 2, w: 1129, h: 186, label: '108' },
  { id: '104', type: 'room', x: 1724, y: 2, w: 607, h: 186, label: '104' },
  { id: '102', type: 'room', x: 2331, y: 2, w: 258, h: 186, label: '102' },
  { id: '106', type: 'room', x: 1515, y: 4, w: 209, h: 184, label: '106' },
  { id: '103', type: 'room', x: 349, y: 587, w: 1080, h: 186, label: '103' },
  { id: '101', type: 'room', x: 1515, y: 587, w: 1032, h: 186, label: '101' },
  // WC
  { id: 'wc_1', type: 'wc', x: 2589, y: 2, w: 344, h: 186, label: 'WC' },
  { id: 'wc_2', type: 'wc', x: 0, y: 2, w: 190, h: 186, label: 'WC' },
  // Cầu thang
  { id: 'st_1', type: 'stairs', x: 204, y: 2, w: 86, h: 174, label: '' },
  { id: 'st_2', type: 'stairs', x: 263, y: 623, w: 86, h: 174, label: '' },
  { id: 'st_3', type: 'stairs', x: 1429, y: 14, w: 86, h: 174, label: '' },
  { id: 'st_4', type: 'stairs', x: 1429, y: 614, w: 86, h: 174, label: '' },
  { id: 'st_5', type: 'stairs', x: 2356, y: 342, w: 135, h: 99, label: '' },
  // Thang máy
  { id: 'elev', type: 'elevator', x: 1515, y: 359, w: 72, h: 53, label: '' },
];

const B11_1: FloorShape[] = [
  // Hành lang (giống tầng G)
  { id: 'hall_2', type: 'hall', x: 39, y: 188, w: 2894, h: 64 },
  { id: 'hall_4', type: 'hall', x: 263, y: 529, w: 2284, h: 54 },
  { id: 'hall_3', type: 'hall', x: 263, y: 188, w: 71, h: 426 },
  { id: 'hall_5', type: 'hall', x: 2491, y: 188, w: 60, h: 399 },
  { id: 'hall_6', type: 'hall', x: 1429, y: 188, w: 86, h: 426 },
  { id: 'hall', type: 'hall', x: 247, y: 188, w: 268, h: 395 },
  // Phòng
  { id: '204', type: 'room', x: 300, y: 2, w: 1129, h: 186, label: '204' },
  { id: '202', type: 'room', x: 1515, y: 2, w: 1074, h: 186, label: '202' },
  { id: '217', type: 'room', x: 370, y: 600, w: 346, h: 203, label: '217' },
  { id: '215', type: 'room', x: 716, y: 597, w: 197, h: 203, label: '215' },
  { id: '213', type: 'room', x: 913, y: 597, w: 181, h: 203, label: '213' },
  { id: '211', type: 'room', x: 1094, y: 597, w: 181, h: 203, label: '211' },
  { id: '209', type: 'room', x: 1275, y: 597, w: 154, h: 203, label: '209' },
  { id: '207', type: 'room', x: 1505, y: 594, w: 165, h: 203, label: '207' },
  { id: '205', type: 'room', x: 1666, y: 594, w: 210, h: 203, label: '205' },
  { id: '203', type: 'room', x: 1876, y: 595, w: 339, h: 215, label: '203' },
  { id: '201', type: 'room', x: 2215, y: 597, w: 332, h: 215, label: '201' },
  // WC
  { id: 'wc_1', type: 'wc', x: 2589, y: 2, w: 344, h: 186, label: 'WC' },
  { id: 'wc_2', type: 'wc', x: 0, y: 2, w: 190, h: 186, label: 'WC' },
  // Cầu thang
  { id: 'st_1', type: 'stairs', x: 204, y: 2, w: 86, h: 174 },
  { id: 'st_2', type: 'stairs', x: 263, y: 623, w: 86, h: 174 },
  { id: 'st_3', type: 'stairs', x: 1429, y: 14, w: 86, h: 174 },
  { id: 'st_4', type: 'stairs', x: 1429, y: 614, w: 86, h: 174 },
  { id: 'st_5', type: 'stairs', x: 2356, y: 342, w: 135, h: 99 },
  // Thang máy
  { id: 'elev', type: 'elevator', x: 1515, y: 359, w: 72, h: 53 },
];

// Tầng 2 & 3 có cấu trúc tương tự Tầng 1 nhưng hành lang dưới dịch nhẹ (y=535)
const B11_2: FloorShape[] = [
  // Hành lang
  { id: 'hall_2', type: 'hall', x: 39, y: 194, w: 2894, h: 64 },
  { id: 'hall_4', type: 'hall', x: 263, y: 535, w: 2284, h: 54 },
  { id: 'hall_3', type: 'hall', x: 263, y: 194, w: 71, h: 426 },
  { id: 'hall_5', type: 'hall', x: 2491, y: 194, w: 60, h: 399 },
  { id: 'hall_6', type: 'hall', x: 1429, y: 194, w: 86, h: 426 },
  // Phòng (top)
  { id: '302', type: 'room', x: 2393, y: 8, w: 196, h: 186, label: '302' },
  { id: '304', type: 'room', x: 2195, y: 8, w: 196, h: 186, label: '304' },
  { id: '306', type: 'room', x: 1997, y: 10, w: 196, h: 186, label: '306' },
  { id: '308', type: 'room', x: 1801, y: 8, w: 196, h: 186, label: '308' },
  { id: '310', type: 'room', x: 1646, y: 10, w: 153, h: 186, label: '310' },
  { id: '312', type: 'room', x: 1515, y: 10, w: 147, h: 182, label: '312' },
  { id: '314', type: 'room', x: 1233, y: 6, w: 196, h: 186, label: '314' },
  { id: '316', type: 'room', x: 1035, y: 6, w: 196, h: 186, label: '316' },
  { id: '318', type: 'room', x: 837, y: 8, w: 196, h: 186, label: '318' },
  { id: '320', type: 'room', x: 641, y: 6, w: 196, h: 186, label: '320' },
  { id: '322', type: 'room', x: 457, y: 8, w: 182, h: 186, label: '322' },
  { id: '324', type: 'room', x: 279, y: 8, w: 178, h: 186, label: '324' },
  // Phòng (bottom)
  { id: '301A', type: 'room', x: 2356, y: 603, w: 191, h: 215, label: '301A' },
  { id: '301B', type: 'room', x: 2149, y: 605, w: 198, h: 215, label: '301B' },
  { id: '303A', type: 'room', x: 1990, y: 606, w: 159, h: 214, label: '303A' },
  { id: '303B', type: 'room', x: 1829, y: 606, w: 159, h: 214, label: '303B' },
  { id: '305A', type: 'room', x: 1670, y: 606, w: 159, h: 212, label: '305A' },
  { id: '305B', type: 'room', x: 1505, y: 600, w: 165, h: 220, label: '305B' },
  { id: '307', type: 'room', x: 1094, y: 603, w: 335, h: 203, label: '307' },
  { id: '309', type: 'room', x: 716, y: 603, w: 378, h: 203, label: '309' },
  { id: '311', type: 'room', x: 370, y: 606, w: 346, h: 203, label: '311' },
  // WC
  { id: 'wc_1', type: 'wc', x: 2589, y: 8, w: 344, h: 186, label: 'WC' },
  { id: 'wc_2', type: 'wc', x: 0, y: 8, w: 190, h: 186, label: 'WC' },
  // Cầu thang
  { id: 'st_1', type: 'stairs', x: 204, y: 8, w: 86, h: 174 },
  { id: 'st_2', type: 'stairs', x: 263, y: 629, w: 86, h: 174 },
  { id: 'st_3', type: 'stairs', x: 1429, y: 20, w: 86, h: 174 },
  { id: 'st_4', type: 'stairs', x: 1429, y: 620, w: 86, h: 174 },
  { id: 'st_5', type: 'stairs', x: 2356, y: 348, w: 135, h: 99 },
  { id: 'elev', type: 'elevator', x: 1515, y: 365, w: 72, h: 53 },
];

const B11_3: FloorShape[] = [
  // Hành lang
  { id: 'hall_2', type: 'hall', x: 39, y: 194, w: 2894, h: 64 },
  { id: 'hall_4', type: 'hall', x: 263, y: 535, w: 2284, h: 54 },
  { id: 'hall_3', type: 'hall', x: 263, y: 194, w: 71, h: 426 },
  { id: 'hall_5', type: 'hall', x: 2491, y: 194, w: 60, h: 399 },
  { id: 'hall_6', type: 'hall', x: 1429, y: 194, w: 86, h: 426 },
  // Phòng (top)
  { id: '402', type: 'room', x: 2393, y: 8, w: 196, h: 186, label: '402' },
  { id: '410', type: 'room', x: 1646, y: 10, w: 153, h: 186, label: '410' },
  { id: '412', type: 'room', x: 1515, y: 10, w: 147, h: 182, label: '412' },
  { id: '408', type: 'room', x: 1801, y: 8, w: 196, h: 186, label: '408' },
  { id: '406', type: 'room', x: 1997, y: 10, w: 196, h: 186, label: '406' },
  { id: '404', type: 'room', x: 2195, y: 8, w: 196, h: 186, label: '404' },
  { id: '414', type: 'room', x: 1233, y: 6, w: 196, h: 186, label: '414' },
  { id: '422', type: 'room', x: 457, y: 8, w: 182, h: 186, label: '422' },
  { id: '424', type: 'room', x: 279, y: 8, w: 178, h: 186, label: '424' },
  { id: '420', type: 'room', x: 641, y: 6, w: 196, h: 186, label: '420' },
  { id: '418', type: 'room', x: 837, y: 8, w: 196, h: 186, label: '418' },
  { id: '416', type: 'room', x: 1035, y: 6, w: 196, h: 186, label: '416' },
  // Phòng (bottom)
  { id: '401', type: 'room', x: 2356, y: 603, w: 191, h: 215, label: '401' },
  { id: '403', type: 'room', x: 2149, y: 605, w: 198, h: 215, label: '403' },
  { id: '405', type: 'room', x: 1990, y: 606, w: 159, h: 214, label: '405' },
  { id: '407', type: 'room', x: 1829, y: 606, w: 159, h: 214, label: '407' },
  { id: '409', type: 'room', x: 1670, y: 606, w: 159, h: 212, label: '409' },
  { id: '411', type: 'room', x: 1505, y: 600, w: 165, h: 220, label: '411' },
  { id: '413', type: 'room', x: 1094, y: 603, w: 335, h: 203, label: '413' },
  { id: '415', type: 'room', x: 349, y: 606, w: 745, h: 203, label: '415' },
  // WC
  { id: 'wc_1', type: 'wc', x: 2589, y: 8, w: 344, h: 186, label: 'WC' },
  { id: 'wc_2', type: 'wc', x: 0, y: 8, w: 190, h: 186, label: 'WC' },
  // Cầu thang
  { id: 'st_1', type: 'stairs', x: 190, y: 8, w: 100, h: 184 },
  { id: 'st_2', type: 'stairs', x: 263, y: 629, w: 86, h: 174 },
  { id: 'st_3', type: 'stairs', x: 1429, y: 20, w: 86, h: 174 },
  { id: 'st_4', type: 'stairs', x: 1429, y: 620, w: 86, h: 174 },
  { id: 'st_5', type: 'stairs', x: 2356, y: 348, w: 135, h: 99 },
  { id: 'elev', type: 'elevator', x: 1515, y: 365, w: 72, h: 53 },
];

// ================================================================
// EXPORT
// ================================================================
export const FLOOR_GEOMETRY: FloorGeometryMap = {
  b11: {
    G: B11_G,
    '1': B11_1,
    '2': B11_2,
    '3': B11_3,
  },
  // TODO: bổ sung b8, b10 sau

  b8: {
    G: B8_G,
    '1': B8_1,
    '2': B8_2,
    '3': B8_3,
  },
  b10: {
    G: B10_G,
    '1': B10_1,
    '2': B10_2,
    '3': B10_3,
  },
};
