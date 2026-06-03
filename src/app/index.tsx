import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, {
  Geojson,
  MapMarker,
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
} from 'react-native-maps';

import BuildingListPanel from '../components/BuildingListPanel';
import { Building, BUILDINGS } from '../constants/buildings';
import { useLocation } from '../hooks/useLocation';
import { astar, buildGraph, LatLng, snapToGraph } from '../utils/graph';

// Import GeoJSON data
import buildingsData from '../../assets/buildings.json';
import buildingData from '../../assets/campus_buildings.json';
import streetData from '../../assets/streets.json';

export default function HomeScreen() {
  const mapRef = useRef<MapView>(null);
  const markerRefs = useRef<Record<string, MapMarker | null>>({});

  // Live GPS location
  const { location } = useLocation();

  // Route state
  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);
  const [destination, setDestination] = useState<Building | null>(null);

  // Build the campus road graph once (memoised — only rebuilds if streetData changes)
  const graph = useMemo(() => buildGraph(), []);

  // ── Compute A* route and display it ────────────────────────────────────────
  const computeRoute = (building: Building) => {
    if (!location) {
      Alert.alert(
        'Location unavailable',
        'Enable location access so the app can compute the route from your position.'
      );
      return;
    }

    const startKey = snapToGraph(graph, location.latitude, location.longitude);
    const endKey = snapToGraph(
      graph,
      building.coordinate.latitude,
      building.coordinate.longitude
    );

    const path = astar(graph, startKey, endKey);

    if (!path || path.length === 0) {
      Alert.alert('No path found', 'Could not find a route to this building.');
      return;
    }

    setRouteCoords(path);
    setDestination(building);

    // Zoom to fit the full route with padding
    setTimeout(() => {
      mapRef.current?.fitToCoordinates(path, {
        edgePadding: { top: 80, right: 50, bottom: 220, left: 50 },
        animated: true,
      });
    }, 300);
  };

  // ── Building selected from the list panel ──────────────────────────────────
  const handleSelectBuilding = (building: Building) => {
    // Fly camera to the building
    mapRef.current?.animateToRegion(
      {
        latitude: building.coordinate.latitude,
        longitude: building.coordinate.longitude,
        latitudeDelta: 0.003,
        longitudeDelta: 0.003,
      },
      700
    );

    // Show callout after animation
    setTimeout(() => {
      markerRefs.current[building.id]?.showCallout();
    }, 800);

    // Compute and draw the shortest path
    computeRoute(building);
  };

  const clearRoute = () => {
    setRouteCoords([]);
    setDestination(null);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        mapType="hybrid"
        style={styles.map}
        initialRegion={{
          latitude: 11.0528,
          longitude: 106.6744,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* Layer 1: Campus boundary */}
        <Geojson
          geojson={buildingData as any}
          strokeColor="#2ecc71"
          fillColor="rgba(46, 204, 113, 0.2)"
          strokeWidth={2}
          zIndex={1}
        />

        {/* Layer 2: Streets */}
        <Geojson
          geojson={streetData as any}
          strokeColor="#e74c3c"
          strokeWidth={2}
          zIndex={2}
        />

        {/* Layer 3: Route polyline — below buildings so it doesn't bleed through them */}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor="#00aaff"
            strokeWidth={5}
            lineDashPattern={[0]}
            zIndex={3}
          />
        )}

        {/* Layer 4: Building outlines — rendered above the route */}
        <Geojson
          geojson={buildingsData as any}
          strokeColor="yellow"
          fillColor="red"
          strokeWidth={5}
          zIndex={4}
        />

        {/* Building markers */}
        {BUILDINGS.map((building) => (
          <Marker
            key={building.id}
            ref={(ref) => {
              markerRefs.current[building.id] = ref;
            }}
            coordinate={building.coordinate}
            title={building.title}
            description={building.description}
            onPress={() => handleSelectBuilding(building)}
            zIndex={10}
          />
        ))}

        {/* User location — blue dot (always on top) */}
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

      {/* Clear route button */}
      {destination && (
        <TouchableOpacity
          style={styles.clearBtn}
          onPress={clearRoute}
          activeOpacity={0.85}
        >
          <Text style={styles.clearBtnText}>✕  Clear Route</Text>
        </TouchableOpacity>
      )}

      {/* Searchable building list panel */}
      <BuildingListPanel onSelect={handleSelectBuilding} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },

  // "You are here" blue dot
  userDotOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 122, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 122, 255, 0.5)',
  },
  userDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#fff',
  },

  // Clear Route button
  clearBtn: {
    position: 'absolute',
    top: 52,
    alignSelf: 'center',
    backgroundColor: '#ff3b30',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  clearBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});