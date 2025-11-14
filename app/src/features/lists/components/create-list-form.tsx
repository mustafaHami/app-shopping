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
} from 'react-native';
import { useCreateList } from '../hooks/use-lists';
import { Button } from '@/src/components/ui/button';

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
          <Text style={styles.modalTitle}>Create New List</Text>

          <TextInput
            style={styles.input}
            placeholder="List Title *"
            value={title}
            onChangeText={setTitle}
            autoFocus
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description (optional)"
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
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
});
