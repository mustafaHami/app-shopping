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
  ScrollView,
} from 'react-native';
import { useCreateItem } from '../hooks/use-items';
import { Button } from '@/src/components/ui/button';
import { ERROR_COLOR, MAIN_COLOR } from '@/src/constants/theme';
import { CategorySelector } from './category-selector';

interface CreateItemFormProps {
  visible: boolean;
  onClose: () => void;
  listId: string;
  userId: string;
  allCategories: string[];
}

export function CreateItemForm({
  visible,
  onClose,
  listId,
  userId,
  allCategories,
}: CreateItemFormProps) {
  const [title, setTitle] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const createItem = useCreateItem();

  const resetForm = () => {
    setTitle('');
    setQuantity('1');
    setUnit('');
    setNotes('');
    setCategory('');
    setErrorMessage('');
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Error', 'Quantity must be a positive number');
      return;
    }
    try {
      const payload: any = {
        title: title.trim(),
        quantity: qty,
        listId,
      };
      if (unit.trim()) payload.unit = unit.trim();
      if (notes.trim()) payload.notes = notes.trim();
      if (category.trim()) payload.category = category.trim();
      await createItem.mutateAsync({ data: payload, userId });
      resetForm();
      onClose();
    } catch (error: any) {
      console.error(error);
      // Handle 409 Conflict (duplicate item)
      if (error.status === 409 || error.message?.includes('already exists')) {
        setErrorMessage(error.message || 'This item already exists in the list');
      } else {
        setErrorMessage(error.message || 'Failed to create item');
      }
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Add New Item</Text>
            <Text style={styles.errorMessage}>{errorMessage}</Text>
            <Text style={styles.label}>
              Item Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Milk, Bread..."
              value={title}
              onChangeText={setTitle}
              autoFocus
            />
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>
                  Quantity <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="1"
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Unit</Text>
                <TextInput
                  style={styles.input}
                  placeholder="kg, pcs, liters..."
                  value={unit}
                  onChangeText={setUnit}
                />
              </View>
            </View>

            <CategorySelector
              value={category}
              onChange={setCategory}
              categories={allCategories}
              userId={userId}
            />

            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any additional notes..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            <View style={styles.buttonContainer}>
              <Button
                variant="secondary"
                title="Cancel"
                onPress={() => {
                  resetForm();
                  onClose();
                }}
              />
              <Button
                variant="primary"
                title="Add Item"
                onPress={handleSubmit}
                disabled={!title.trim() || !quantity.trim()}
                loading={createItem.isPending}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginTop: 12,
  },
  errorMessage: {
    fontSize: 14,
    fontWeight: '700',
    color: ERROR_COLOR,
  },
  required: {
    color: '#FF626F',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 24,
  },
});
