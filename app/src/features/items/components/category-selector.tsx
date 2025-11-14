import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MAIN_COLOR } from '@/src/constants/theme';
import { useCreateCategory } from '@/src/features/categories/hooks/use-categories';

interface CategorySelectorProps {
  value: string;
  onChange: (category: string) => void;
  categories: string[];
  label?: string;
}

export function CategorySelector({
  value,
  onChange,
  categories,
  label = 'Category',
}: CategorySelectorProps) {
  const [showModal, setShowModal] = useState(false);
  const [addingNew, setAddingNew] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const createCategory = useCreateCategory();

  // Remove empty strings & duplicates, and show sorted
  const allCategories = Array.from(new Set(categories.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );

  const handleSelect = (cat: string) => {
    onChange(cat);
    setShowModal(false);
    setAddingNew(false);
    setNewCategory('');
  };

  const handleAddNew = async () => {
    if (newCategory.trim()) {
      try {
        await createCategory.mutateAsync(newCategory.trim());
        onChange(newCategory.trim());
        setShowModal(false);
        setAddingNew(false);
        setNewCategory('');
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to create category');
      }
    }
  };

  return (
    <View style={styles.root}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.select}
        activeOpacity={0.7}
        onPress={() => setShowModal(true)}
      >
        <Text style={value ? styles.selectText : styles.selectPlaceholder}>
          {value || 'Select or add a category'}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#999" />
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowModal(false)} />
        <View style={styles.modalContent}>
          {!addingNew ? (
            <>
              <FlatList
                data={[...allCategories, '+ Add new category']}
                keyExtractor={cat => cat}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.option}
                    onPress={() => {
                      if (item === '+ Add new category') setAddingNew(true);
                      else handleSelect(item);
                    }}
                  >
                    <Text
                      style={item === '+ Add new category' ? styles.addNewText : styles.optionText}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </>
          ) : (
            <View style={styles.addNewRow}>
              <TextInput
                style={styles.input}
                placeholder="Enter new category..."
                value={newCategory}
                onChangeText={setNewCategory}
                autoFocus
              />
              <TouchableOpacity style={styles.addBtn} onPress={handleAddNew}>
                <Ionicons name="checkmark" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginVertical: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginTop: 12,
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#fafafa',
    minHeight: 44,
    padding: 12,
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: 15,
    color: '#222',
    flex: 1,
  },
  selectPlaceholder: {
    fontSize: 15,
    color: '#aaa',
    flex: 1,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: 300,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 8,
  },
  option: {
    paddingVertical: 10,
  },
  optionText: {
    fontSize: 16,
    color: '#222',
  },
  addNewText: {
    fontSize: 15,
    color: MAIN_COLOR,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  addNewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: MAIN_COLOR,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fafcff',
  },
  addBtn: {
    backgroundColor: MAIN_COLOR,
    marginLeft: 8,
    borderRadius: 8,
    padding: 10,
  },
});
