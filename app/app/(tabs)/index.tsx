import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useLists, useDeleteList } from '@/src/features/lists/hooks/use-lists';
import { ListCard } from '@/src/features/lists/components/list-card';
import { CreateListForm } from '@/src/features/lists/components/create-list-form';
import { EditListForm } from '@/src/features/lists/components/edit-list-form';
import { List } from '@/src/features/lists/types';
import { MAIN_COLOR } from '@/src/constants/theme';

// TODO: Replace with actual user ID from authentication
const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001';

export default function HomeScreen() {
  const router = useRouter();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedList, setSelectedList] = useState<List | null>(null);

  const { data: lists, isLoading, error, refetch } = useLists(MOCK_USER_ID);
  const deleteList = useDeleteList();

  // Refetch lists every time HomeScreen gets focus (comes back from item detail page)
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const handleListPress = (list: List) => {
    router.push(`/list/${list.id}`);
  };

  const handleEditList = (list: List) => {
    setSelectedList(list);
    setEditModalVisible(true);
  };

  const handleDeleteList = (list: List) => {
    Alert.alert('Delete List', `Are you sure you want to delete "${list.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteList.mutateAsync({ id: list.id, userId: MOCK_USER_ID });
          } catch (_error) {
            Alert.alert('Error', 'Failed to delete list');
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={MAIN_COLOR} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error loading lists</Text>
        <Text style={styles.errorSubtext}>{error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Shopping Lists</Text>
        <TouchableOpacity style={styles.createButton} onPress={() => setCreateModalVisible(true)}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {lists && lists.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No lists yet</Text>
          <Text style={styles.emptySubtext}>Create your first shopping list to get started</Text>
        </View>
      ) : (
        <FlatList
          data={lists}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ListCard
              list={item}
              onPress={handleListPress}
              onEdit={item.ownerId === MOCK_USER_ID ? handleEditList : undefined}
              onDelete={item.ownerId === MOCK_USER_ID ? handleDeleteList : undefined}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      <CreateListForm
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        userId={MOCK_USER_ID}
      />

      <EditListForm
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedList(null);
        }}
        list={selectedList}
        userId={MOCK_USER_ID}
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
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  createButton: {
    backgroundColor: MAIN_COLOR,
    width: 38,
    height: 38,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
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
    color: '#ff4444',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
