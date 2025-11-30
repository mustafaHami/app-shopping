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
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCreateItem, useUploadItemImage } from '../hooks/use-items';
import { Button } from '@/src/components/ui/button';
import { ERROR_COLOR, MAIN_COLOR } from '@/src/constants/theme';
import { CategorySelector } from './category-selector';
import { ImagePickerModal } from './image-picker-modal';

interface CreateItemFormProps {
  visible: boolean;
  onClose: () => void;
  listId: string;
  allCategories: string[];
}

export function CreateItemForm({ visible, onClose, listId, allCategories }: CreateItemFormProps) {
  const [title, setTitle] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const createItem = useCreateItem();
  const uploadImage = useUploadItemImage();

  const resetForm = () => {
    setTitle('');
    setQuantity('1');
    setUnit('');
    setNotes('');
    setCategory('');
    setErrorMessage('');
    setImageUri(undefined);
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

      const newItem = await createItem.mutateAsync(payload);

      // Handle image upload if an image was selected
      if (imageUri) {
        try {
          await uploadImage.mutateAsync({
            id: newItem.id,
            imageUri,
            listId,
          });
        } catch (error: any) {
          Alert.alert('Warning', 'Item created but image upload failed: ' + error.message);
        }
      }

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

  const handleImageSelected = (uri: string) => {
    setImageUri(uri);
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

            {/* Image Section */}
            <View style={styles.imageSection}>
              <Text style={styles.label}>Item Image</Text>
              {imageUri ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                  <View style={styles.imageActions}>
                    <TouchableOpacity
                      style={styles.imageActionButton}
                      onPress={() => setShowImagePicker(true)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="swap-horizontal" size={20} color={MAIN_COLOR} />
                      <Text style={styles.imageActionText}>Replace</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.imageActionButton, styles.imageActionButtonDelete]}
                      onPress={() => setImageUri(undefined)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash" size={20} color={ERROR_COLOR} />
                      <Text style={[styles.imageActionText, styles.imageActionTextDelete]}>
                        Remove
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.imagePlaceholder}
                  onPress={() => setShowImagePicker(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="image-outline" size={48} color="#ccc" />
                  <Text style={styles.imagePlaceholderText}>Tap to add image</Text>
                </TouchableOpacity>
              )}
            </View>

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

            <CategorySelector value={category} onChange={setCategory} categories={allCategories} />

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
                loading={createItem.isPending || uploadImage.isPending}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onImageSelected={handleImageSelected}
      />
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
  imageSection: {
    marginBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  imageActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  imageActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    gap: 6,
  },
  imageActionButtonDelete: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: ERROR_COLOR,
  },
  imageActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: MAIN_COLOR,
  },
  imageActionTextDelete: {
    color: ERROR_COLOR,
  },
  imagePlaceholder: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  imagePlaceholderText: {
    marginTop: 12,
    fontSize: 15,
    color: '#999',
    fontWeight: '500',
  },
});