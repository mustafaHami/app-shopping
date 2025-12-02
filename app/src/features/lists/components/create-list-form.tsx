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
} from '@/src/constants/theme';

interface CreateListFormProps {
  visible: boolean;
  onClose: () => void;
}

export function CreateListForm({ visible, onClose }: CreateListFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const createList = useCreateList();

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    try {
      const payload: any = {
        title: title.trim(),
      };

      // Only include description if it's not empty
      if (description.trim()) {
        payload.description = description.trim();
      }

      await createList.mutateAsync(payload);

      setTitle('');
      setDescription('');
      onClose();
    } catch (error) {
      console.error('Failed to create list:', error);
      Alert.alert('Error', 'Failed to create list');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.modalTitle}>Create New List</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={TEXT_PRIMARY} />
            </TouchableOpacity>
          </View>

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

          <View style={styles.buttonContainer}>
            <Button
              variant="secondary"
              title="Cancel"
              onPress={() => {
                setTitle('');
                setDescription('');
                onClose();
              }}
            />
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
    ...Shadows.large,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
});
