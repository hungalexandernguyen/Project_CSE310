import React from 'react';
import Svg, {
  Polyline,
  Circle,
  G,
  Rect,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
  Filter,
  FeDropShadow,
} from 'react-native-svg';
import { StyleSheet, View } from 'react-native';
import { IndoorNode } from '../utils/indoor_graph';

type Props = {
  pathNodes: IndoorNode[];
  width: number;
  height: number;
  viewBox?: string;
  allRooms?: IndoorNode[]; // Danh sách các phòng để render Badge 2.5D
  selectedRoomId?: string;
};

export default function IndoorPathOverlay({
  pathNodes,
  width,
  height,
  viewBox = '0 0 2971 786',
  allRooms = [],
  selectedRoomId,
}: Props) {
  const hasPath = pathNodes && pathNodes.length >= 2;
  const pointsString = hasPath ? pathNodes.map((n) => `${n.x},${n.y}`).join(' ') : '';
  const startNode = hasPath ? pathNodes[0] : null;
  const endNode = hasPath ? pathNodes[pathNodes.length - 1] : null;

  return (
    <Svg
      width={width}
      height={height}
      viewBox={viewBox}
      style={styles.overlay}
      pointerEvents="none"
    >
      <Defs>
        {/* Glow & Shadow Filter */}
        <Filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <FeDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#007AFF" floodOpacity="0.6" />
        </Filter>
        <Filter id="pinShadow" x="-30%" y="-30%" width="160%" height="160%">
          <FeDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.4" />
        </Filter>

        {/* Gradient for Route */}
        <LinearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#00C6FF" />
          <Stop offset="100%" stopColor="#0072FF" />
        </LinearGradient>

        <LinearGradient id="startGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#10B981" />
          <Stop offset="100%" stopColor="#059669" />
        </LinearGradient>

        <LinearGradient id="destGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#EF4444" />
          <Stop offset="100%" stopColor="#DC2626" />
        </LinearGradient>
      </Defs>

      {/* ─── 1. Tầng chân bóng đổ của đường đi (Depth/Shadow) ───── */}
      {hasPath && (
        <Polyline
          points={pointsString}
          fill="none"
          stroke="#000000"
          strokeWidth="20"
          strokeOpacity="0.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="translate(0, 14)"
        />
      )}

      {/* ─── 2. Đường lộ trình phát sáng (Glow Ribbon) ─────────── */}
      {hasPath && (
        <>
          {/* Lớp viền sáng rộng */}
          <Polyline
            points={pointsString}
            fill="none"
            stroke="#00C6FF"
            strokeWidth="22"
            strokeOpacity="0.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Lớp chính Gradient */}
          <Polyline
            points={pointsString}
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={[28, 16]}
          />
          {/* Lớp lõi sáng trắng trung tâm */}
          <Polyline
            points={pointsString}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={[28, 16]}
          />
        </>
      )}

      {/* ─── 3. Markers: Điểm bắt đầu (Start Pin) ───────────────── */}
      {startNode && (
        <G transform={`translate(${startNode.x}, ${startNode.y})`}>
          {/* Vòng lan tỏa (Pulse Radar) */}
          <Circle cx="0" cy="0" r="42" fill="#10B981" fillOpacity="0.25" />
          <Circle cx="0" cy="0" r="28" fill="#10B981" fillOpacity="0.4" />
          {/* Chân bóng đổ */}
          <Circle cx="0" cy="10" r="18" fill="#000000" fillOpacity="0.3" />
          {/* Pin trung tâm */}
          <Circle cx="0" cy="0" r="20" fill="url(#startGradient)" stroke="#FFFFFF" strokeWidth="5" />
          <Circle cx="0" cy="0" r="8" fill="#FFFFFF" />

        </G>
      )}

      {/* ─── 4. Markers: Điểm kết thúc (Destination Pin) ───────── */}
      {endNode && (
        <G transform={`translate(${endNode.x}, ${endNode.y})`}>
          {/* Vòng lan tỏa (Pulse Radar) */}
          <Circle cx="0" cy="0" r="46" fill="#EF4444" fillOpacity="0.25" />
          <Circle cx="0" cy="0" r="30" fill="#EF4444" fillOpacity="0.4" />
          {/* Chân bóng đổ */}
          <Circle cx="0" cy="10" r="18" fill="#000000" fillOpacity="0.3" />
          {/* Pin trung tâm */}
          <Circle cx="0" cy="0" r="22" fill="url(#destGradient)" stroke="#FFFFFF" strokeWidth="5" />
          <Circle cx="0" cy="0" r="9" fill="#FFFFFF" />

        </G>
      )}

      {/* ─── 5. Cầu thang chuyển tầng Marker (nếu có) ──────────── */}
      {hasPath &&
        pathNodes.map((node, index) => {
          if (node.type !== 'stairs') return null;
          // Bỏ qua nếu là điểm đầu/cuối đã có Pin
          if (index === 0 || index === pathNodes.length - 1) return null;

          return (
            <G key={`stairs-pin-${node.id}-${index}`} transform={`translate(${node.x}, ${node.y})`}>
              <Circle cx="0" cy="0" r="26" fill="#FF8D28" fillOpacity="0.3" />
              <Circle cx="0" cy="0" r="18" fill="#FF8D28" stroke="#FFFFFF" strokeWidth="4" />
            </G>
          );
        })}
    </Svg>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
