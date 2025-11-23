import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMyInvitations, useUpdateInvitation } from '@/src/features/members/hooks/use-members';
import { MAIN_COLOR, ERROR_COLOR } from '@/src/constants/theme';
import type { Invitation } from '@/src/features/members/types';
import { RoleBadge } from '@/src/components/ui/RoleBadge';

export default function InvitationsScreen() {
  const { data: invitations, isLoading, refetch, isRefetching } = useMyInvitations();
  const updateInvitation = useUpdateInvitation();

  // Refetch when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const handleAccept = async (invitation: Invitation) => {
    try {
      await updateInvitation.mutateAsync({
        invitationId: invitation.id,
        data: { status: 'ACCEPTED' },
      });
    } catch (_error: any) {
      Alert.alert('Error', 'Failed to accept invitation');
    }
  };

  const handleDecline = (invitation: Invitation) => {
    Alert.alert(
      'Decline Invitation',
      `Are you sure you want to decline the invitation to "${invitation.list?.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateInvitation.mutateAsync({
                invitationId: invitation.id,
                data: { status: 'DECLINED' },
              });
            } catch (_error: any) {
              Alert.alert('Error', 'Failed to decline invitation');
            }
          },
        },
      ],
    );
  };

  const renderInvitation = ({ item }: { item: Invitation }) => {
    const isPending = item.status === 'PENDING';

    return (
      <View style={styles.invitationCard}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={isPending ? 'mail-unread' : 'mail'}
              size={32}
              color={isPending ? MAIN_COLOR : '#999'}
            />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.listTitle}>{item.list?.title || 'Untitled List'}</Text>
            <View style={styles.metaRow}>
              <RoleBadge role={item.role} />
              <View
                style={[
                  styles.statusBadge,
                  item.status === 'PENDING' && styles.statusBadgePending,
                  item.status === 'ACCEPTED' && styles.statusBadgeAccepted,
                  item.status === 'DECLINED' && styles.statusBadgeDeclined,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    item.status === 'PENDING' && styles.statusBadgeTextPending,
                    item.status === 'ACCEPTED' && styles.statusBadgeTextAccepted,
                    item.status === 'DECLINED' && styles.statusBadgeTextDeclined,
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </View>
            <Text style={styles.dateText}>
              {new Date(item.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {isPending && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => handleAccept(item)}
              disabled={updateInvitation.isPending}
            >
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.declineButton}
              onPress={() => handleDecline(item)}
              disabled={updateInvitation.isPending}
            >
              <Ionicons name="close-circle" size={20} color={ERROR_COLOR} />
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: 'Invitations', headerShown: true }} />
        <ActivityIndicator size="large" color={MAIN_COLOR} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Invitations',
          headerShown: true,
        }}
      />
      {!invitations || invitations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="mail-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No invitations</Text>
          <Text style={styles.emptySubtext}>
            You&apos;ll see invitations here when someone shares a list with you
          </Text>
        </View>
      ) : (
        <FlatList
          data={invitations}
          keyExtractor={item => item.id}
          renderItem={renderInvitation}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={MAIN_COLOR}
              colors={[MAIN_COLOR]}
            />
          }
        />
      )}
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
  listContent: {
    padding: 16,
  },
  invitationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusBadgePending: {
    backgroundColor: '#FFF4E6',
  },
  statusBadgeAccepted: {
    backgroundColor: '#E8F5E9',
  },
  statusBadgeDeclined: {
    backgroundColor: '#FAFAFA',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusBadgeTextPending: {
    color: '#F57C00',
  },
  statusBadgeTextAccepted: {
    color: '#388E3C',
  },
  statusBadgeTextDeclined: {
    color: '#999',
  },
  dateText: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MAIN_COLOR,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  declineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: ERROR_COLOR,
  },
});
