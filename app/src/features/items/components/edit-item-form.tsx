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
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useUpdateItem,
  useCreateItem,
  useUploadItemImage,
  useDeleteItemImage,
} from '../hooks/use-items';
import { Item } from '../types';
import { Button } from '@/src/components/ui/button';
import {
  PRIMARY_COLOR,
  ERROR_COLOR,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_MUTED,
  BorderRadius,
  Spacing,
} from '@/src/constants/theme';
import { CategorySelector } from './category-selector';
import { ImagePickerModal } from './image-picker-modal';

interface EditItemFormProps {
  visible: boolean;
  onClose: () => void;
  item: Item | null;
  allCategories: string[];
}

export function EditItemForm({ visible, onClose, item, allCategories }: EditItemFormProps) {
  const [title, setTitle] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const updateItem = useUpdateItem();
  const createItem = useCreateItem();
  const uploadImage = useUploadItemImage();
  const deleteImage = useDeleteItemImage();

  const isNewItem = !item?.id;

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setQuantity(item.quantity.toString());
      setUnit(item.unit || '');
      setNotes(item.notes || '');
      setCategory(item.category || '');
      setImageUri(item.imageUrl);
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

      let itemId: string;
      if (isNewItem) {
        // Create new item
        const newItem = await createItem.mutateAsync({
          ...data,
          listId: item.listId,
        });
        itemId = newItem.id;
      } else {
        // Update existing item
        await updateItem.mutateAsync({
          id: item.id,
          data,
          listId: item.listId,
        });
        itemId = item.id;
      }

      // Handle image upload if a new image was selected
      if (imageUri && imageUri !== item.imageUrl) {
        try {
          await uploadImage.mutateAsync({
            id: itemId,
            imageUri,
            listId: item.listId,
          });
        } catch (error: any) {
          Alert.alert('Warning', 'Item saved but image upload failed: ' + error.message);
        }
      }

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
        Alert.alert('Error', error.message || `Failed to ${isNewItem ? 'create' : 'update'} item`);
      }
    }
  };

  const handleImageSelected = (uri: string) => {
    setImageUri(uri);
  };

  const handleRemoveImage = async () => {
    if (!item?.id) {
      // Just remove locally if item doesn't exist yet
      setImageUri(undefined);
      return;
    }

    if (item.imageUrl) {
      // Delete from server if image exists
      Alert.alert('Remove Image', 'Are you sure you want to remove this image?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteImage.mutateAsync({ id: item.id, listId: item.listId });
              setImageUri(undefined);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete image');
            }
          },
        },
      ]);
    } else {
      setImageUri(undefined);
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
            <View style={styles.header}>
              <Text style={styles.modalTitle}>{isNewItem ? 'Add Item Details' : 'Edit Item'}</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={28} color={TEXT_PRIMARY} />
              </TouchableOpacity>
            </View>

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
                      <Ionicons name="swap-horizontal" size={20} color={PRIMARY_COLOR} />
                      <Text style={styles.imageActionText}>Replace</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.imageActionButton, styles.imageActionButtonDelete]}
                      onPress={handleRemoveImage}
                      activeOpacity={0.7}
                      disabled={deleteImage.isPending}
                    >
                      {deleteImage.isPending ? (
                        <ActivityIndicator size="small" color={ERROR_COLOR} />
                      ) : (
                        <>
                          <Ionicons name="trash" size={20} color={ERROR_COLOR} />
                          <Text style={[styles.imageActionText, styles.imageActionTextDelete]}>
                            Remove
                          </Text>
                        </>
                      )}
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
              placeholderTextColor={TEXT_MUTED}
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
                  placeholderTextColor={TEXT_MUTED}
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
                  placeholderTextColor={TEXT_MUTED}
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
              placeholderTextColor={TEXT_MUTED}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            <View style={styles.buttonContainer}>
              <Button variant="secondary" title="Cancel" onPress={onClose} />
              <Button
                variant="primary"
                title={isNewItem ? 'Add Item' : 'Update'}
                onPress={handleSubmit}
                disabled={!title.trim() || !quantity.trim()}
                loading={
                  isNewItem
                    ? createItem.isPending || uploadImage.isPending
                    : updateItem.isPending || uploadImage.isPending
                }
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
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: '90%',
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
  imageSection: {
    marginBottom: Spacing.md,
  },
  imageContainer: {
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.md,
    backgroundColor: '#f0f0f0',
  },
  imageActions: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    gap: 12,
  },
  imageActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
    backgroundColor: `${PRIMARY_COLOR}15`,
    gap: 6,
  },
  imageActionButtonDelete: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: ERROR_COLOR,
  },
  imageActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY_COLOR,
  },
  imageActionTextDelete: {
    color: ERROR_COLOR,
  },
  imagePlaceholder: {
    width: '100%',
    height: 150,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  imagePlaceholderText: {
    marginTop: Spacing.md,
    fontSize: 15,
    color: TEXT_MUTED,
    fontWeight: '500',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_SECONDARY,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  required: {
    color: ERROR_COLOR,
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
    marginTop: Spacing.lg,
  },
});
