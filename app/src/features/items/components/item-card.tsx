import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Image } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Ionicons } from '@expo/vector-icons';
import { Item } from '../types';
import {
  ERROR_COLOR,
  PRIMARY_COLOR,
  SECONDARY_COLOR,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_MUTED,
  BorderRadius,
  Shadows,
  Spacing,
} from '@/src/constants/theme';

interface ItemCardProps {
  item: Item;
  onToggleCheck: (item: Item) => void;
  onEdit?: (item: Item) => void;
  onDelete?: (item: Item) => void;
  onIncreaseQuantity?: (item: Item) => void;
  onDecreaseQuantity?: (item: Item) => void;
  onImagePlaceholderPress?: (item: Item) => void;
  onImagePress?: (item: Item) => void;
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
  onImagePlaceholderPress,
  onImagePress,
  canCheck,
  canEdit,
  isUpdatingQuantity = false,
}: ItemCardProps) {
  const swipeableRef = useRef<Swipeable>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [imageError, setImageError] = useState(false);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

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
              <Ionicons name="pencil" size={20} color={PRIMARY_COLOR} />
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
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={styles.container}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          onPress={() => canCheck && onToggleCheck(item)}
        >
          {/* Image Thumbnail or Placeholder */}
          {item.imageUrl && !imageError ? (
            <TouchableOpacity
              style={styles.imageThumbnailContainer}
              onPress={() => onImagePress?.(item)}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.imageThumbnail}
                onError={() => setImageError(true)}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.imagePlaceholder}
              onPress={() => canEdit && onImagePlaceholderPress?.(item)}
              disabled={!canEdit || !onImagePlaceholderPress}
              activeOpacity={0.7}
            >
              <Ionicons name="image-outline" size={20} color="#ccc" />
            </TouchableOpacity>
          )}

          {/* Checkbox */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => onToggleCheck(item)}
            disabled={!canCheck}
          >
            <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
              {item.checked && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
          </TouchableOpacity>

          {/* Item content */}
          <View style={styles.itemContent}>
            <Text style={[styles.itemTitle, item.checked && styles.itemTitleChecked]}>
              {item.title}
            </Text>
            <View style={styles.itemDetails}>
              {item.category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.itemCategory}>{item.category}</Text>
                </View>
              )}
            </View>
            {item.notes && <Text style={styles.itemNotes}>{item.notes}</Text>}
          </View>

          {/* Right side - Quantity controls (vertical) */}
          {canEdit && onIncreaseQuantity && onDecreaseQuantity && (
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={[styles.quantityButton, styles.quantityButtonIncrease]}
                onPress={() => onIncreaseQuantity(item)}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={18} color="#fff" />
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                {item.unit && <Text style={styles.unitText}>{item.unit}</Text>}
              </View>
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
                <Ionicons
                  name="remove"
                  size={18}
                  color={item.quantity <= 1 ? '#ccc' : PRIMARY_COLOR}
                />
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.small,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  imageThumbnailContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    marginRight: 12,
  },
  imageThumbnail: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#fafafa',
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: '#d0d0d0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  quantityControls: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    gap: 4,
  },
  quantityButton: {
    width: 32,
    height: 28,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonIncrease: {
    backgroundColor: PRIMARY_COLOR,
  },
  quantityButtonDecrease: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: PRIMARY_COLOR,
  },
  quantityButtonDecreaseDisable: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#d0d0d0',
  },
  quantityButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  quantityDisplay: {
    minWidth: 32,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 15,
    fontWeight: '700',
    color: PRIMARY_COLOR,
    lineHeight: 18,
  },
  unitText: {
    fontSize: 10,
    color: TEXT_SECONDARY,
    marginTop: 1,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: 2,
    lineHeight: 20,
  },
  itemTitleChecked: {
    textDecorationLine: 'line-through',
    color: TEXT_MUTED,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryBadge: {
    backgroundColor: `${SECONDARY_COLOR}25`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  itemCategory: {
    fontSize: 11,
    color: '#2d8a5f',
    fontWeight: '600',
  },
  itemNotes: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginTop: 4,
    fontStyle: 'italic',
    lineHeight: 16,
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
    color: PRIMARY_COLOR,
  },
  swipeActionDeleteText: {
    color: ERROR_COLOR,
  },
});
