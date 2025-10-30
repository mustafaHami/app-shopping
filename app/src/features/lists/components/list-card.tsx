import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { List } from '../types';
import { ERROR_COLOR, MAIN_COLOR } from '@/src/constants/theme';

interface ListCardProps {
  list: List;
  onPress: (list: List) => void;
  onEdit?: (list: List) => void;
  onDelete?: (list: List) => void;
}

export function ListCard({ list, onPress, onEdit, onDelete }: ListCardProps) {
  const itemCount = list.items?.length ?? 0;
  const createdDate = new Date(list.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(list)} activeOpacity={0.7}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{list.title}</Text>
          <View style={styles.buttonContainer}>
            {onEdit && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={e => {
                  e.stopPropagation();
                  onEdit(list);
                }}
              >
                <Ionicons name="pencil" size={16} color="#fff" />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={e => {
                  e.stopPropagation();
                  onDelete(list);
                }}
              >
                <Ionicons name="trash" size={16} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {list.description && <Text style={styles.description}>{list.description}</Text>}
        <View style={styles.footer}>
          <Text style={styles.itemCount}>{itemCount} items</Text>
          <Text style={styles.date}>{createdDate}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginRight: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 'auto',
  },
  itemCount: {
    fontSize: 13,
    color: MAIN_COLOR,
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: MAIN_COLOR,
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: ERROR_COLOR,
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
