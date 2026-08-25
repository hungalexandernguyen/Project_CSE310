import React from 'react';
import Svg, { Polyline, Circle } from 'react-native-svg';
import { StyleSheet } from 'react-native';
import { IndoorNode } from '../utils/indoor_graph';

type Props = {
  pathNodes: IndoorNode[];
  width: number;
  height: number;
  viewBox?: string;
};

export default function IndoorPathOverlay({ pathNodes, width, height, viewBox = '0 0 2971 786' }: Props) {
  // Chỉ vẽ đường khi có ít nhất 2 điểm trên cùng 1 tầng
  if (!pathNodes || pathNodes.length < 2) return null;

  // Tạo chuỗi tọa độ x,y x,y cho thẻ Polyline
  const pointsString = pathNodes.map(node => `${node.x},${node.y}`).join(' ');

  const startNode = pathNodes[0];
  const endNode = pathNodes[pathNodes.length - 1];

  return (
    <Svg 
      width={width} 
      height={height} 
      viewBox={viewBox} 
      style={styles.overlay}
    >
      {/* Đường nối nét đứt */}
      <Polyline
        points={pointsString}
        fill="none"
        stroke="#007AFF"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={[25, 20]}
      />
      
      {/* Nút tròn ở Điểm Bắt Đầu (Xanh lá) */}
      <Circle cx={startNode.x} cy={startNode.y} r="18" fill="#34C759" stroke="#FFF" strokeWidth="4" />

      {/* Nút tròn ở Điểm Đích (Đỏ) */}
      <Circle cx={endNode.x} cy={endNode.y} r="18" fill="#FF3B30" stroke="#FFF" strokeWidth="4" />
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
