import React, { useRef } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Building } from '../constants/buildings';

export type RouteOrigin = Building | 'gps' | null;

type Props = {
  origin: RouteOrigin;
  destination: Building | null;
  hasGps: boolean;
  onPressFrom: () => void;
  onPressTo: () => void;
  onClear: () => void;
};

// Heights for the two snap positions
const EXPANDED_HEIGHT = 260;  // enough for title + 2 rows + hint
const COLLAPSED_HEIGHT = 60;  // handle bar + title only

function originLabel(origin: RouteOrigin, hasGps: boolean): string {
  if (origin === null) return hasGps ? 'My Location' : 'Select start…';
  if (origin === 'gps') return 'My Location';
  return origin.label;
}

function originSub(origin: RouteOrigin, hasGps: boolean): string {
  if (origin === null) return hasGps ? 'Current GPS position' : 'Tap to choose';
  if (origin === 'gps') return 'Current GPS position';
  return origin.title;
}

export default function RoutePanel({
  origin,
  destination,
  hasGps,
  onPressFrom,
  onPressTo,
  onClear,
}: Props) {
  const hasRoute = destination !== null;
  const isGps = origin === null || origin === 'gps';

  // Animated height for the sheet
  const animHeight = useRef(new Animated.Value(EXPANDED_HEIGHT)).current;
  const isExpanded = useRef(true);
  const dragStartHeight = useRef(EXPANDED_HEIGHT);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dy) > 4,
      onPanResponderGrant: () => {
        // Capture height at drag start
        dragStartHeight.current = (animHeight as any)._value;
      },
      onPanResponderMove: (_, gs) => {
        // Dragging down (positive dy) → shrink; dragging up → grow
        const next = dragStartHeight.current - gs.dy;
        animHeight.setValue(
          Math.max(COLLAPSED_HEIGHT, Math.min(EXPANDED_HEIGHT, next))
        );
      },
      onPanResponderRelease: (_, gs) => {
        // Snap to nearest position based on velocity / position
        const midpoint = (EXPANDED_HEIGHT + COLLAPSED_HEIGHT) / 2;
        const current = (animHeight as any)._value;
        const snapTo =
          gs.vy < -0.3 || current > midpoint ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT;

        isExpanded.current = snapTo === EXPANDED_HEIGHT;
        Animated.spring(animHeight, {
          toValue: snapTo,
          useNativeDriver: false,
          bounciness: 4,
        }).start();
      },
    })
  ).current;

  // Toggle on handle / title tap
  const toggleSheet = () => {
    const snapTo = isExpanded.current ? COLLAPSED_HEIGHT : EXPANDED_HEIGHT;
    isExpanded.current = !isExpanded.current;
    Animated.spring(animHeight, {
      toValue: snapTo,
      useNativeDriver: false,
      bounciness: 6,
    }).start();
  };

  // Fade in body content only when height is near expanded
  const bodyOpacity = animHeight.interpolate({
    inputRange: [COLLAPSED_HEIGHT, COLLAPSED_HEIGHT + 40, EXPANDED_HEIGHT],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.panel, { height: animHeight }]}>
      {/* ── Drag handle + title (always visible, drag target) ── */}
      <View {...panResponder.panHandlers} style={styles.header}>
        {/* Tapping the pill also toggles the sheet */}
        <TouchableOpacity onPress={toggleSheet} activeOpacity={0.6} style={styles.handleBarWrapper}>
          <View style={styles.handleBar} />
        </TouchableOpacity>
        <View style={styles.titleRow}>
          <Text style={styles.panelTitle}>Route Planner</Text>
          {hasRoute && (
            <TouchableOpacity onPress={onClear} style={styles.clearBtn} activeOpacity={0.8}>
              <Text style={styles.clearText}>✕ Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Body — fades in when expanded ── */}
      <Animated.View style={[styles.body, { opacity: bodyOpacity }]}>
        {/* From row */}
        <TouchableOpacity
          style={styles.pickerRow}
          onPress={onPressFrom}
          activeOpacity={0.8}
        >
          <View style={[styles.dotLine, styles.dotFrom]}>
            <View style={[styles.dot, isGps ? styles.dotGps : styles.dotBuilding]} />
            <View style={styles.line} />
          </View>
          <View style={styles.pickerContent}>
            <Text style={styles.pickerLabel}>FROM</Text>
            <Text
              style={[
                styles.pickerValue,
                origin === null && hasGps && styles.pickerValueGps,
              ]}
              numberOfLines={1}
            >
              {originLabel(origin, hasGps)}
            </Text>
            <Text style={styles.pickerSub} numberOfLines={1}>
              {originSub(origin, hasGps)}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* To row */}
        <TouchableOpacity
          style={styles.pickerRow}
          onPress={onPressTo}
          activeOpacity={0.8}
        >
          <View style={styles.dotLine}>
            <View style={[styles.dot, styles.dotDest]} />
          </View>
          <View style={styles.pickerContent}>
            <Text style={styles.pickerLabel}>TO</Text>
            <Text
              style={[
                styles.pickerValue,
                !destination && styles.pickerValuePlaceholder,
              ]}
              numberOfLines={1}
            >
              {destination ? destination.label : 'Select destination…'}
            </Text>
            {destination && (
              <Text style={styles.pickerSub} numberOfLines={1}>
                {destination.title}
              </Text>
            )}
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* Distance hint */}

      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0f1b2d',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 18,
    overflow: 'hidden',
  },

  // Header — always rendered, acts as drag target
  header: {
    paddingHorizontal: 18,
  },
  handleBarWrapper: {
    alignSelf: 'center',
    paddingVertical: 8,      // extra tap surface above & below the pill
    paddingHorizontal: 20,
  },
  handleBar: {
    width: 42,
    height: 4,
    backgroundColor: '#2a4a6a',
    borderRadius: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  panelTitle: {
    color: '#e0eaf5',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  clearBtn: {
    backgroundColor: '#3a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#7a2a2a',
  },
  clearText: {
    color: '#ff6060',
    fontSize: 13,
    fontWeight: '600',
  },

  // Body — fades when collapsed
  body: {
    paddingHorizontal: 18,
    paddingBottom: 20,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#152030',
    borderRadius: 16,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#1e3550',
  },
  dotLine: {
    alignItems: 'center',
    marginRight: 14,
    width: 20,
  },
  dotFrom: {},
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2.5,
    borderColor: '#fff',
  },
  dotGps: {
    backgroundColor: '#4cd97b',
    borderColor: '#4cd97b',
  },
  dotBuilding: {
    backgroundColor: '#00aaff',
    borderColor: '#00aaff',
  },
  dotDest: {
    backgroundColor: '#ff4c4c',
    borderColor: '#ff4c4c',
  },
  line: {
    width: 2,
    height: 16,
    backgroundColor: '#2a4a6a',
    marginTop: 3,
  },
  pickerContent: {
    flex: 1,
  },
  pickerLabel: {
    color: '#4a6a8a',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  pickerValue: {
    color: '#e0eaf5',
    fontSize: 15,
    fontWeight: '600',
  },
  pickerValueGps: {
    color: '#4cd97b',
  },
  pickerValuePlaceholder: {
    color: '#4a6a8a',
    fontWeight: '400',
    fontStyle: 'italic',
  },
  pickerSub: {
    color: '#5a7a9a',
    fontSize: 11,
    marginTop: 1,
  },
  chevron: {
    color: '#3a6a9a',
    fontSize: 26,
    fontWeight: '300',
    marginLeft: 6,
  },
  hintRow: {
    marginTop: 2,
    alignItems: 'center',
  },
  hintText: {
    color: '#3a5a7a',
    fontSize: 11,
    textAlign: 'center',
  },
});
