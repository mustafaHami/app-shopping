import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  ScrollView,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  useListMembers,
  useSendInvitation,
  useUpdateMemberRole,
  useRemoveMember,
  useCancelInvitation,
} from '@/src/features/members/hooks/use-members';
import {
  PRIMARY_COLOR,
  SECONDARY_COLOR,
  ERROR_COLOR,
  ACCENT_ORANGE,
  BG_TINT_PRIMARY,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_MUTED,
  BorderRadius,
  Shadows,
  Spacing,
} from '@/src/constants/theme';
import type { ListMember, Invitation } from '@/src/features/members/types';
import { RoleBadge } from '@/src/components/ui/RoleBadge';

export default function MembersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteePseudonym, setInviteePseudonym] = useState('');
  const [selectedRole, setSelectedRole] = useState<'READER' | 'WRITER'>('READER');

  // FAB animation
  const fabScale = useRef(new Animated.Value(1)).current;

  const { data: membersData, isLoading, refetch, isRefetching } = useListMembers(id!);
  const sendInvitation = useSendInvitation();
  const updateMemberRole = useUpdateMemberRole();
  const removeMember = useRemoveMember();
  const cancelInvitation = useCancelInvitation();

  const handleFabPressIn = () => {
    Animated.spring(fabScale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handleFabPressOut = () => {
    Animated.spring(fabScale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleSendInvitation = async () => {
    if (!inviteePseudonym.trim()) {
      Alert.alert('Error', 'Please enter a pseudonym');
      return;
    }

    try {
      await sendInvitation.mutateAsync({
        listId: id!,
        data: { inviteePseudonym, role: selectedRole },
      });
      setInviteModalVisible(false);
      setInviteePseudonym('');
      setSelectedRole('READER');
    } catch (_error: any) {
      Alert.alert('Error', _error.message || 'Failed to send invitation');
    }
  };

  const handleChangeRole = (member: ListMember) => {
    const newRole = member.role === 'READER' ? 'WRITER' : 'READER';
    Alert.alert('Change Role', `Change role from ${member.role} to ${newRole}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Change',
        onPress: async () => {
          try {
            await updateMemberRole.mutateAsync({
              listId: id!,
              memberId: member.id,
              data: { role: newRole },
            });
          } catch (_error: any) {
            Alert.alert('Error', 'Failed to change role');
          }
        },
      },
    ]);
  };

  const handleRemoveMember = (member: ListMember) => {
    Alert.alert('Remove Member', `Are you sure you want to remove this member?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeMember.mutateAsync({ listId: id!, memberId: member.id });
            Alert.alert('Success', 'Member removed');
          } catch (_error: any) {
            Alert.alert('Error', 'Failed to remove member');
          }
        },
      },
    ]);
  };

  const handleCancelInvitation = (invitation: Invitation) => {
    Alert.alert('Cancel Invitation', `Cancel invitation to ${invitation.inviteePseudonym}?`, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelInvitation.mutateAsync({ listId: id!, invitationId: invitation.id });
          } catch (_error: any) {
            Alert.alert('Error', 'Failed to cancel invitation');
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: 'Members' }} />
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Members',
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={PRIMARY_COLOR}
            colors={[PRIMARY_COLOR]}
          />
        }
      >
        {/* Members Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Members</Text>
          {membersData?.members && membersData.members.length > 0 ? (
            membersData.members.map(member => (
              <View key={member.id} style={styles.card}>
                <View style={styles.cardContent}>
                  <View style={styles.personIconWrapper}>
                    <Ionicons name="person" size={20} color={PRIMARY_COLOR} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardEmail}>{member.userPseudonym}</Text>
                    <RoleBadge role={member.role} />
                  </View>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleChangeRole(member)}
                  >
                    <Ionicons name="swap-horizontal" size={20} color={PRIMARY_COLOR} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleRemoveMember(member)}
                  >
                    <Ionicons name="trash" size={20} color={ERROR_COLOR} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No members yet</Text>
          )}
        </View>

        {/* Invitations Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invitations</Text>
          {membersData?.invitations && membersData.invitations.length > 0 ? (
            membersData.invitations.map(invitation => (
              <View key={invitation.id} style={styles.card}>
                <View style={styles.cardContent}>
                  <View
                    style={[
                      styles.mailIconWrapper,
                      invitation.status === 'PENDING' && styles.mailIconWrapperPending,
                      invitation.status === 'ACCEPTED' && styles.mailIconWrapperAccepted,
                    ]}
                  >
                    <Ionicons
                      name="mail"
                      size={20}
                      color={
                        invitation.status === 'PENDING'
                          ? ACCENT_ORANGE
                          : invitation.status === 'ACCEPTED'
                            ? PRIMARY_COLOR
                            : TEXT_MUTED
                      }
                    />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardEmail}>{invitation.inviteePseudonym}</Text>
                    <View style={styles.invitationMeta}>
                      <RoleBadge role={invitation.role} />
                      <View
                        style={[
                          styles.statusBadge,
                          invitation.status === 'PENDING' && styles.statusBadgePending,
                          invitation.status === 'ACCEPTED' && styles.statusBadgeAccepted,
                          invitation.status === 'DECLINED' && styles.statusBadgeDeclined,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            invitation.status === 'PENDING' && styles.statusBadgeTextPending,
                            invitation.status === 'ACCEPTED' && styles.statusBadgeTextAccepted,
                            invitation.status === 'DECLINED' && styles.statusBadgeTextDeclined,
                          ]}
                        >
                          {invitation.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                {invitation.status === 'PENDING' && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleCancelInvitation(invitation)}
                  >
                    <Ionicons name="close-circle" size={20} color={ERROR_COLOR} />
                  </TouchableOpacity>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No invitations sent</Text>
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <Animated.View style={[styles.fabWrapper, { transform: [{ scale: fabScale }] }]}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setInviteModalVisible(true)}
          onPressIn={handleFabPressIn}
          onPressOut={handleFabPressOut}
          activeOpacity={1}
        >
          <Ionicons name="person-add" size={28} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {/* Invite Modal */}
      <Modal
        visible={inviteModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setInviteModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setInviteModalVisible(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Invite Member</Text>
              <TouchableOpacity onPress={() => setInviteModalVisible(false)}>
                <Ionicons name="close" size={28} color={TEXT_PRIMARY} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Pseudonym</Text>
            <TextInput
              style={styles.input}
              value={inviteePseudonym}
              onChangeText={setInviteePseudonym}
              placeholder="username"
              placeholderTextColor={TEXT_MUTED}
              autoCapitalize="none"
              autoFocus
            />

            <Text style={styles.label}>Role</Text>
            <View style={styles.roleSelector}>
              <TouchableOpacity
                style={[styles.roleButton, selectedRole === 'READER' && styles.roleButtonActive]}
                onPress={() => setSelectedRole('READER')}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    selectedRole === 'READER' && styles.roleButtonTextActive,
                  ]}
                >
                  Reader
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleButton, selectedRole === 'WRITER' && styles.roleButtonActive]}
                onPress={() => setSelectedRole('WRITER')}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    selectedRole === 'WRITER' && styles.roleButtonTextActive,
                  ]}
                >
                  Writer
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSendInvitation}
              disabled={sendInvitation.isPending}
              activeOpacity={0.8}
            >
              {sendInvitation.isPending ? (
                <ActivityIndicator color={TEXT_PRIMARY} />
              ) : (
                <Text style={styles.submitButtonText}>Send Invitation</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  content: {
    padding: Spacing.md,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.small,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  personIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${PRIMARY_COLOR}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mailIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mailIconWrapperPending: {
    backgroundColor: `${ACCENT_ORANGE}20`,
  },
  mailIconWrapperAccepted: {
    backgroundColor: `${PRIMARY_COLOR}20`,
  },
  cardInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  cardEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  invitationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
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
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  emptyText: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: 'center',
    paddingVertical: Spacing.md,
  },
  fabWrapper: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_SECONDARY,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: '#fafafa',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
    marginBottom: Spacing.lg,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    color: TEXT_PRIMARY,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: Spacing.lg,
  },
  roleButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: PRIMARY_COLOR,
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_SECONDARY,
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
