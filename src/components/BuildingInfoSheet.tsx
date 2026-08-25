import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Building } from '../constants/buildings';
import { INDOOR_MAPS } from '../constants/indoorMaps';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = 280;

// Map building id → icon emoji;
function buildingIcon(id: string): string {
  if (id.startsWith('parking')) return '🅿️';
  if (id === 'canteen') return '🍽️';
  if (id === 'library') return '📚';
  if (id === 'recruit') return '📋';
  return '🏛️';
}

type Props = {
  building: Building | null;
  onNavigate: (building: Building) => void;
  onClose: () => void;
};

export default function BuildingInfoSheet({ building, onNavigate, onClose }: Props) {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  // Track the building that is currently "mounted" in the sheet (so we can animate out first)
  const visibleBuilding = useRef<Building | null>(null);

  useEffect(() => {
    if (building) {
      // New building selected → snap in immediately then slide up
      visibleBuilding.current = building;
      translateY.setValue(SHEET_HEIGHT);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 70,
        friction: 12,
      }).start();
    } else {
      // Dismissed → slide down then clear
      Animated.spring(translateY, {
        toValue: SHEET_HEIGHT,
        useNativeDriver: true,
        tension: 80,
        friction: 14,
      }).start(() => {
        visibleBuilding.current = null;
      });
    }
  }, [building]);

  // Render the last known building so content doesn't disappear during the slide-out animation
  const displayed = building ?? visibleBuilding.current;

  if (!displayed) return null;

  const icon = buildingIcon(displayed.id);

  return (
    // pointerEvents="box-none" lets touches outside the sheet pass through to the map
    <View style={styles.overlay} pointerEvents="box-none">
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY }] }]}
      >
        <View style={styles.sheetInner}>
          {/* ── Handle bar ── */}
          <View style={styles.handleBarWrapper}>
          </View>

          {/* ── Close button ── */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>

          {/* ── Icon + Name ── */}
          <View style={styles.titleRow}>
            <View style={styles.iconBox}>
              <Text style={styles.iconText}>{icon}</Text>
            </View>
            <View style={styles.titleTexts}>
              <Text style={styles.buildingLabel} numberOfLines={1}>
                {displayed.label}
              </Text>
              <View style={styles.badgePill}>
                <Text style={styles.badgePillText}>{displayed.title}</Text>
              </View>
            </View>
          </View>

          {/* ── Description ── */}
          <Text style={styles.description} numberOfLines={2}>
            {displayed.description}
          </Text>


          {/* ── Action Buttons ── */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.navigateBtn]}
              activeOpacity={0.85}
              onPress={() => onNavigate(displayed)}
            >
              <Text style={styles.actionBtnText}>🧭 Routing</Text>
            </TouchableOpacity>

            {!!INDOOR_MAPS[displayed.id] && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.indoorBtn]}
                activeOpacity={0.85}
                onPress={() => router.push({ pathname: '/indoor' as any, params: { buildingId: displayed.id } })}
              >
                <Text style={styles.actionBtnText}>🏢 Sơ đồ trong nhà</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    justifyContent: 'flex-end',
  },

  sheet: {
    height: SHEET_HEIGHT,
    backgroundColor: '#0f1b2d',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 24,
  },

  sheetInner: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // Handle bar
  handleBarWrapper: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handleBar: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2a4a6a',
  },

  // Close button — top right
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1e3550',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#7a9aba',
    fontSize: 14,
    fontWeight: '700',
  },

  // Icon + title row
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#152030',
    borderWidth: 1,
    borderColor: '#1e3550',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconText: {
    fontSize: 26,
  },
  titleTexts: {
    flex: 1,
  },
  buildingLabel: {
    color: '#e0eaf5',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginBottom: 6,
  },
  badgePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#1A73E8',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  badgePillText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Description
  description: {
    color: '#7a9aba',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },

  // Coordinates
  coordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#152030',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#1e3550',
  },
  coordLabel: {
    fontSize: 13,
    marginRight: 6,
  },
  coordText: {
    color: '#5a8aaa',
    fontSize: 12,
    fontFamily: 'monospace' as any,
  },

  // Action Buttons
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 4,
  },
  navigateBtn: {
    backgroundColor: '#1A73E8',
  },
  indoorBtn: {
    backgroundColor: '#34A853',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
