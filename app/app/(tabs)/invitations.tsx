import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Animated,
} from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMyInvitations, useUpdateInvitation } from '@/src/features/members/hooks/use-members';
import {
  PRIMARY_COLOR,
  SECONDARY_COLOR,
  ERROR_COLOR,
  ACCENT_YELLOW,
  ACCENT_ORANGE,
  BG_TINT_PRIMARY,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_MUTED,
  BorderRadius,
  Shadows,
  Spacing,
} from '@/src/constants/theme';
import type { Invitation } from '@/src/features/members/types';
import { RoleBadge } from '@/src/components/ui/RoleBadge';

function InvitationCard({
  item,
  onAccept,
  onDecline,
  isUpdating,
}: {
  item: Invitation;
  onAccept: () => void;
  onDecline: () => void;
  isUpdating: boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isPending = item.status === 'PENDING';

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.invitationCard, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity activeOpacity={1} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, isPending && styles.iconContainerPending]}>
            <Ionicons
              name={isPending ? 'mail-unread' : 'mail'}
              size={24}
              color={isPending ? PRIMARY_COLOR : TEXT_MUTED}
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
              onPress={onAccept}
              disabled={isUpdating}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.declineButton}
              onPress={onDecline}
              disabled={isUpdating}
              activeOpacity={0.8}
            >
              <Ionicons name="close-circle" size={20} color={ERROR_COLOR} />
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

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

  const renderInvitation = ({ item }: { item: Invitation }) => (
    <InvitationCard
      item={item}
      onAccept={() => handleAccept(item)}
      onDecline={() => handleDecline(item)}
      isUpdating={updateInvitation.isPending}
    />
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: 'Invitations', headerShown: true }} />
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
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
          <View style={styles.emptyIconWrapper}>
            <Ionicons name="mail-outline" size={48} color={PRIMARY_COLOR} />
          </View>
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
              tintColor={PRIMARY_COLOR}
              colors={[PRIMARY_COLOR]}
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
    backgroundColor: BG_TINT_PRIMARY,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG_TINT_PRIMARY,
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
  listContent: {
    padding: Spacing.md,
  },
  invitationCard: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.medium,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  iconContainerPending: {
    backgroundColor: `${PRIMARY_COLOR}20`,
  },
  cardContent: {
    flex: 1,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: Spacing.sm,
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
    borderRadius: BorderRadius.sm,
  },
  statusBadgePending: {
    backgroundColor: `${ACCENT_ORANGE}30`,
  },
  statusBadgeAccepted: {
    backgroundColor: `${PRIMARY_COLOR}30`,
  },
  statusBadgeDeclined: {
    backgroundColor: '#f5f5f5',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadgeTextPending: {
    color: '#c47800',
  },
  statusBadgeTextAccepted: {
    color: '#2a7a4e',
  },
  statusBadgeTextDeclined: {
    color: TEXT_MUTED,
  },
  dateText: {
    fontSize: 13,
    color: TEXT_MUTED,
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
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    gap: 6,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
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
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: ERROR_COLOR,
  },
});
