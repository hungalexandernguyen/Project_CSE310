import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Geojson, MapMarker, Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import BuildingListPanel from '../components/BuildingListPanel';
import { Building, BUILDINGS } from '../constants/buildings';

// Import GeoJSON data
import buildingsData from '../../assets/buildings.json';
import buildingData from '../../assets/campus_buildings.json';
import streetData from '../../assets/streets.json';

export default function HomeScreen() {
  const mapRef = useRef<MapView>(null);
  // Store a ref for each marker so we can call showCallout()
  const markerRefs = useRef<Record<string, MapMarker | null>>({});

  const handleSelectBuilding = (building: Building) => {
    // 1. Fly camera to the selected building
    mapRef.current?.animateToRegion(
      {
        latitude: building.coordinate.latitude,
        longitude: building.coordinate.longitude,
        latitudeDelta: 0.003,
        longitudeDelta: 0.003,
      },
      700
    );

    // 2. Show the marker callout after the animation settles
    setTimeout(() => {
      markerRefs.current[building.id]?.showCallout();
    }, 800);
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
        />

        {/* Layer 2: Streets */}
        <Geojson
          geojson={streetData as any}
          strokeColor="#e74c3c"
          strokeWidth={2}
        />

        {/* Layer 3: Building outlines */}
        <Geojson
          geojson={buildingsData as any}
          strokeColor="yellow"
          fillColor="red"
          strokeWidth={5}
        />

        {/* Markers — generated from BUILDINGS constant */}
        {BUILDINGS.map((building) => (
          <Marker
            key={building.id}
            ref={(ref) => { markerRefs.current[building.id] = ref; }}
            coordinate={building.coordinate}
            title={building.title}
            description={building.description}
          />
        ))}
      </MapView>

      {/* Searchable building list panel */}
      <BuildingListPanel onSelect={handleSelectBuilding} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
});