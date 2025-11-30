import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  RefreshControl,
  TextInput,
  Keyboard,
} from 'react-native';
import { useLocalSearchParams, Stack, useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useItems,
  useDeleteItem,
  useToggleItem,
  useCreateItem,
  useUpdateQuantity,
  useUploadItemImage,
} from '@/src/features/items/hooks/use-items';
import { useList } from '@/src/features/lists/hooks/use-lists';
import { useCategories } from '@/src/features/categories/hooks/use-categories';
import { Item } from '@/src/features/items/types';
import { ItemCard } from '@/src/features/items/components/item-card';
import { CreateItemForm } from '@/src/features/items/components/create-item-form';
import { EditItemForm } from '@/src/features/items/components/edit-item-form';
import { ImagePickerModal } from '@/src/features/items/components/image-picker-modal';
import { ImageViewerModal } from '@/src/features/items/components/image-viewer-modal';
import { MAIN_COLOR, ERROR_COLOR } from '@/src/constants/theme';
import { canManageMembers, canCheckItems, canAddEditDeleteItems } from '@/src/utils/permissions';

export default function ListDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [quickAddText, setQuickAddText] = useState('');
  const [purchasedExpanded, setPurchasedExpanded] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [showImagePickerForItem, setShowImagePickerForItem] = useState<Item | null>(null);
  const [viewImageForItem, setViewImageForItem] = useState<Item | null>(null);
  const quickAddInputRef = useRef<TextInput>(null);

  const {
    data: list,
    isLoading: listLoading,
    refetch: refetchList,
    isRefetching: isRefetchingList,
  } = useList(id!);
  const {
    data: items,
    isLoading: itemsLoading,
    error,
    refetch: refetchItems,
    isRefetching: isRefetchingItems,
  } = useItems(id!);
  const { data: categories } = useCategories();
  const deleteItem = useDeleteItem();
  const toggleItem = useToggleItem();
  const createItem = useCreateItem();
  const updateQuantity = useUpdateQuantity();
  const uploadImage = useUploadItemImage();

  // Auto-focus quick add field when screen loads (only once on mount)
  useFocusEffect(
    useCallback(() => {
      if (canAddEditDeleteItems(list)) {
        setTimeout(() => quickAddInputRef.current?.focus(), 300);
      }
      // Don't refetch - let React Query's staleTime handle when to fetch
      // Users can pull-to-refresh manually if they want fresh data
    }, [list]),
  );

  const handleRefresh = useCallback(() => {
    refetchList();
    refetchItems();
  }, [refetchList, refetchItems]);

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

  // Separate unchecked and checked items
  const uncheckedItems = useMemo(() => {
    return filteredItems.filter(item => !item.checked);
  }, [filteredItems]);

  const checkedItems = useMemo(() => {
    return filteredItems.filter(item => item.checked);
  }, [filteredItems]);

  const handleToggleCheck = async (item: Item) => {
    if (!canCheckItems(list)) {
      Alert.alert('Permission Denied', 'You do not have permission to check/uncheck items');
      return;
    }
    try {
      await toggleItem.mutateAsync({ id: item.id, listId: id! });
    } catch {
      Alert.alert('Error', 'Failed to update item');
    }
  };

  const handleDeleteItem = (item: Item) => {
    if (!canAddEditDeleteItems(list)) {
      Alert.alert('Permission Denied', 'You do not have permission to delete items');
      return;
    }
    Alert.alert('Delete Item', `Are you sure you want to delete "${item.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteItem.mutateAsync({ id: item.id, listId: id! });
          } catch {
            Alert.alert('Error', 'Failed to delete item');
          }
        },
      },
    ]);
  };

  const handleQuickAdd = async () => {
    if (!quickAddText.trim()) return;

    try {
      await createItem.mutateAsync({
        listId: id!,
        title: quickAddText.trim(),
        quantity: 1,
      });
      setQuickAddText('');
      Keyboard.dismiss();
      quickAddInputRef.current?.focus();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add item');
    }
  };

  const handleQuickAddDetails = () => {
    if (!quickAddText.trim()) {
      Alert.alert('Enter Item Name', 'Please enter an item name first');
      return;
    }
    // Set the quick add text as the selected item title for the modal
    setSelectedItem({
      id: '',
      title: quickAddText.trim(),
      quantity: 1,
      listId: id!,
      checked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any);
    setEditModalVisible(true);
    setQuickAddText('');
  };

  const handleIncreaseQuantity = (item: Item) => {
    setUpdatingItemId(item.id);
    updateQuantity.mutate(
      {
        id: item.id,
        quantity: item.quantity + 1,
        listId: id!,
      },
      {
        onSettled: () => {
          setUpdatingItemId(null);
        },
      },
    );
  };

  const handleDecreaseQuantity = (item: Item) => {
    if (item.quantity <= 1) return;
    setUpdatingItemId(item.id);
    updateQuantity.mutate(
      {
        id: item.id,
        quantity: item.quantity - 1,
        listId: id!,
      },
      {
        onSettled: () => {
          setUpdatingItemId(null);
        },
      },
    );
  };

  const handleImagePlaceholderPress = (item: Item) => {
    setShowImagePickerForItem(item);
  };

  const handleImagePress = (item: Item) => {
    setViewImageForItem(item);
  };

  const handleImageSelected = async (uri: string) => {
    if (!showImagePickerForItem) return;

    try {
      await uploadImage.mutateAsync({
        id: showImagePickerForItem.id,
        imageUri: uri,
        listId: id!,
      });
      setShowImagePickerForItem(null);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to upload image');
    }
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: list?.title || 'List Details',
            headerBackTitle: 'Lists',
            headerRight: () =>
              canManageMembers(list) ? (
                <TouchableOpacity
                  onPress={() => {
                    router.push(`/list/${id}/members`);
                  }}
                  style={{ marginRight: 8 }}
                >
                  <Ionicons name="people" size={24} color={MAIN_COLOR} />
                </TouchableOpacity>
              ) : null,
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
                <Text
                  style={[styles.filterChipText, !categoryFilter && styles.filterChipTextActive]}
                >
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

        {/* Quick Add - Always visible when user can edit */}
        {canAddEditDeleteItems(list) && (
          <View style={styles.quickAddContainer}>
            <Ionicons name="cart-outline" size={20} color="#999" style={styles.quickAddIcon} />
            <TextInput
              ref={quickAddInputRef}
              style={styles.quickAddInput}
              placeholder="Add item..."
              placeholderTextColor="#999"
              value={quickAddText}
              onChangeText={setQuickAddText}
              onSubmitEditing={handleQuickAdd}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[
                styles.quickAddDetailsButton,
                !quickAddText.trim() && styles.quickAddDetailsButtonDisabled,
              ]}
              onPress={handleQuickAddDetails}
              disabled={!quickAddText.trim()}
              activeOpacity={0.6}
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={20}
                color={!quickAddText.trim() ? '#ccc' : MAIN_COLOR}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.quickAddButton,
                (!quickAddText.trim() || createItem.isPending) && styles.quickAddButtonDisabled,
              ]}
              onPress={handleQuickAdd}
              disabled={!quickAddText.trim() || createItem.isPending}
              activeOpacity={0.6}
            >
              {createItem.isPending ? (
                <ActivityIndicator size="small" color={MAIN_COLOR} />
              ) : (
                <Ionicons name="add" size={22} color={MAIN_COLOR} />
              )}
            </TouchableOpacity>
          </View>
        )}

        {!items || filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              No items{categoryFilter ? ` in "${categoryFilter}"` : ''}
            </Text>
            <Text style={styles.emptySubtext}>
              {canAddEditDeleteItems(list)
                ? 'Use the field above to add your first item'
                : 'No items in this list yet'}
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefetchingList || isRefetchingItems}
                onRefresh={handleRefresh}
                tintColor={MAIN_COLOR}
                colors={[MAIN_COLOR]}
              />
            }
          >
            {/* Unchecked items */}
            {uncheckedItems.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onToggleCheck={handleToggleCheck}
                onEdit={
                  canAddEditDeleteItems(list)
                    ? () => {
                        setSelectedItem(item);
                        setEditModalVisible(true);
                      }
                    : undefined
                }
                onDelete={canAddEditDeleteItems(list) ? handleDeleteItem : undefined}
                onIncreaseQuantity={
                  canAddEditDeleteItems(list) ? handleIncreaseQuantity : undefined
                }
                onDecreaseQuantity={
                  canAddEditDeleteItems(list) ? handleDecreaseQuantity : undefined
                }
                onImagePlaceholderPress={
                  canAddEditDeleteItems(list) ? handleImagePlaceholderPress : undefined
                }
                onImagePress={handleImagePress}
                canCheck={canCheckItems(list)}
                canEdit={canAddEditDeleteItems(list)}
                isUpdatingQuantity={updatingItemId === item.id}
              />
            ))}

            {/* Purchased items section */}
            {checkedItems.length > 0 && (
              <View style={styles.purchasedSection}>
                <TouchableOpacity
                  style={styles.purchasedHeader}
                  onPress={() => setPurchasedExpanded(!purchasedExpanded)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.purchasedHeaderText}>Purchased ({checkedItems.length})</Text>
                  <Ionicons
                    name={purchasedExpanded ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
                {purchasedExpanded &&
                  checkedItems.map(item => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      onToggleCheck={handleToggleCheck}
                      onEdit={
                        canAddEditDeleteItems(list)
                          ? () => {
                              setSelectedItem(item);
                              setEditModalVisible(true);
                            }
                          : undefined
                      }
                      onDelete={canAddEditDeleteItems(list) ? handleDeleteItem : undefined}
                      onIncreaseQuantity={
                        canAddEditDeleteItems(list) ? handleIncreaseQuantity : undefined
                      }
                      onDecreaseQuantity={
                        canAddEditDeleteItems(list) ? handleDecreaseQuantity : undefined
                      }
                      onImagePlaceholderPress={
                        canAddEditDeleteItems(list) ? handleImagePlaceholderPress : undefined
                      }
                      onImagePress={handleImagePress}
                      canCheck={canCheckItems(list)}
                      canEdit={canAddEditDeleteItems(list)}
                      isUpdatingQuantity={updatingItemId === item.id || isRefetchingItems}
                    />
                  ))}
              </View>
            )}
          </ScrollView>
        )}
        {canAddEditDeleteItems(list) && (
          <TouchableOpacity style={styles.fab} onPress={() => setCreateModalVisible(true)}>
            <Ionicons name="add" size={32} color="#fff" />
          </TouchableOpacity>
        )}
        <CreateItemForm
          visible={createModalVisible}
          onClose={() => setCreateModalVisible(false)}
          listId={id!}
          allCategories={allCategoryNames}
        />
        <EditItemForm
          visible={editModalVisible}
          onClose={() => {
            setEditModalVisible(false);
            setSelectedItem(null);
          }}
          item={selectedItem}
          allCategories={allCategoryNames}
        />
        <ImagePickerModal
          visible={!!showImagePickerForItem}
          onClose={() => setShowImagePickerForItem(null)}
          onImageSelected={handleImageSelected}
        />
        <ImageViewerModal
          visible={!!viewImageForItem}
          imageUrl={viewImageForItem?.imageUrl || null}
          itemTitle={viewImageForItem?.title}
          onClose={() => setViewImageForItem(null)}
        />
      </View>
    </GestureHandlerRootView>
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
  scrollView: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
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
  quickAddContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    shadowColor: MAIN_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: '#f0f0f0',
  },
  quickAddIcon: {
    marginRight: 14,
    opacity: 0.6,
  },
  quickAddInput: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
    paddingVertical: 8,
    fontWeight: '500',
  },
  quickAddDetailsButton: {
    backgroundColor: '#f5f5f5',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  quickAddDetailsButtonDisabled: {
    backgroundColor: '#fafafa',
    opacity: 0.5,
  },
  quickAddButton: {
    backgroundColor: '#f5f5f5',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  quickAddButtonDisabled: {
    backgroundColor: '#e8e8e8',
    opacity: 0.5,
  },
  purchasedSection: {
    marginTop: 16,
  },
  purchasedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  purchasedHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});
