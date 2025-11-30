import React, { useState } from 'react';
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
import { MAIN_COLOR, ERROR_COLOR } from '@/src/constants/theme';
import type { ListMember, Invitation } from '@/src/features/members/types';
import { RoleBadge } from '@/src/components/ui/RoleBadge';

export default function MembersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteeEmail, setInviteeEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'READER' | 'WRITER'>('READER');

  const { data: membersData, isLoading, refetch, isRefetching } = useListMembers(id!);
  const sendInvitation = useSendInvitation();
  const updateMemberRole = useUpdateMemberRole();
  const removeMember = useRemoveMember();
  const cancelInvitation = useCancelInvitation();

  const handleSendInvitation = async () => {
    if (!inviteeEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    try {
      await sendInvitation.mutateAsync({
        listId: id!,
        data: { inviteeEmail, role: selectedRole },
      });
      setInviteModalVisible(false);
      setInviteeEmail('');
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
    Alert.alert('Cancel Invitation', `Cancel invitation to ${invitation.inviteeEmail}?`, [
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
        <ActivityIndicator size="large" color={MAIN_COLOR} />
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
            tintColor={MAIN_COLOR}
            colors={[MAIN_COLOR]}
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
                  <Ionicons name="person" size={24} color={MAIN_COLOR} />
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardEmail}>{member.userEmail}</Text>
                    <RoleBadge role={member.role} />
                  </View>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleChangeRole(member)}
                  >
                    <Ionicons name="swap-horizontal" size={20} color={MAIN_COLOR} />
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
                  <Ionicons
                    name="mail"
                    size={24}
                    color={
                      invitation.status === 'PENDING'
                        ? '#FFA500'
                        : invitation.status === 'ACCEPTED'
                          ? '#4CAF50'
                          : '#999'
                    }
                  />
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardEmail}>{invitation.inviteeEmail}</Text>
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
      <TouchableOpacity style={styles.fab} onPress={() => setInviteModalVisible(true)}>
        <Ionicons name="person-add" size={28} color="#fff" />
      </TouchableOpacity>

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
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={inviteeEmail}
              onChangeText={setInviteeEmail}
              placeholder="user@example.com"
              keyboardType="email-address"
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
            >
              {sendInvitation.isPending ? (
                <ActivityIndicator color="#fff" />
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
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardInfo: {
    marginLeft: 12,
    flex: 1,
  },
  cardEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
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
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 16,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: MAIN_COLOR,
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: MAIN_COLOR,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
