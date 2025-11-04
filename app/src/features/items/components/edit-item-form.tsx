import React, { useState, useEffect } from 'react';
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
import { useUpdateItem } from '../hooks/use-items';
import { Item } from '../types';
import { Button } from '@/src/components/ui/button';
import { MAIN_COLOR } from '@/src/constants/theme';
import { CategorySelector } from './category-selector';

interface EditItemFormProps {
  visible: boolean;
  onClose: () => void;
  item: Item | null;
  userId: string;
  allCategories: string[];
}

export function EditItemForm({ visible, onClose, item, userId, allCategories }: EditItemFormProps) {
  const [title, setTitle] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('');
  const updateItem = useUpdateItem();

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setQuantity(item.quantity.toString());
      setUnit(item.unit || '');
      setNotes(item.notes || '');
      setCategory(item.category || '');
    }
  }, [item]);

  const handleSubmit = async () => {
    if (!item) return;

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
      const data: any = {
        title: title.trim(),
        quantity: qty,
      };
      if (unit.trim()) data.unit = unit.trim();
      if (notes.trim()) data.notes = notes.trim();
      if (category.trim()) data.category = category.trim();

      await updateItem.mutateAsync({
        id: item.id,
        userId,
        data,
        listId: item.listId,
      });
      onClose();
    } catch (error: any) {
      console.error(error);
      // Handle 409 Conflict (duplicate item)
      if (error.status === 409 || error.message?.includes('already exists')) {
        Alert.alert(
          'Duplicate Item',
          error.message || 'An item with this name already exists in the list',
        );
      } else {
        Alert.alert('Error', error.message || 'Failed to update item');
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
            <Text style={styles.modalTitle}>Edit Item</Text>

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
              <Button variant="secondary" title="Cancel" onPress={onClose} />
              <Button
                variant="primary"
                title="Update"
                onPress={handleSubmit}
                disabled={!title.trim() || !quantity.trim()}
                loading={updateItem.isPending}
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
