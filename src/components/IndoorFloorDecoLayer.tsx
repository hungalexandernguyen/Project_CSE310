/**
 * IndoorFloorDecoLayer.tsx — Style A: "Clean Light Blueprint"
 *
 * Lớp trang trí vẽ lại TOÀN BỘ sơ đồ tầng, hoàn toàn che đi SVG gốc bên dưới.
 *
 * Thiết kế:
 *   • Nền sáng trắng/xám nhạt (#F8FAFC)
 *   • Phòng: hình chữ nhật bo góc, nền xanh nhạt (#EBF5FF), viền xanh mảnh (#3B82F6)
 *   • Hành lang: xám ấm (#E2E8F0)
 *   • Cầu thang: cam nhạt (#FFF7ED), viền cam (#F97316)
 *   • WC: xanh mint nhạt (#ECFDF5), viền teal (#14B8A6)
 *   • Thang máy: tím nhạt (#F3E8FF), viền tím (#8B5CF6)
 *   • Nhãn phòng: font đậm, màu (#1E3A5F) — đặt giữa mỗi phòng
 */
import React from 'react';
import Svg, {
  Rect,
  Text as SvgText,
  G,
  Line,
} from 'react-native-svg';
import { StyleSheet } from 'react-native';
import { FloorLevel } from '../utils/indoor_graph';
import { FLOOR_GEOMETRY, FloorShape } from '../utils/floorGeometry';

type Props = {
  buildingId: string;
  floor: FloorLevel;
  width: number;
  height: number;
  viewBox: string;
  highlightRoomId?: string;
  startRoomId?: string;
};

// ── Bảng màu Style A ─────────────────────────────────────────
const C = {
  bg:           '#F8FAFC',
  hallFill:     '#E2E8F0',
  hallStroke:   '#CBD5E1',
  roomFill:     '#EBF5FF',
  roomStroke:   '#3B82F6',
  wcFill:       '#ECFDF5',
  wcStroke:     '#14B8A6',
  stairsFill:   '#FFF7ED',
  stairsStroke: '#F97316',
  elevFill:     '#F3E8FF',
  elevStroke:   '#8B5CF6',
  labelRoom:    '#1E3A5F',
  labelWC:      '#0F766E',
  labelStairs:  '#9A3412',
  labelElev:    '#6D28D9',
  // Highlight
  hlStartFill:   '#D1FAE5',
  hlStartStroke: '#059669',
  hlDestFill:    '#DBEAFE',
  hlDestStroke:  '#2563EB',
  // Grid
  gridLine:     '#E2E8F0',
};

const RX = 8; // Bo góc mặc định

export default function IndoorFloorDecoLayer({
  buildingId,
  floor,
  width,
  height,
  viewBox,
  highlightRoomId,
  startRoomId,
}: Props) {
  const shapes = FLOOR_GEOMETRY[buildingId]?.[floor];

  // Nếu chưa có geometry data cho tầng này, chỉ phủ overlay mờ (fallback)
  if (!shapes || shapes.length === 0) {
    return (
      <Svg width={width} height={height} viewBox={viewBox} style={styles.overlay} pointerEvents="none">
        <Rect x="0" y="0" width="100%" height="100%" fill="rgba(15,23,42,0.5)" />
      </Svg>
    );
  }

  // Parse viewBox để lấy kích thước
  const [vbX, vbY, vbW, vbH] = viewBox.split(' ').map(Number);

  // Tách theo loại
  const halls    = shapes.filter(s => s.type === 'hall');
  const rooms    = shapes.filter(s => s.type === 'room');
  const wcs      = shapes.filter(s => s.type === 'wc');
  const stairs   = shapes.filter(s => s.type === 'stairs');
  const elevs    = shapes.filter(s => s.type === 'elevator');

  const getFillStroke = (shape: FloorShape) => {
    // Kiểm tra highlight
    const roomNodeId = findNodeId(buildingId, floor, shape.label);
    if (roomNodeId && roomNodeId === startRoomId) {
      return { fill: C.hlStartFill, stroke: C.hlStartStroke, sw: 4 };
    }
    if (roomNodeId && roomNodeId === highlightRoomId) {
      return { fill: C.hlDestFill, stroke: C.hlDestStroke, sw: 4 };
    }

    switch (shape.type) {
      case 'wc':       return { fill: C.wcFill,     stroke: C.wcStroke,     sw: 2 };
      case 'stairs':   return { fill: C.stairsFill, stroke: C.stairsStroke, sw: 2 };
      case 'elevator': return { fill: C.elevFill,   stroke: C.elevStroke,   sw: 2 };
      default:         return { fill: C.roomFill,   stroke: C.roomStroke,   sw: 2 };
    }
  };

  const getLabelColor = (type: string) => {
    switch (type) {
      case 'wc':       return C.labelWC;
      case 'stairs':   return C.labelStairs;
      case 'elevator': return C.labelElev;
      default:         return C.labelRoom;
    }
  };

  // Tính font size dựa theo kích thước shape
  const getFontSize = (shape: FloorShape) => {
    const minDim = Math.min(shape.w, shape.h);
    if (minDim < 60)  return 16;
    if (minDim < 100) return 22;
    if (minDim < 150) return 28;
    return 36;
  };

  // Lấy text icon cho stairs / elevator
  const getIcon = (type: string) => {
    switch (type) {
      case 'stairs':   return '⇅';
      case 'elevator': return '⬍';
      default:         return '';
    }
  };

  return (
    <Svg
      width={width}
      height={height}
      viewBox={viewBox}
      style={styles.overlay}
      pointerEvents="none"
    >
      {/* ─── 1. Nền trắng toàn bộ (che SVG gốc hoàn toàn) ───── */}
      <Rect x={vbX} y={vbY} width={vbW} height={vbH} fill={C.bg} />

      {/* ─── 2. Lưới nền mờ (Grid Pattern) ──────────────────── */}
      {renderGrid(vbW, vbH, 100)}

      {/* ─── 3. Hành lang ────────────────────────────────────── */}
      {halls.map((h, i) => (
        <Rect
          key={`hall-${i}`}
          x={h.x} y={h.y} width={h.w} height={h.h}
          rx={4} ry={4}
          fill={C.hallFill}
          stroke={C.hallStroke}
          strokeWidth={1}
        />
      ))}

      {/* ─── 4. Phòng học ────────────────────────────────────── */}
      {rooms.map((r) => {
        const { fill, stroke, sw } = getFillStroke(r);
        return (
          <G key={`room-${r.id}`}>
            <Rect
              x={r.x} y={r.y} width={r.w} height={r.h}
              rx={RX} ry={RX}
              fill={fill} stroke={stroke} strokeWidth={sw}
            />
            {r.label && (
              <SvgText
                x={r.x + r.w / 2}
                y={r.y + r.h / 2 + getFontSize(r) * 0.35}
                fill={getLabelColor(r.type)}
                fontSize={getFontSize(r)}
                fontWeight="bold"
                textAnchor="middle"
              >
                {r.label}
              </SvgText>
            )}
          </G>
        );
      })}

      {/* ─── 5. WC ───────────────────────────────────────────── */}
      {wcs.map((w) => {
        const { fill, stroke, sw } = getFillStroke(w);
        return (
          <G key={`wc-${w.id}`}>
            <Rect
              x={w.x} y={w.y} width={w.w} height={w.h}
              rx={RX} ry={RX}
              fill={fill} stroke={stroke} strokeWidth={sw}
            />
            <SvgText
              x={w.x + w.w / 2}
              y={w.y + w.h / 2 + 10}
              fill={C.labelWC}
              fontSize={28}
              fontWeight="bold"
              textAnchor="middle"
            >
              WC
            </SvgText>
          </G>
        );
      })}

      {/* ─── 6. Cầu thang ────────────────────────────────────── */}
      {stairs.map((s, i) => {
        const { fill, stroke, sw } = getFillStroke(s);
        return (
          <G key={`stairs-${i}`}>
            <Rect
              x={s.x} y={s.y} width={s.w} height={s.h}
              rx={RX} ry={RX}
              fill={fill} stroke={stroke} strokeWidth={sw}
            />
            {/* Vẽ các vạch kẻ bậc thang */}
            {renderStairLines(s)}
            <SvgText
              x={s.x + s.w / 2}
              y={s.y + s.h / 2 + 6}
              fill={C.labelStairs}
              fontSize={16}
              fontWeight="bold"
              textAnchor="middle"
            >
              {getIcon('stairs')}
            </SvgText>
          </G>
        );
      })}

      {/* ─── 7. Thang máy ────────────────────────────────────── */}
      {elevs.map((e, i) => {
        const { fill, stroke, sw } = getFillStroke(e);
        return (
          <G key={`elev-${i}`}>
            <Rect
              x={e.x} y={e.y} width={e.w} height={e.h}
              rx={RX} ry={RX}
              fill={fill} stroke={stroke} strokeWidth={sw}
            />
            <SvgText
              x={e.x + e.w / 2}
              y={e.y + e.h / 2 + 6}
              fill={C.labelElev}
              fontSize={14}
              fontWeight="bold"
              textAnchor="middle"
            >
              {getIcon('elevator')}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

// ── Helper: Vẽ lưới nền mờ ─────────────────────────────────────
function renderGrid(w: number, h: number, spacing: number) {
  const lines: React.ReactElement[] = [];
  for (let x = 0; x <= w; x += spacing) {
    lines.push(
      <Line key={`gv-${x}`} x1={x} y1={0} x2={x} y2={h}
        stroke={C.gridLine} strokeWidth={1} strokeOpacity={0.5} />
    );
  }
  for (let y = 0; y <= h; y += spacing) {
    lines.push(
      <Line key={`gh-${y}`} x1={0} y1={y} x2={w} y2={y}
        stroke={C.gridLine} strokeWidth={1} strokeOpacity={0.5} />
    );
  }
  return <G>{lines}</G>;
}

// ── Helper: Vẽ vạch bậc thang ──────────────────────────────────
function renderStairLines(s: FloorShape) {
  const lines: React.ReactElement[] = [];
  const isVertical = s.h > s.w;
  const numLines = 5;
  const pad = 8;

  if (isVertical) {
    const step = (s.h - pad * 2) / (numLines + 1);
    for (let i = 1; i <= numLines; i++) {
      const y = s.y + pad + step * i;
      lines.push(
        <Line key={`sl-${i}`}
          x1={s.x + pad} y1={y} x2={s.x + s.w - pad} y2={y}
          stroke={C.stairsStroke} strokeWidth={1.5} strokeOpacity={0.5}
        />
      );
    }
  } else {
    const step = (s.w - pad * 2) / (numLines + 1);
    for (let i = 1; i <= numLines; i++) {
      const x = s.x + pad + step * i;
      lines.push(
        <Line key={`sl-${i}`}
          x1={x} y1={s.y + pad} x2={x} y2={s.y + s.h - pad}
          stroke={C.stairsStroke} strokeWidth={1.5} strokeOpacity={0.5}
        />
      );
    }
  }
  return <G>{lines}</G>;
}

// ── Helper: Tìm node ID từ label ──────────────────────────────
function findNodeId(buildingId: string, floor: FloorLevel, label?: string): string | undefined {
  if (!label) return undefined;
  // Convention: room_G_108, room_1_204, etc.
  return `room_${floor}_${label}`;
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
