import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, {
  MapMarker,
  MapType,
  Marker,
  Polygon,
  Polyline,
  PROVIDER_GOOGLE,
} from 'react-native-maps';

import BuildingInfoSheet from '../components/BuildingInfoSheet';
import BuildingPickerModal, { PickerSelection } from '../components/BuildingPickerModal';
import RoutePanel, { RouteOrigin } from '../components/RoutePanel';
import { Building, BUILDINGS } from '../constants/buildings';
import { useLocation } from '../hooks/useLocation';
import { astar, buildGraph, LatLng, snapToGraph } from '../utils/graph';

// Campus boundary polygon coordinates (converted from campus_buildings.json MultiLineString)
const CAMPUS_BOUNDARY = [
  { latitude: 11.054991483556725, longitude: 106.66453416301421 },
  { latitude: 11.055202545925251, longitude: 106.665556842919514 },
  { latitude: 11.055774290480354, longitude: 106.668327441684085 },
  { latitude: 11.049785458647756, longitude: 106.669032924046263 },
  { latitude: 11.050711127692463, longitude: 106.665586731310881 },
  { latitude: 11.051366871561044, longitude: 106.663134315634849 },
  { latitude: 11.052717088613319, longitude: 106.66365772998833 },
  { latitude: 11.054979949440193, longitude: 106.664552698346981 },
];

export default function HomeScreen() {
  const mapRef = useRef<MapView>(null);
  const markerRefs = useRef<Record<string, MapMarker | null>>({});

  // Map type state: hybrid (realistic satellite + labels) or standard
  const [currentMapType, setCurrentMapType] = useState<MapType>('hybrid');

  // Live GPS location
  const { location } = useLocation();

  // Route state
  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);

  // Origin: null = use GPS by default, 'gps' = explicit GPS, Building = a chosen building
  const [origin, setOrigin] = useState<RouteOrigin>(null);
  const [destination, setDestination] = useState<Building | null>(null);

  // Building info sheet — shown when tapping a marker
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);

  // Which picker is open: 'from' | 'to' | null
  const [pickingField, setPickingField] = useState<'from' | 'to' | null>(null);

  // Build the campus road graph once
  const graph = useMemo(() => buildGraph(), []);

  // ── Core routing logic ──────────────────────────────────────────────────────
  const computeRoute = (
    from: RouteOrigin,
    to: Building | null,
  ) => {
    if (!to) return;

    // Resolve start coordinate
    const isGps = from === null || from === 'gps';
    if (isGps && !location) {
      Alert.alert(
        'Location unavailable',
        'Enable location access so the app can compute the route from your position.'
      );
      return;
    }

    const startCoord = isGps
      ? { latitude: location!.latitude, longitude: location!.longitude }
      : { latitude: (from as Building).coordinate.latitude, longitude: (from as Building).coordinate.longitude };

    const startKey = snapToGraph(graph, startCoord.latitude, startCoord.longitude);
    const endKey = snapToGraph(
      graph,
      to.coordinate.latitude,
      to.coordinate.longitude
    );

    const path = astar(graph, startKey, endKey);

    if (!path || path.length === 0) {
      Alert.alert('No path found', 'Could not find a route to this building.');
      return;
    }

    setRouteCoords(path);

    // Zoom to fit the full route with padding
    setTimeout(() => {
      mapRef.current?.fitToCoordinates(path, {
        edgePadding: { top: 80, right: 50, bottom: 260, left: 50 },
        animated: true,
      });
    }, 300);
  };

  // ── Handle building marker tap on map ───────────────────────────────────────
  const handleMarkerPress = (building: Building) => {
    mapRef.current?.animateToRegion(
      {
        latitude: building.coordinate.latitude,
        longitude: building.coordinate.longitude,
        latitudeDelta: 0.006,
        longitudeDelta: 0.006,
      },
      700
    );
    // Open the info sheet — route is only computed when user presses "Chỉ đường"
    setSelectedBuilding(building);
  };

  // ── Handle "Chỉ đường" button in the info sheet ──────────────────────────────
  const handleNavigate = (building: Building) => {
    setSelectedBuilding(null);
    setDestination(building);
    computeRoute(origin, building);
  };

  // ── Picker callbacks ────────────────────────────────────────────────────────
  const handlePickerSelect = (value: PickerSelection) => {
    setPickingField(null);

    if (pickingField === 'from') {
      const newOrigin: RouteOrigin = value === 'gps' ? 'gps' : (value as Building);
      setOrigin(newOrigin);
      // Re-compute if destination already set
      if (destination) computeRoute(newOrigin, destination);
    } else if (pickingField === 'to') {
      const newDest = value as Building;
      setDestination(newDest);
      computeRoute(origin, newDest);

      // Fly to destination building
      mapRef.current?.animateToRegion(
        {
          latitude: newDest.coordinate.latitude,
          longitude: newDest.coordinate.longitude,
          latitudeDelta: 0.003,
          longitudeDelta: 0.003,
        },
        700
      );
    }
  };

  const clearRoute = () => {
    setRouteCoords([]);
    setDestination(null);
    setOrigin(null);
  };

  const toggleMapType = () => {
    setCurrentMapType((prev) => (prev === 'hybrid' ? 'standard' : 'hybrid'));
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        mapType={currentMapType}
        showsBuildings={true}
        showsCompass={true}
        pitchEnabled={true}
        rotateEnabled={true}
        style={styles.map}
        initialCamera={{
          center: {
            latitude: 11.0537,
            longitude: 106.6667,
          },
          pitch: 35,
          heading: 0,
          altitude: 800,
          zoom: 17,
        }}
      >
        {/* Layer 1: Campus boundary — elegant luminous border on satellite */}
        <Polygon
          coordinates={CAMPUS_BOUNDARY}
          strokeWidth={1.5}
          strokeColor="rgba(56, 189, 248, 0.7)"
          fillColor="rgba(56, 189, 248, 0.08)"
          zIndex={1}
        />

        {/* Layer 3: Route polyline — High-contrast Cyan Dashed Walking Trail */}
        {routeCoords.length > 0 && (
          <>
            {/* Dark contrast base */}
            <Polyline
              coordinates={routeCoords}
              strokeColor="#0F172A"
              strokeWidth={6}
              lineCap="round"
              lineJoin="round"
              zIndex={3}
            />
            {/* Luminous Cyan Dashed Trail */}
            <Polyline
              coordinates={routeCoords}
              strokeColor="#00F0FF"
              strokeWidth={4}
              lineDashPattern={[10, 8]}
              lineCap="round"
              lineJoin="round"
              zIndex={4}
            />
          </>
        )}

        {/* Building markers — high-contrast modern glass pills */}
        {BUILDINGS.map((building) => (
          <Marker
            key={building.id}
            ref={(ref) => {
              markerRefs.current[building.id] = ref;
            }}
            coordinate={building.coordinate}
            onPress={() => handleMarkerPress(building)}
            anchor={{ x: 0.5, y: 1 }}
            zIndex={10}
          >
            <View style={[
              styles.badge,
              destination?.id === building.id && styles.badgeActive,
            ]}>
              <Text style={[
                styles.badgeText,
                destination?.id === building.id && styles.badgeTextActive,
              ]}>
                {building.title}
              </Text>
            </View>
          </Marker>
        ))}

        {/* User location — Glowing cyan GPS dot */}
        {location && (
          <Marker
            coordinate={location}
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={999}
          >
            <View style={styles.userDotOuter}>
              <View style={styles.userDotInner} />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Quick Map Layer Toggle FAB */}
      <TouchableOpacity
        style={styles.mapLayerBtn}
        onPress={toggleMapType}
        activeOpacity={0.85}
      >
        <Text style={styles.mapLayerBtnIcon}>
          {currentMapType === 'hybrid' ? '🛰️' : '🗺️'}
        </Text>
        <Text style={styles.mapLayerBtnTxt}>
          {currentMapType === 'hybrid' ? 'Vệ tinh' : 'Bản đồ'}
        </Text>
      </TouchableOpacity>

      {/* Building info sheet — slides up when a marker is tapped */}
      <BuildingInfoSheet
        building={selectedBuilding}
        onNavigate={handleNavigate}
        onClose={() => setSelectedBuilding(null)}
      />

      {/* Route Panel */}
      <RoutePanel
        origin={origin}
        destination={destination}
        hasGps={!!location}
        onPressFrom={() => setPickingField('from')}
        onPressTo={() => setPickingField('to')}
        onClear={clearRoute}
      />

      {/* Building picker modal */}
      <BuildingPickerModal
        visible={pickingField !== null}
        showGpsOption={pickingField === 'from'}
        onSelect={handlePickerSelect}
        onClose={() => setPickingField(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1120' },
  map: { width: '100%', height: '100%' },

  // Layer Switcher Floating Button
  mapLayerBtn: {
    position: 'absolute',
    top: 54,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 6,
    zIndex: 20,
  },
  mapLayerBtnIcon: {
    fontSize: 14,
    marginRight: 5,
  },
  mapLayerBtnTxt: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Custom building badge marker — high contrast on satellite imagery
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: '#0284C7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 4,
    elevation: 6,
  },
  badgeActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  badgeText: {
    color: '#0369A1',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  badgeTextActive: {
    color: '#FFFFFF',
  },

  // "You are here" Glowing Cyan GPS dot
  userDotOuter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0, 229, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 229, 255, 0.6)',
  },
  userDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00E5FF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});