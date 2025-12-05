import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCreateList } from '../hooks/use-lists';
import { Button } from '@/src/components/ui/button';
import {
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_MUTED,
  BorderRadius,
  Shadows,
  Spacing,
  PRIMARY_COLOR,
  SECONDARY_COLOR,
  ERROR_COLOR,
  BORDER_LIGHT,
} from '@/src/constants/theme';
import type { InvitationItem } from '../schemas/list-schema';

interface CreateListFormProps {
  visible: boolean;
  onClose: () => void;
}

type Role = 'READER' | 'WRITER';

export function CreateListForm({ visible, onClose }: CreateListFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [invitations, setInvitations] = useState<InvitationItem[]>([]);
  const [newPseudonym, setNewPseudonym] = useState('');
  const [newRole, setNewRole] = useState<Role>('READER');
  const createList = useCreateList();

  const handleAddInvitation = () => {
    if (!newPseudonym.trim()) {
      Alert.alert('Error', 'Please enter a pseudonym');
      return;
    }

    if (invitations.some(inv => inv.inviteePseudonym === newPseudonym.trim())) {
      Alert.alert('Error', 'This user is already in the invitation list');
      return;
    }

    setInvitations([...invitations, { inviteePseudonym: newPseudonym.trim(), role: newRole }]);
    setNewPseudonym('');
    setNewRole('READER');
  };

  const handleRemoveInvitation = (pseudonym: string) => {
    setInvitations(invitations.filter(inv => inv.inviteePseudonym !== pseudonym));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    try {
      const payload: { title: string; description?: string; invitations?: InvitationItem[] } = {
        title: title.trim(),
      };

      if (description.trim()) {
        payload.description = description.trim();
      }

      if (invitations.length > 0) {
        payload.invitations = invitations;
      }

      const result = await createList.mutateAsync(payload);

      // Show invitation results if any
      if (result.invitationResults && result.invitationResults.length > 0) {
        const failed = result.invitationResults.filter((r: { success: boolean }) => !r.success);
        if (failed.length > 0) {
          const failedNames = failed
            .map((r: { pseudonym: string; error?: string }) => `${r.pseudonym}: ${r.error}`)
            .join('\n');
          Alert.alert('List Created', `Some invitations could not be sent:\n${failedNames}`);
        }
      }

      setTitle('');
      setDescription('');
      setInvitations([]);
      onClose();
    } catch (error) {
      console.error('Failed to create list:', error);
      Alert.alert('Error', 'Failed to create list');
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setInvitations([]);
    setNewPseudonym('');
    setNewRole('READER');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.modalTitle}>Create New List</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={28} color={TEXT_PRIMARY} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
            <Text style={styles.label}>List Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Weekly Groceries"
              placeholderTextColor={TEXT_MUTED}
              value={title}
              onChangeText={setTitle}
              autoFocus
            />

            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add a description..."
              placeholderTextColor={TEXT_MUTED}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            {/* Invite Members Section */}
            <View style={styles.inviteSection}>
              <Text style={styles.sectionTitle}>Invite Members (optional)</Text>

              {/* Add new invitation */}
              <View style={styles.addInviteRow}>
                <TextInput
                  style={[styles.input, styles.pseudonymInput]}
                  placeholder="Enter pseudonym"
                  placeholderTextColor={TEXT_MUTED}
                  value={newPseudonym}
                  onChangeText={setNewPseudonym}
                />
                <View style={styles.roleSelector}>
                  <TouchableOpacity
                    style={[styles.roleButton, newRole === 'READER' && styles.roleButtonActive]}
                    onPress={() => setNewRole('READER')}
                  >
                    <Text style={[styles.roleText, newRole === 'READER' && styles.roleTextActive]}>
                      Reader
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.roleButton, newRole === 'WRITER' && styles.roleButtonActive]}
                    onPress={() => setNewRole('WRITER')}
                  >
                    <Text style={[styles.roleText, newRole === 'WRITER' && styles.roleTextActive]}>
                      Writer
                    </Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.addButton} onPress={handleAddInvitation}>
                  <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* List of invitations */}
              {invitations.length > 0 && (
                <View style={styles.invitationsList}>
                  {invitations.map(inv => (
                    <View key={inv.inviteePseudonym} style={styles.invitationItem}>
                      <View style={styles.invitationInfo}>
                        <Text style={styles.invitationPseudonym}>{inv.inviteePseudonym}</Text>
                        <View
                          style={[
                            styles.roleBadge,
                            inv.role === 'READER' ? styles.roleBadgeReader : styles.roleBadgeWriter,
                          ]}
                        >
                          <Text
                            style={[
                              styles.roleBadgeText,
                              inv.role === 'READER'
                                ? styles.roleBadgeTextReader
                                : styles.roleBadgeTextWriter,
                            ]}
                          >
                            {inv.role}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleRemoveInvitation(inv.inviteePseudonym)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons name="close-circle" size={22} color={ERROR_COLOR} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <Button variant="secondary" title="Cancel" onPress={handleClose} />
            <Button
              variant="primary"
              title="Create"
              onPress={handleSubmit}
              disabled={!title.trim()}
              loading={createList.isPending}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    width: '90%',
    maxWidth: 400,
    maxHeight: '85%',
    ...Shadows.large,
  },
  scrollContent: {
    flexGrow: 0,
  },
  header: {
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
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_SECONDARY,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    borderRadius: BorderRadius.md,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#fafafa',
    color: TEXT_PRIMARY,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inviteSection: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: BORDER_LIGHT,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: Spacing.md,
  },
  addInviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  pseudonymInput: {
    flex: 1,
    padding: 10,
  },
  roleSelector: {
    flexDirection: 'row',
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
  },
  roleButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fafafa',
  },
  roleButtonActive: {
    backgroundColor: PRIMARY_COLOR,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
    color: TEXT_SECONDARY,
  },
  roleTextActive: {
    color: TEXT_PRIMARY,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: BorderRadius.sm,
    padding: 8,
  },
  invitationsList: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  invitationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  invitationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  invitationPseudonym: {
    fontSize: 14,
    fontWeight: '500',
    color: TEXT_PRIMARY,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  roleBadgeReader: {
    backgroundColor: `${SECONDARY_COLOR}30`,
  },
  roleBadgeWriter: {
    backgroundColor: `${PRIMARY_COLOR}40`,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  roleBadgeTextReader: {
    color: '#2d8a5f',
  },
  roleBadgeTextWriter: {
    color: '#2a7a4e',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
});
