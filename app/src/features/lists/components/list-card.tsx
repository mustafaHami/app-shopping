import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { List } from '../types';

interface ListCardProps {
  list: List;
  onPress: (list: List) => void;
  onDelete?: (list: List) => void;
}

export function ListCard({ list, onPress, onDelete }: ListCardProps) {
  const itemCount = list.items?.length ?? 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(list)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{list.title}</Text>
        {list.description && <Text style={styles.description}>{list.description}</Text>}
        <Text style={styles.itemCount}>{itemCount} items</Text>
      </View>
      {onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            onDelete(list);
          }}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  itemCount: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

