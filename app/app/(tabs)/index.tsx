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
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useLists, useDeleteList } from '@/src/features/lists/hooks/use-lists';
import { ListCard } from '@/src/features/lists/components/list-card';
import { CreateListForm } from '@/src/features/lists/components/create-list-form';
import { EditListForm } from '@/src/features/lists/components/edit-list-form';
import { List } from '@/src/features/lists/types';
import {
  PRIMARY_COLOR,
  SECONDARY_COLOR,
  BG_TINT_PRIMARY,
  TEXT_PRIMARY,
  TEXT_MUTED,
  BorderRadius,
  Spacing,
  Shadows,
  Gradients,
} from '@/src/constants/theme';
import { useCurrentUser, useSignOut } from '@/src/features/auth/hooks/use-auth';

type ListFilter = 'all' | 'my' | 'shared';

export default function HomeScreen() {
  const router = useRouter();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedList, setSelectedList] = useState<List | null>(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [listFilter, setListFilter] = useState<ListFilter>('all');

  const { data: currentUser } = useCurrentUser();
  const { data: lists, isLoading, error, refetch, isRefetching } = useLists();
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

  // Handle pull-to-refresh
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Filter lists by search query and filter type
  const filteredLists = useMemo(() => {
    if (!lists) return [];

    // First filter by ownership
    let filtered = lists;
    if (listFilter === 'my') {
      filtered = lists.filter(list => list.userRole === 'OWNER');
    } else if (listFilter === 'shared') {
      filtered = lists.filter(list => list.userRole === 'READER' || list.userRole === 'WRITER');
    }

    // Then filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(list => list.title.toLowerCase().includes(query));
    }

    return filtered;
  }, [lists, searchQuery, listFilter]);

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
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <LinearGradient
          colors={Gradients.authBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Shoply</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={toggleSearch}
              activeOpacity={0.7}
            >
              <Ionicons name={searchVisible ? 'close' : 'search'} size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setCreateModalVisible(true)}
            >
              <Ionicons name="add" size={28} color={PRIMARY_COLOR} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.logoutButton}
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
              <Ionicons name="log-out-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Filter Tabs */}
        <View style={styles.filterTabsContainer}>
          <TouchableOpacity
            style={[styles.filterTab, listFilter === 'all' && styles.filterTabActive]}
            onPress={() => setListFilter('all')}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.filterTabText, listFilter === 'all' && styles.filterTabTextActive]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, listFilter === 'my' && styles.filterTabActive]}
            onPress={() => setListFilter('my')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterTabText, listFilter === 'my' && styles.filterTabTextActive]}>
              My Lists
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, listFilter === 'shared' && styles.filterTabActive]}
            onPress={() => setListFilter('shared')}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.filterTabText, listFilter === 'shared' && styles.filterTabTextActive]}
            >
              Shared
            </Text>
          </TouchableOpacity>
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
            <Ionicons name="search" size={20} color={TEXT_MUTED} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search lists by title..."
              placeholderTextColor={TEXT_MUTED}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={searchVisible}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color={TEXT_MUTED} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {lists && lists.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrapper}>
              <Ionicons name="list-outline" size={48} color={PRIMARY_COLOR} />
            </View>
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
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={handleRefresh}
                tintColor={PRIMARY_COLOR}
                colors={[PRIMARY_COLOR]}
              />
            }
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
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_TINT_PRIMARY,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG_TINT_PRIMARY,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Shadows.medium,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  createButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: '#f8f8f8',
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: TEXT_PRIMARY,
    height: 40,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  filterTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: PRIMARY_COLOR,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  filterTabTextActive: {
    color: '#fff',
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
  emptyIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${PRIMARY_COLOR}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '600',
    color: TEXT_MUTED,
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
    color: TEXT_MUTED,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
