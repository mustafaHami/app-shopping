import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Ionicons } from '@expo/vector-icons';
import { Item } from '../types';
import { ERROR_COLOR, MAIN_COLOR } from '@/src/constants/theme';

interface ItemCardProps {
  item: Item;
  onToggleCheck: (item: Item) => void;
  onEdit?: (item: Item) => void;
  onDelete?: (item: Item) => void;
  onIncreaseQuantity?: (item: Item) => void;
  onDecreaseQuantity?: (item: Item) => void;
  canCheck: boolean;
  canEdit: boolean;
  isUpdatingQuantity?: boolean;
}

export function ItemCard({
  item,
  onToggleCheck,
  onEdit,
  onDelete,
  onIncreaseQuantity,
  onDecreaseQuantity,
  canCheck,
  canEdit,
  isUpdatingQuantity = false,
}: ItemCardProps) {
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    if (!canEdit) return null;

    return (
      <View style={styles.swipeActions}>
        {onEdit && (
          <Animated.View style={styles.swipeActionWrapper}>
            <TouchableOpacity
              style={[styles.swipeAction]}
              onPress={() => {
                swipeableRef.current?.close();
                onEdit(item);
              }}
            >
              <Ionicons name="pencil" size={20} color={MAIN_COLOR} />
              <Text style={[styles.swipeActionText, styles.swipeActionEditText]}>Edit</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
        {onDelete && (
          <Animated.View style={styles.swipeActionWrapper}>
            <TouchableOpacity
              style={[styles.swipeAction]}
              onPress={() => {
                swipeableRef.current?.close();
                onDelete(item);
              }}
            >
              <Ionicons name="trash" size={20} color={ERROR_COLOR} />
              <Text style={[styles.swipeActionText, styles.swipeActionDeleteText]}>Delete</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={canEdit ? renderRightActions : undefined}
      overshootRight={false}
    >
      <View style={styles.container}>
        {/* Checkbox */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => onToggleCheck(item)}
          disabled={!canCheck}
        >
          <Ionicons
            name={item.checked ? 'checkbox' : 'square-outline'}
            size={28}
            color={item.checked ? MAIN_COLOR : '#ccc'}
          />
        </TouchableOpacity>

        {/* Item content */}
        <View style={styles.itemContent}>
          <Text style={[styles.itemTitle, item.checked && styles.itemTitleChecked]}>
            {item.title}
          </Text>
          <View style={styles.itemDetails}>
            {item.category && <Text style={styles.itemCategory}>{item.category}</Text>}
          </View>
          {item.notes && <Text style={styles.itemNotes}>{item.notes}</Text>}
        </View>

        {/* Right side - Quantity controls */}
        {canEdit && onIncreaseQuantity && onDecreaseQuantity && (
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={[
                styles.quantityButton,
                item.quantity <= 1
                  ? styles.quantityButtonDecreaseDisable
                  : styles.quantityButtonDecrease,
              ]}
              onPress={() => onDecreaseQuantity(item)}
              disabled={item.quantity <= 1}
              activeOpacity={0.7}
            >
              <Ionicons name="remove" size={20} color={item.quantity <= 1 ? '#ccc' : MAIN_COLOR} />
            </TouchableOpacity>
            <View style={styles.quantityDisplay}>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              {item.unit && <Text style={styles.unitText}>{item.unit}</Text>}
            </View>
            <TouchableOpacity
              style={[styles.quantityButton, styles.quantityButtonIncrease]}
              onPress={() => onIncreaseQuantity(item)}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    gap: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonIncrease: {
    backgroundColor: MAIN_COLOR,
  },
  quantityButtonDecrease: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: MAIN_COLOR,
  },
  quantityButtonDecreaseDisable: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  quantityButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  quantityDisplay: {
    minWidth: 40,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '700',
    color: MAIN_COLOR,
  },
  unitText: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  itemTitleChecked: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemCategory: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemNotes: {
    fontSize: 13,
    color: '#666',
    marginTop: 6,
    fontStyle: 'italic',
  },
  swipeActions: {
    flexDirection: 'row',
    height: '100%',
  },
  swipeActionWrapper: {
    justifyContent: 'center',
  },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    paddingHorizontal: 12,
  },

  swipeActionText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  swipeActionEditText: {
    color: MAIN_COLOR,
  },
  swipeActionDeleteText: {
    color: ERROR_COLOR,
  },
});
