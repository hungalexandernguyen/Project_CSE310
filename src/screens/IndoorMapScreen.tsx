import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { INDOOR_MAPS, INDOOR_VIEWBOXES } from '../constants/indoorMaps';
import IndoorPathOverlay from '../components/IndoorPathOverlay';
import IndoorFloorDecoLayer from '../components/IndoorFloorDecoLayer';
import RoomPickerModal from '../components/RoomPickerModal';
import { findIndoorPath } from '../utils/pathfinding';
import { IndoorNode, FloorLevel } from '../utils/indoor_graph';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Tòa nào đã có dữ liệu node (indoor_graph)
const SUPPORTED_BUILDINGS = ['b11', 'b8', 'b10'];

type Props = {
  buildingId: string;
};

export default function IndoorMapScreen({ buildingId }: Props) {
  const router = useRouter();

  // ── Tầng đang hiển thị ─────────────────────────────────────
  const [selectedFloor, setSelectedFloor] = useState<FloorLevel>('G');

  // ── Trạng thái lộ trình ─────────────────────────────────────
  const [fromRoom, setFromRoom] = useState<IndoorNode | null>(null);
  const [toRoom, setToRoom]     = useState<IndoorNode | null>(null);
  const [currentRoute, setCurrentRoute] = useState<IndoorNode[]>([]);

  // ── Modal picker ─────────────────────────────────────────────
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker,   setShowToPicker]   = useState(false);

  // ── Gesture (Pinch + Pan) ────────────────────────────────────
  const scale           = useSharedValue(1);
  const savedScale      = useSharedValue(1);
  const translateX      = useSharedValue(0);
  const translateY      = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => { scale.value = savedScale.value * e.scale; })
    .onEnd(()    => { savedScale.value = scale.value; });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  const resetView = () => {
    scale.value = withSpring(1);
    savedScale.value = 1;
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // ── Tầng ─────────────────────────────────────────────────────
  const floors: FloorLevel[] = ['3', '2', '1', 'G'];

  // ── Logic tìm đường ──────────────────────────────────────────
  const handleFindRoute = useCallback(() => {
    if (!fromRoom || !toRoom) return;
    const path = findIndoorPath(fromRoom.id, toRoom.id);
    setCurrentRoute(path);
    if (path.length > 0) setSelectedFloor(fromRoom.floor);
  }, [fromRoom, toRoom]);

  const handleClearRoute = () => {
    setCurrentRoute([]);
    setFromRoom(null);
    setToRoom(null);
    setSelectedFloor('G');
  };

  // Tầng nào có đoạn lộ trình đi qua
  const floorsInRoute = currentRoute.length > 0
    ? ([...new Set(currentRoute.map((n) => n.floor))] as FloorLevel[])
    : [];

  // ── Render bản đồ ────────────────────────────────────────────
  const renderMap = () => {
    const buildingMaps = INDOOR_MAPS[buildingId];
    if (!buildingMaps) {
      return <Text style={styles.infoTxt}>Chưa có dữ liệu đồ họa cho tòa nhà này.</Text>;
    }
    const MapComponent = buildingMaps[selectedFloor];
    if (!MapComponent) {
      return <Text style={styles.infoTxt}>Chưa có sơ đồ cho tầng này.</Text>;
    }

    const svgW = SCREEN_WIDTH * 1.5;
    const svgH = svgW * (800 / 3000);
    const viewBox = INDOOR_VIEWBOXES[buildingId] ?? '0 0 3047 797';

    // Chỉ lấy node thuộc tầng đang xem
    const floorPathNodes = currentRoute.filter((n) => n.floor === selectedFloor);

    return (
      <View>
        {/* Lớp 1: SVG sơ đồ gốc (base layer) */}
        <MapComponent width={svgW} height={svgH} />

        {/* Lớp 2: Decoration Layer — phủ tối + badge phòng hiện đại */}
        <IndoorFloorDecoLayer
          buildingId={buildingId}
          floor={selectedFloor}
          width={svgW}
          height={svgH}
          viewBox={viewBox}
          highlightRoomId={toRoom?.id}
          startRoomId={fromRoom?.id}
        />

        {/* Lớp 3: Path Overlay — đường lộ trình + markers */}
        {floorPathNodes.length > 0 && (
          <IndoorPathOverlay
            pathNodes={floorPathNodes}
            width={svgW}
            height={svgH}
            viewBox={viewBox}
          />
        )}
      </View>
    );
  };

  // ── Render StepBanner (khi đang có lộ trình xuyên tầng) ─────
  const renderStepBanner = () => {
    if (currentRoute.length === 0 || floorsInRoute.length <= 1) return null;
    const currentIdx = floorsInRoute.indexOf(selectedFloor);
    const from = fromRoom?.label ?? fromRoom?.id ?? '';
    const to   = toRoom?.label   ?? toRoom?.id   ?? '';

    return (
      <View style={styles.stepBanner}>
        <Text style={styles.stepBannerRoute} numberOfLines={1}>
          🧭 {from} → {to}
        </Text>
        <View style={styles.stepBannerNav}>
          <TouchableOpacity
            style={[styles.stepBtn, currentIdx <= 0 && styles.stepBtnDisabled]}
            disabled={currentIdx <= 0}
            onPress={() => setSelectedFloor(floorsInRoute[currentIdx - 1])}
          >
            <Text style={styles.stepBtnTxt}>‹ Tầng trước</Text>
          </TouchableOpacity>

          <View style={styles.stepFloorChip}>
            <Text style={styles.stepFloorTxt}>Tầng {selectedFloor}</Text>
          </View>

          <TouchableOpacity
            style={[styles.stepBtn, currentIdx >= floorsInRoute.length - 1 && styles.stepBtnDisabled]}
            disabled={currentIdx >= floorsInRoute.length - 1}
            onPress={() => setSelectedFloor(floorsInRoute[currentIdx + 1])}
          >
            <Text style={styles.stepBtnTxt}>Tầng tiếp ›</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const isSupported = SUPPORTED_BUILDINGS.includes(buildingId);

  return (
    <View style={styles.container}>
      {/* ─── Bản đồ (Gesture + Animated) ───────────────────────── */}
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.mapContainer, animatedStyle]}>
          {renderMap()}
        </Animated.View>
      </GestureDetector>

      {/* ─── Step Banner (xuyên tầng) ─────────────────────────── */}
      {renderStepBanner()}

      {/* ─── Nút Điều khiển Nổi (Góc trên) ─────────────────────── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.glassBtn} onPress={() => router.back()}>
          <Text style={styles.glassBtnTxt}>⬅ Quay lại</Text>
        </TouchableOpacity>

        {/* Nút Reset góc nhìn */}
        <TouchableOpacity style={styles.glassBtn} onPress={resetView}>
          <Text style={styles.glassBtnTxt}>🎯 Reset</Text>
        </TouchableOpacity>
      </View>

      {/* ─── Floor Picker (phải) ──────────────────────────────── */}
      <View style={styles.floorPicker}>
        {floors.map((floor) => (
          <TouchableOpacity
            key={floor}
            style={[
              styles.floorButton,
              selectedFloor === floor && styles.floorButtonActive,
              floorsInRoute.includes(floor) && styles.floorButtonHasRoute,
            ]}
            onPress={() => setSelectedFloor(floor)}
          >
            <Text style={[styles.floorText, selectedFloor === floor && styles.floorTextActive]}>
              {floor}
            </Text>
            {floorsInRoute.includes(floor) && <View style={styles.floorDot} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* ─── Route Panel (dưới đáy) ──────────────────────────── */}
      <View style={styles.routePanel}>
        {!isSupported ? (
          <View style={styles.unsupportedRow}>
            <Text style={styles.unsupportedTxt}>⚠️ Tòa này chưa hỗ trợ tìm đường</Text>
          </View>
        ) : (
          <>
            {/* Ô Xuất phát */}
            <TouchableOpacity
              style={styles.roomSelector}
              onPress={() => setShowFromPicker(true)}
              activeOpacity={0.75}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#10B98120' }]}>
                <Text style={{ fontSize: 14 }}>📍</Text>
              </View>
              <View style={styles.roomSelectorInfo}>
                <Text style={styles.roomSelectorLabel}>Xuất phát</Text>
                <Text
                  style={[styles.roomSelectorValue, !fromRoom && styles.roomSelectorPlaceholder]}
                  numberOfLines={1}
                >
                  {fromRoom ? `${fromRoom.label}  (Tầng ${fromRoom.floor})` : 'Chọn phòng bắt đầu...'}
                </Text>
              </View>
              <Text style={styles.roomSelectorChevron}>›</Text>
            </TouchableOpacity>

            <View style={styles.panelDivider} />

            {/* Ô Đích */}
            <TouchableOpacity
              style={styles.roomSelector}
              onPress={() => setShowToPicker(true)}
              activeOpacity={0.75}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#EF444420' }]}>
                <Text style={{ fontSize: 14 }}>🎯</Text>
              </View>
              <View style={styles.roomSelectorInfo}>
                <Text style={styles.roomSelectorLabel}>Điểm đến</Text>
                <Text
                  style={[styles.roomSelectorValue, !toRoom && styles.roomSelectorPlaceholder]}
                  numberOfLines={1}
                >
                  {toRoom ? `${toRoom.label}  (Tầng ${toRoom.floor})` : 'Chọn phòng muốn đến...'}
                </Text>
              </View>
              <Text style={styles.roomSelectorChevron}>›</Text>
            </TouchableOpacity>

            {/* Nút hành động */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.findBtn, (!fromRoom || !toRoom) && styles.findBtnDisabled]}
                onPress={handleFindRoute}
                disabled={!fromRoom || !toRoom}
              >
                <Text style={styles.findBtnTxt}>🗺️  Tìm đường ngay</Text>
              </TouchableOpacity>

              {currentRoute.length > 0 && (
                <TouchableOpacity style={styles.clearBtn} onPress={handleClearRoute}>
                  <Text style={styles.clearBtnTxt}>✕ Xóa</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Thông báo kết quả */}
            {currentRoute.length === 0 && fromRoom && toRoom && (
              <Text style={styles.noRouteTxt}>⚠️ Không tìm thấy đường đi giữa hai phòng này.</Text>
            )}
          </>
        )}
      </View>

      {/* ─── Modals ───────────────────────────────────────────── */}
      <RoomPickerModal
        visible={showFromPicker}
        buildingId={buildingId}
        title="Chọn phòng xuất phát"
        excludeRoomId={toRoom?.id}
        onSelect={(room) => {
          setFromRoom(room);
          setCurrentRoute([]);
        }}
        onClose={() => setShowFromPicker(false)}
      />

      <RoomPickerModal
        visible={showToPicker}
        buildingId={buildingId}
        title="Chọn điểm đến"
        excludeRoomId={fromRoom?.id}
        onSelect={(room) => {
          setToRoom(room);
          setCurrentRoute([]);
        }}
        onClose={() => setShowToPicker(false)}
      />
    </View>
  );
}

// ================================================================
// STYLES
// ================================================================
const PANEL_HEIGHT = 178;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    overflow: 'hidden',
  },
  mapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: PANEL_HEIGHT - 30,
  },
  infoTxt: {
    color: '#94A3B8',
    fontSize: 14,
  },

  // ── Top Bar ──────────────────────────────────────────────────
  topBar: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 30,
  },
  glassBtn: {
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  glassBtnTxt: {
    color: '#F8FAFC',
    fontWeight: '600',
    fontSize: 13,
  },

  // ── Floor picker ─────────────────────────────────────────────
  floorPicker: {
    position: 'absolute',
    right: 16,
    bottom: PANEL_HEIGHT + 20,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 24,
    padding: 6,
    gap: 8,
    zIndex: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  floorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floorButtonActive: {
    backgroundColor: '#0284C7',
  },
  floorButtonHasRoute: {
    borderWidth: 2,
    borderColor: '#38BDF8',
  },
  floorText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
  },
  floorTextActive: {
    color: '#FFFFFF',
  },
  floorDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38BDF8',
  },

  // ── Step Banner ───────────────────────────────────────────────
  stepBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    paddingTop: 54,
    paddingBottom: 12,
    paddingHorizontal: 16,
    zIndex: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  stepBannerRoute: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepBannerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  stepBtnDisabled: {
    backgroundColor: '#334155',
  },
  stepBtnTxt: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  stepFloorChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  stepFloorTxt: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '700',
  },

  // ── Route Panel ───────────────────────────────────────────────
  routePanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: PANEL_HEIGHT,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 10,
    zIndex: 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 15,
  },
  roomSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomSelectorInfo: {
    flex: 1,
  },
  roomSelectorLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  roomSelectorValue: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 1,
  },
  roomSelectorPlaceholder: {
    color: '#475569',
    fontWeight: '400',
  },
  roomSelectorChevron: {
    color: '#475569',
    fontSize: 20,
  },
  panelDivider: {
    height: 1,
    backgroundColor: '#1E293B',
    marginVertical: 4,
    marginLeft: 42,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  findBtn: {
    flex: 1,
    backgroundColor: '#0284C7',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  findBtnDisabled: {
    backgroundColor: '#1E293B',
  },
  findBtnTxt: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  clearBtn: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  clearBtnTxt: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 14,
  },
  noRouteTxt: {
    color: '#EF4444',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  unsupportedRow: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unsupportedTxt: {
    color: '#64748B',
    fontSize: 14,
  },
});
