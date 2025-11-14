import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Animated,
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
import { useCurrentUser, useSignOut } from '@/src/features/auth/hooks/use-auth';

export default function HomeScreen() {
  const router = useRouter();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedList, setSelectedList] = useState<List | null>(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: currentUser } = useCurrentUser();
  const { data: lists, isLoading, error, refetch } = useLists();
  const deleteList = useDeleteList();
  const { mutate: signOut, isPending: isSigningOut } = useSignOut();

  // Animation for search bar
  const searchBarHeight = useRef(new Animated.Value(0)).current;
  const searchBarOpacity = useRef(new Animated.Value(0)).current;

  // Refetch lists every time HomeScreen gets focus (comes back from item detail page)
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  // Filter lists by search query
  const filteredLists = useMemo(() => {
    if (!lists) return [];
    if (!searchQuery.trim()) return lists;
    const query = searchQuery.toLowerCase().trim();
    return lists.filter(list => list.title.toLowerCase().includes(query));
  }, [lists, searchQuery]);

  // Toggle search bar with animation
  const toggleSearch = () => {
    const willShow = !searchVisible;
    setSearchVisible(willShow);

    Animated.parallel([
      Animated.timing(searchBarHeight, {
        toValue: willShow ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(searchBarOpacity, {
        toValue: willShow ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();

    if (!willShow) {
      setSearchQuery('');
    }
  };

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
            await deleteList.mutateAsync({ id: list.id });
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

  const searchBarHeightValue = searchBarHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 60],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ShoppL</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.searchButton} onPress={toggleSearch} activeOpacity={0.7}>
            <Ionicons name={searchVisible ? 'close' : 'search'} size={24} color={MAIN_COLOR} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.createButton} onPress={() => setCreateModalVisible(true)}>
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: '#eee', marginLeft: 8 }]}
            onPress={() => {
              signOut(undefined, {
                onSuccess: () => {
                  router.replace('/sign-in');
                },
                onError: () => {
                  Alert.alert('Error', 'Sign out failed');
                },
              });
            }}
            disabled={isSigningOut}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color="#444" />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.View
        style={[
          styles.searchContainer,
          {
            height: searchBarHeightValue,
            opacity: searchBarOpacity,
          },
        ]}
      >
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search lists by title..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={searchVisible}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {lists && lists.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No lists yet</Text>
          <Text style={styles.emptySubtext}>Create your first shopping list to get started</Text>
        </View>
      ) : filteredLists.length === 0 && searchQuery.trim() ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No lists found</Text>
          <Text style={styles.emptySubtext}>Try a different search term</Text>
        </View>
      ) : (
        <FlatList
          data={filteredLists}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ListCard
              list={item}
              onPress={handleListPress}
              onEdit={item.ownerId === currentUser?.id ? handleEditList : undefined}
              onDelete={item.ownerId === currentUser?.id ? handleDeleteList : undefined}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      <CreateListForm visible={createModalVisible} onClose={() => setCreateModalVisible(false)} />

      <EditListForm
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedList(null);
        }}
        list={selectedList}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchButton: {
    width: 38,
    height: 38,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
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
  searchContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    overflow: 'hidden',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    height: 40,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
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
