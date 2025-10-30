import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useUpdateList } from '../hooks/use-lists';
import { List } from '../types';

interface EditListFormProps {
  visible: boolean;
  onClose: () => void;
  list: List | null;
  userId: string;
}

export function EditListForm({ visible, onClose, list, userId }: EditListFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const updateList = useUpdateList();

  useEffect(() => {
    if (list) {
      setTitle(list.title);
      setDescription(list.description || '');
    }
  }, [list]);

  const handleSubmit = async () => {
    if (!list) return;

    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    try {
      await updateList.mutateAsync({
        id: list.id,
        userId,
        data: {
          title: title.trim(),
          description: description.trim() || undefined,
        },
      });

      Alert.alert('Success', 'List updated successfully');
      onClose();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to update list');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit List</Text>

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
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={updateList.isPending}
            >
              <Text style={styles.submitButtonText}>
                {updateList.isPending ? 'Updating...' : 'Update'}
              </Text>
            </TouchableOpacity>
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
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
