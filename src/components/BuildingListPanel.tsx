import React, { useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Building, BUILDINGS } from '../constants/buildings';

type Props = {
  onSelect: (building: Building) => void;
};

const PANEL_HEIGHT = 420;
const COLLAPSED_HEIGHT = 52;

export default function BuildingListPanel({ onSelect }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const animHeight = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;

  const filtered = BUILDINGS.filter(
    (b) =>
      b.label.toLowerCase().includes(query.toLowerCase()) ||
      b.title.toLowerCase().includes(query.toLowerCase())
  );

  const toggle = () => {
    const toValue = expanded ? COLLAPSED_HEIGHT : PANEL_HEIGHT;
    Animated.spring(animHeight, {
      toValue,
      useNativeDriver: false,
      bounciness: 4,
    }).start();
    setExpanded(!expanded);
    if (expanded) {
      Keyboard.dismiss();
      setQuery('');
    }
  };

  const handleSelect = (building: Building) => {
    // Collapse panel first
    Animated.spring(animHeight, {
      toValue: COLLAPSED_HEIGHT,
      useNativeDriver: false,
      bounciness: 4,
    }).start();
    setExpanded(false);
    Keyboard.dismiss();
    setQuery('');
    onSelect(building);
  };

  return (
    <Animated.View style={[styles.panel, { height: animHeight }]}>
      {/* Handle / Header */}
      <TouchableOpacity onPress={toggle} style={styles.handle} activeOpacity={0.8}>
        <View style={styles.handleBar} />
        <Text style={styles.handleTitle}>
          {expanded ? '▼  Buildings' : '▲  Browse Buildings'}
        </Text>
      </TouchableOpacity>

      {/* Body — only rendered when expanded */}
      {expanded && (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.body}>
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
              />
            </View>

            {/* List */}
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.rowIconBox}>
                    <Text style={styles.rowIcon}>📍</Text>
                  </View>
                  <View style={styles.rowText}>
                    <Text style={styles.rowLabel}>{item.label}</Text>
                    <Text style={styles.rowTitle}>{item.title}</Text>
                  </View>
                  <Text style={styles.rowChevron}>›</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>No buildings found.</Text>
                </View>
              }
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </TouchableWithoutFeedback>
      )}
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 16,
    overflow: 'hidden',
  },
  handle: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#3a5a80',
    borderRadius: 2,
    marginBottom: 6,
  },
  handleTitle: {
    color: '#e0eaf5',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2d45',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a4a6a',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 42,
    color: '#e0eaf5',
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowIconBox: {
    width: 36,
    height: 36,
    backgroundColor: '#1a3a5c',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowIcon: {
    fontSize: 16,
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    color: '#e0eaf5',
    fontSize: 15,
    fontWeight: '600',
  },
  rowTitle: {
    color: '#6a90b5',
    fontSize: 12,
    marginTop: 1,
  },
  rowChevron: {
    color: '#3a6a9a',
    fontSize: 22,
    fontWeight: '300',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  emptyBox: {
    paddingTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#4a6a8a',
    fontSize: 14,
  },
});
