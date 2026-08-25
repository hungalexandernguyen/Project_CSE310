import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { INDOOR_MAPS, INDOOR_VIEWBOXES } from '../constants/indoorMaps';
import IndoorPathOverlay from '../components/IndoorPathOverlay';
import RoomPickerModal from '../components/RoomPickerModal';
import { findIndoorPath } from '../utils/pathfinding';
import { IndoorNode, FloorLevel } from '../utils/indoor_graph';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Tòa nào đã có dữ liệu node (indoor_graph)
const SUPPORTED_BUILDINGS = ['b11', 'b8'];

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
  const scale         = useSharedValue(1);
  const savedScale    = useSharedValue(1);
  const translateX    = useSharedValue(0);
  const translateY    = useSharedValue(0);
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
    ? [...new Set(currentRoute.map(n => n.floor))] as FloorLevel[]
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
    const floorPathNodes = currentRoute.filter(n => n.floor === selectedFloor);

    return (
      <View>
        <MapComponent width={svgW} height={svgH} />
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

      {/* ─── Bản đồ (Gesture + Animated) ─────────────────────── */}
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.mapContainer, animatedStyle]}>
          {renderMap()}
        </Animated.View>
      </GestureDetector>

      {/* ─── Step Banner (xuyên tầng) ─────────────────────────── */}
      {renderStepBanner()}

      {/* ─── Nút Quay lại ─────────────────────────────────────── */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backTxt}>⬅</Text>
      </TouchableOpacity>

      {/* ─── Floor Picker (phải) ──────────────────────────────── */}
      <View style={styles.floorPicker}>
        {floors.map(floor => (
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
            {floorsInRoute.includes(floor) && (
              <View style={styles.floorDot} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* ─── Route Panel (dưới) ───────────────────────────────── */}
      <View style={styles.routePanel}>
        {!isSupported ? (
          <View style={styles.unsupportedRow}>
            <Text style={styles.unsupportedTxt}>
              ⚠️ Tòa này chưa hỗ trợ tìm đường
            </Text>
          </View>
        ) : (
          <>
            {/* Ô Xuất phát */}
            <TouchableOpacity
              style={styles.roomSelector}
              onPress={() => setShowFromPicker(true)}
              activeOpacity={0.75}
            >
              <Text style={styles.roomSelectorIcon}>📍</Text>
              <View style={styles.roomSelectorInfo}>
                <Text style={styles.roomSelectorLabel}>Xuất phát</Text>
                <Text
                  style={[styles.roomSelectorValue, !fromRoom && styles.roomSelectorPlaceholder]}
                  numberOfLines={1}
                >
                  {fromRoom ? `${fromRoom.label}  (Tầng ${fromRoom.floor})` : 'Chọn phòng...'}
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
              <Text style={styles.roomSelectorIcon}>🎯</Text>
              <View style={styles.roomSelectorInfo}>
                <Text style={styles.roomSelectorLabel}>Điểm đến</Text>
                <Text
                  style={[styles.roomSelectorValue, !toRoom && styles.roomSelectorPlaceholder]}
                  numberOfLines={1}
                >
                  {toRoom ? `${toRoom.label}  (Tầng ${toRoom.floor})` : 'Chọn phòng...'}
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
                <Text style={styles.findBtnTxt}>🗺️  Tìm đường</Text>
              </TouchableOpacity>

              {currentRoute.length > 0 && (
                <TouchableOpacity style={styles.clearBtn} onPress={handleClearRoute}>
                  <Text style={styles.clearBtnTxt}>✕ Xóa</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Thông báo kết quả */}
            {currentRoute.length === 0 && fromRoom && toRoom && (
              <Text style={styles.noRouteTxt}>
                ⚠️ Không tìm thấy đường đi giữa hai phòng này.
              </Text>
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
          setCurrentRoute([]); // Reset lộ trình khi đổi điểm
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
const PANEL_HEIGHT = 170;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    overflow: 'hidden',
  },
  mapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: PANEL_HEIGHT,
  },
  infoTxt: {
    color: 'white',
    fontSize: 14,
  },

  // ── Back button ──────────────────────────────────────────────
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(50,50,50,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  backTxt: {
    color: 'white',
    fontSize: 18,
  },

  // ── Floor picker ─────────────────────────────────────────────
  floorPicker: {
    position: 'absolute',
    right: 16,
    bottom: PANEL_HEIGHT + 16,
    backgroundColor: 'rgba(44,44,46,0.95)',
    borderRadius: 25,
    padding: 8,
    gap: 10,
    zIndex: 20,
  },
  floorButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#3A3A3C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floorButtonActive: {
    backgroundColor: '#FF8D28',
  },
  floorButtonHasRoute: {
    borderWidth: 2,
    borderColor: '#FF8D28',
  },
  floorText: {
    color: '#CCC',
    fontSize: 15,
    fontWeight: '700',
  },
  floorTextActive: {
    color: '#FFF',
  },
  floorDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FF8D28',
  },

  // ── Step Banner ───────────────────────────────────────────────
  stepBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(30,30,30,0.95)',
    paddingTop: 54,
    paddingBottom: 12,
    paddingHorizontal: 16,
    zIndex: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  stepBannerRoute: {
    color: '#FFF',
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
    backgroundColor: '#FF8D28',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  stepBtnDisabled: {
    backgroundColor: '#3A3A3C',
  },
  stepBtnTxt: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  stepFloorChip: {
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF8D28',
  },
  stepFloorTxt: {
    color: '#FF8D28',
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
    backgroundColor: '#2C2C2E',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  roomSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  roomSelectorIcon: {
    fontSize: 18,
    width: 28,
    textAlign: 'center',
  },
  roomSelectorInfo: {
    flex: 1,
  },
  roomSelectorLabel: {
    color: '#888',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  roomSelectorValue: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 1,
  },
  roomSelectorPlaceholder: {
    color: '#555',
    fontWeight: '400',
  },
  roomSelectorChevron: {
    color: '#555',
    fontSize: 22,
  },
  panelDivider: {
    height: 1,
    backgroundColor: '#3A3A3C',
    marginVertical: 4,
    marginLeft: 38,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  findBtn: {
    flex: 1,
    backgroundColor: '#FF8D28',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  findBtnDisabled: {
    backgroundColor: '#3A3A3C',
  },
  findBtnTxt: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  clearBtn: {
    backgroundColor: '#3A3A3C',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  clearBtnTxt: {
    color: '#FF453A',
    fontWeight: '600',
    fontSize: 14,
  },
  noRouteTxt: {
    color: '#FF453A',
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
    color: '#888',
    fontSize: 14,
  },
});
