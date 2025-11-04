import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useItems, useDeleteItem, useToggleItem } from '@/src/features/items/hooks/use-items';
import { useList } from '@/src/features/lists/hooks/use-lists';
import { useCategories } from '@/src/features/categories/hooks/use-categories';
import { Item } from '@/src/features/items/types';
import { CreateItemForm } from '@/src/features/items/components/create-item-form';
import { EditItemForm } from '@/src/features/items/components/edit-item-form';
import { MAIN_COLOR, ERROR_COLOR } from '@/src/constants/theme';

// TODO: Replace with actual user ID from authentication
const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001';

export default function ListDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data: list, isLoading: listLoading } = useList(id!, MOCK_USER_ID);
  const { data: items, isLoading: itemsLoading, error } = useItems(id!, MOCK_USER_ID);
  const { data: categories } = useCategories(MOCK_USER_ID);
  const deleteItem = useDeleteItem();
  const toggleItem = useToggleItem();

  // Get all category names (from global categories DB)
  const allCategoryNames = useMemo(() => {
    if (!categories) return [];
    return categories.map(c => c.name);
  }, [categories]);

  // Get unique categories that are actually used in this list's items (for filter chips)
  const usedCategories = useMemo(() => {
    if (!items) return [];
    return Array.from(
      new Set(items.map(i => i.category).filter(cat => cat && cat.trim() !== '')),
    ).sort((a, b) => a?.localeCompare(b ?? '') || 0);
  }, [items]);

  // Filter items by selected category
  const filteredItems = useMemo(() => {
    if (!items) return [];
    if (!categoryFilter) return items;
    return items.filter(item => item.category === categoryFilter);
  }, [items, categoryFilter]);

  const handleToggleCheck = async (item: Item) => {
    try {
      await toggleItem.mutateAsync({ id: item.id, userId: MOCK_USER_ID, listId: id! });
    } catch (_error) {
      Alert.alert('Error', 'Failed to update item');
    }
  };

  const handleDeleteItem = (item: Item) => {
    Alert.alert('Delete Item', `Are you sure you want to delete "${item.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteItem.mutateAsync({ id: item.id, userId: MOCK_USER_ID, listId: id! });
          } catch (_error) {
            Alert.alert('Error', 'Failed to delete item');
          }
        },
      },
    ]);
  };

  if (listLoading || itemsLoading) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <ActivityIndicator size="large" color={MAIN_COLOR} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: 'Error' }} />
        <Text style={styles.errorText}>Error loading items</Text>
        <Text style={styles.errorSubtext}>{error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: list?.title || 'List Details',
          headerBackTitle: 'Lists',
        }}
      />
      {usedCategories.length > 0 && (
        <View style={styles.filterBarWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterBar}
            contentContainerStyle={styles.filterBarContent}
          >
            <TouchableOpacity
              style={[styles.filterChip, !categoryFilter && styles.filterChipActive]}
              onPress={() => setCategoryFilter('')}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterChipText, !categoryFilter && styles.filterChipTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            {usedCategories.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.filterChip, categoryFilter === cat && styles.filterChipActive]}
                onPress={() => setCategoryFilter(cat || '')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    categoryFilter === cat && styles.filterChipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      {!items || filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>
            No items{categoryFilter ? ` in "${categoryFilter}"` : ''}
          </Text>
          <Text style={styles.emptySubtext}>Add your first item to get started</Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => handleToggleCheck(item)}
              >
                <Ionicons
                  name={item.checked ? 'checkbox' : 'square-outline'}
                  size={28}
                  color={item.checked ? MAIN_COLOR : '#ccc'}
                />
              </TouchableOpacity>
              <View style={styles.itemContent}>
                <Text style={[styles.itemTitle, item.checked && styles.itemTitleChecked]}>
                  {item.title}
                </Text>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemQuantity}>
                    {item.quantity} {item.unit || 'unit(s)'}
                  </Text>
                  {item.category && <Text style={styles.itemCategory}>{item.category}</Text>}
                </View>
                {item.notes && <Text style={styles.itemNotes}>{item.notes}</Text>}
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={styles.editIconButton}
                  onPress={() => {
                    setSelectedItem(item);
                    setEditModalVisible(true);
                  }}
                >
                  <Ionicons name="pencil" size={18} color={MAIN_COLOR} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteIconButton}
                  onPress={() => handleDeleteItem(item)}
                >
                  <Ionicons name="trash" size={18} color={ERROR_COLOR} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={() => setCreateModalVisible(true)}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
      <CreateItemForm
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        listId={id!}
        userId={MOCK_USER_ID}
        allCategories={allCategoryNames}
      />
      <EditItemForm
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        userId={MOCK_USER_ID}
        allCategories={allCategoryNames}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#bbb',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: ERROR_COLOR,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  itemTitleChecked: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemQuantity: {
    fontSize: 14,
    color: MAIN_COLOR,
    fontWeight: '500',
  },
  itemCategory: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemNotes: {
    fontSize: 13,
    color: '#666',
    marginTop: 6,
    fontStyle: 'italic',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editIconButton: {
    padding: 8,
  },
  deleteIconButton: {
    padding: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: MAIN_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: MAIN_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  filterBarWrapper: {
    maxHeight: 50,
    flexShrink: 0,
  },
  filterBar: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
  },
  filterBarContent: {
    paddingLeft: 16,
    paddingRight: 16,
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#ededed',
    marginHorizontal: 2,
  },
  filterChipActive: {
    backgroundColor: MAIN_COLOR,
  },
  filterChipText: {
    fontSize: 13,
    color: '#444',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
});
