import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLists, useDeleteList } from '@/src/features/lists/hooks/use-lists';
import { ListCard } from '@/src/features/lists/components/list-card';
import { CreateListForm } from '@/src/features/lists/components/create-list-form';
import { EditListForm } from '@/src/features/lists/components/edit-list-form';
import { List } from '@/src/features/lists/types';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '@/src/constants/api';

// TODO: Replace with actual user ID from authentication
const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001';

export default function HomeScreen() {
  const router = useRouter();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedList, setSelectedList] = useState<List | null>(null);

  const { data: lists, isLoading, error } = useLists(MOCK_USER_ID);
  const deleteList = useDeleteList();

  useEffect(() => {
    console.log('API Base URL:', API_BASE_URL);
    console.log('Mock User ID:', MOCK_USER_ID);
  }, []);

  const handleListPress = (list: List) => {
    // Navigate to list details screen (to be implemented)
    Alert.alert('List Selected', `Selected: ${list.title}`);
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
            Alert.alert('Success', 'List deleted successfully');
          } catch (error) {
            Alert.alert('Error', 'Failed to delete list');
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
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
          <Text style={styles.createButtonText}>+ New List</Text>
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
            <View>
              <ListCard
                list={item}
                onPress={handleListPress}
                onDelete={item.ownerId === MOCK_USER_ID ? handleDeleteList : undefined}
              />
              {item.ownerId === MOCK_USER_ID && (
                <TouchableOpacity style={styles.editButton} onPress={() => handleEditList(item)}>
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>
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
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  editButton: {
    position: 'absolute',
    right: 80,
    top: 16,
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
