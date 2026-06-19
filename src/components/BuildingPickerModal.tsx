import React, { useState } from 'react';
import {
  FlatList,
  Keyboard,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Building, BUILDINGS } from '../constants/buildings';

export type PickerSelection = Building | 'gps';

type Props = {
  visible: boolean;
  showGpsOption?: boolean;   // show "My Location" row at top
  onSelect: (value: PickerSelection) => void;
  onClose: () => void;
};

export default function BuildingPickerModal({
  visible,
  showGpsOption = false,
  onSelect,
  onClose,
}: Props) {
  const [query, setQuery] = useState('');

  const filtered = BUILDINGS.filter(
    (b) =>
      b.label.toLowerCase().includes(query.toLowerCase()) ||
      b.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (value: PickerSelection) => {
    setQuery('');
    Keyboard.dismiss();
    onSelect(value);
  };

  const handleClose = () => {
    setQuery('');
    Keyboard.dismiss();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Select Location</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={styles.searchRow}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search buildings..."
            placeholderTextColor="#8a9bb0"
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="while-editing"
            autoFocus
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            showGpsOption ? (
              <TouchableOpacity
                style={[styles.row, styles.gpsRow]}
                onPress={() => handleSelect('gps')}
                activeOpacity={0.75}
              >
                <View style={[styles.iconBox, styles.gpsIconBox]}>
                  <Text style={styles.rowIcon}>📍</Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowLabel, styles.gpsLabel]}>My Location</Text>
                  <Text style={styles.rowSub}>Use current GPS position</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ) : null
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => handleSelect(item)}
              activeOpacity={0.75}
            >
              <View style={styles.iconBox}>
                <Text style={styles.rowIcon}>🏫</Text>
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>{item.label}</Text>
                <Text style={styles.rowSub}>{item.title}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No buildings found.</Text>
            </View>
          }
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1628',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  headerTitle: {
    color: '#e0eaf5',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1a2d45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#8aabcc',
    fontSize: 16,
    fontWeight: '600',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2d45',
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#2a4a6a',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 46,
    color: '#e0eaf5',
    fontSize: 15,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
  },
  gpsRow: {
    marginBottom: 4,
  },
  iconBox: {
    width: 40,
    height: 40,
    backgroundColor: '#1a3a5c',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  gpsIconBox: {
    backgroundColor: '#1a3d2a',
  },
  rowIcon: {
    fontSize: 18,
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    color: '#e0eaf5',
    fontSize: 15,
    fontWeight: '600',
  },
  gpsLabel: {
    color: '#4cd97b',
  },
  rowSub: {
    color: '#6a90b5',
    fontSize: 12,
    marginTop: 2,
  },
  chevron: {
    color: '#3a6a9a',
    fontSize: 24,
    fontWeight: '300',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  emptyBox: {
    paddingTop: 50,
    alignItems: 'center',
  },
  emptyText: {
    color: '#4a6a8a',
    fontSize: 14,
  },
});
