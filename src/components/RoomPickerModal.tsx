/**
 * RoomPickerModal.tsx
 * Modal chọn phòng: hiển thị danh sách group theo tầng + ô search lọc nhanh
 */

import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SectionList,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import { IndoorNode } from '../utils/indoor_graph';
import { getRoomsByBuilding, RoomSection } from '../utils/roomList';

interface Props {
  visible: boolean;
  buildingId: string;
  title: string;                        // "Chọn phòng xuất phát" / "Chọn phòng đích"
  excludeRoomId?: string;               // Ẩn phòng đang được chọn ở ô kia
  onSelect: (room: IndoorNode) => void;
  onClose: () => void;
}

export default function RoomPickerModal({
  visible,
  buildingId,
  title,
  excludeRoomId,
  onSelect,
  onClose,
}: Props) {
  const [query, setQuery] = useState('');

  // Lấy danh sách phòng theo tòa
  const sections: RoomSection[] = useMemo(
    () => getRoomsByBuilding(buildingId),
    [buildingId]
  );

  // Lọc theo search query
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sections
      .map((sec) => ({
        ...sec,
        data: sec.rooms.filter((r) => {
          if (r.id === excludeRoomId) return false;
          if (!q) return true;
          return (r.label ?? r.id).toLowerCase().includes(q);
        }),
      }))
      .filter((sec) => sec.data.length > 0);
  }, [sections, query, excludeRoomId]);

  const handleSelect = (room: IndoorNode) => {
    onSelect(room);
    setQuery('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Search bar */}
          <View style={styles.searchWrapper}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm phòng..."
              placeholderTextColor="#888"
              value={query}
              onChangeText={setQuery}
              autoFocus={false}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Text style={styles.clearSearch}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Room list */}
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTxt}>Không tìm thấy phòng nào</Text>
            </View>
          ) : (
            <SectionList
              sections={filtered}
              keyExtractor={(item) => item.id}
              renderSectionHeader={({ section }) => (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionLabel}>{section.floorLabel}</Text>
                </View>
              )}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.roomItem}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.roomLabel}>
                    {item.label ?? item.id}
                  </Text>
                  <Text style={styles.roomArrow}>›</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              contentContainerStyle={{ paddingBottom: 24 }}
              stickySectionHeadersEnabled
            />
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  title: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#3A3A3C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeTxt: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    margin: 14,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 4,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 15,
  },
  clearSearch: {
    color: '#888',
    fontSize: 14,
    paddingLeft: 8,
  },
  sectionHeader: {
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  sectionLabel: {
    color: '#FF8D28',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#2C2C2E',
  },
  roomLabel: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '500',
  },
  roomArrow: {
    color: '#888',
    fontSize: 20,
  },
  separator: {
    height: 1,
    backgroundColor: '#1C1C1E',
    marginLeft: 20,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTxt: {
    color: '#888',
    fontSize: 15,
  },
});
