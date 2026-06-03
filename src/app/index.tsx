import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Geojson, Marker, PROVIDER_GOOGLE } from 'react-native-maps';

// Import dữ liệu
import buildingsData from '../../assets/buildings.json';
import buildingData from '../../assets/campus_buildings.json';
import streetData from '../../assets/streets.json';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <MapView
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
        {/* Layer 1: Khuôn viên */}
        <Geojson
          geojson={buildingData as any}
          strokeColor="#2ecc71"
          fillColor="rgba(46, 204, 113, 0.2)"
          strokeWidth={2}
        />

        {/* Layer 2: Đường đi */}
        <Geojson
          geojson={streetData as any}
          strokeColor="#e74c3c"
          strokeWidth={2}
        />

        {/* Layer 3: Các tòa nhà */}
        <Geojson
          geojson={buildingsData as any}
          strokeColor="yellow" // Đổi thành màu vàng cho rực rỡ
          fillColor="red"      // Nền đỏ để dễ check
          strokeWidth={5}      // Nét cực dày
        />
        <Marker
          coordinate={{ latitude: 11.054120, longitude: 106.664998 }} // Tọa độ tòa nhà
          title="B9"
          description="Trường Đại học Quốc tế Miền Đông"
        />
        <Marker
          coordinate={{ latitude: 11.053615, longitude: 106.665175 }} // Tọa độ tòa nhà
          title="B10"
          description="Trường Đại học Quốc tế Miền Đông"
        /> <Marker
          coordinate={{ latitude: 11.054111, longitude: 106.666735 }} // Tọa độ tòa nhà
          title="B11"
          description="Trường Đại học Quốc tế Miền Đông"
        /> <Marker
          coordinate={{ latitude: 11.054710, longitude: 106.666477 }} // Tọa độ tòa nhà
          title="B8"
          description="Trường Đại học Quốc tế Miền Đông"
        /> <Marker
          coordinate={{ latitude: 11.055053, longitude: 106.667248 }} // Tọa độ tòa nhà
          title="CANTEEN"
          description="Trường Đại học Quốc tế Miền Đông"
        /> <Marker
          coordinate={{ latitude: 11.052054, longitude: 106.667976 }} // Tọa độ tòa nhà
          title="recruit"
          description="Trường Đại học Quốc tế Miền Đông"
        /> <Marker
          coordinate={{ latitude: 11.05399, longitude: 106.667718 }} // Tọa độ tòa nhà
          title="PARKING"
          description="Trường Đại học Quốc tế Miền Đông"
        /> <Marker
          coordinate={{ latitude: 11.053667, longitude: 106.667484 }} // Tọa độ tòa nhà
          title="LIBRARY"
          description="Trường Đại học Quốc tế Miền Đông"
        /> <Marker
          coordinate={{ latitude: 11.05251, longitude: 106.667652 }} // Tọa độ tòa nhà
          title="B3"
          description="Trường Đại học Quốc tế Miền Đông"
        /> <Marker
          coordinate={{ latitude: 11.054900, longitude: 106.664941 }} // Tọa độ tòa nhà
          title="PARKING3"
          description="Trường Đại học Quốc tế Miền Đông"
        /> <Marker
          coordinate={{ latitude: 11.055177, longitude: 106.666398 }} // Tọa độ tòa nhà
          title="PARKING4"
          description="Trường Đại học Quốc tế Miền Đông"
        />
        <Marker
          coordinate={{ latitude: 11.05218, longitude: 106.668420 }} // Tọa độ tòa nhà
          title="PARKING2"
          description="Trường Đại học Quốc tế Miền Đông"
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
});