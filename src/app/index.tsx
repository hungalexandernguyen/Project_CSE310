import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, {
  MapMarker,
  Marker,
  Polygon,
  Polyline,
  PROVIDER_GOOGLE,
} from 'react-native-maps';

import { LinearGradient } from 'expo-linear-gradient';
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
  { latitude: 11.052717088613319, longitude: 106.66365772998833  },
  { latitude: 11.054979949440193, longitude: 106.664552698346981 },
];


export default function HomeScreen() {
  const mapRef = useRef<MapView>(null);
  const markerRefs = useRef<Record<string, MapMarker | null>>({});

  // Live GPS location
  const { location } = useLocation();

  // Route state
  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);

  // Origin: null = use GPS by default, 'gps' = explicit GPS, Building = a chosen building
  const [origin, setOrigin] = useState<RouteOrigin>(null);
  const [destination, setDestination] = useState<Building | null>(null);

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
        latitudeDelta: 0.003,
        longitudeDelta: 0.003,
      },
      700
    );
    setTimeout(() => {
      markerRefs.current[building.id]?.showCallout();
    }, 800);

    // Set as destination and compute route
    const newDest = building;
    setDestination(newDest);
    computeRoute(origin, newDest);
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

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        mapType="standard"
        style={styles.map}
        initialRegion={{
          latitude: 11.0537,
          longitude: 106.6667,
          latitudeDelta: 0.004,
          longitudeDelta: 0.004,
        }}
      >
        {/* Layer 1: Campus boundary — soft fill, no border */}
        <Polygon
          coordinates={CAMPUS_BOUNDARY}
          strokeWidth={0}
          strokeColor="rgba(0,0,0,0)"
          fillColor="rgba(120, 150, 220, 0.13)"
          zIndex={1}
        />

        {/* Layer 3: Route polyline — white border + Google-blue fill (nav style) */}
        {routeCoords.length > 0 && (
          <>
            {/* Shadow / border layer */}
            <Polyline
              coordinates={routeCoords}
              strokeColor="#ffffff"
              strokeWidth={9}
              zIndex={3}
            />
            {/* Main route colour */}
            <Polyline
              coordinates={routeCoords}
              strokeColor="#1A73E8"
              strokeWidth={5}
              zIndex={4}
            />
          </>
        )}

        {/* Building markers — custom pill badges */}
        {BUILDINGS.map((building) => (
          <Marker
            key={building.id}
            ref={(ref) => {
              markerRefs.current[building.id] = ref;
            }}
            coordinate={building.coordinate}
            title={building.label}
            description={building.description}
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

        {/* User location — Google Maps blue dot */}
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

      {/* Vignette overlay — dims outer map edges, focuses attention on campus */}
      <LinearGradient
        colors={['rgba(0,0,0,0.32)', 'transparent']}
        style={styles.vignetteTop}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.32)']}
        style={styles.vignetteBottom}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.22)', 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.vignetteLeft}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.22)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.vignetteRight}
        pointerEvents="none"
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
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },

  // Vignette strips — overlay the map edges
  vignetteTop: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 120,
    zIndex: 5,
  },
  vignetteBottom: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 180,
    zIndex: 5,
  },
  vignetteLeft: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0,
    width: 80,
    zIndex: 5,
  },
  vignetteRight: {
    position: 'absolute',
    top: 0, bottom: 0, right: 0,
    width: 80,
    zIndex: 5,
  },

  // Custom building badge marker
  badge: {
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1.5,
    borderColor: '#4285F4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  badgeActive: {
    backgroundColor: '#1A73E8',
    borderColor: '#1A73E8',
  },
  badgeText: {
    color: '#1A73E8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  badgeTextActive: {
    color: '#fff',
  },

  // "You are here" Google blue dot
  userDotOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(26, 115, 232, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(26, 115, 232, 0.4)',
  },
  userDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1A73E8',
    borderWidth: 2,
    borderColor: '#fff',
  },
});