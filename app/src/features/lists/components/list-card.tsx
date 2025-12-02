import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Ionicons } from '@expo/vector-icons';
import { List } from '../types';
import {
  ERROR_COLOR,
  PRIMARY_COLOR,
  SECONDARY_COLOR,
  ACCENT_YELLOW,
  ACCENT_ORANGE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_MUTED,
  BorderRadius,
  Shadows,
  Spacing,
} from '@/src/constants/theme';

interface ListCardProps {
  list: List;
  onPress: (list: List) => void;
  onEdit?: (list: List) => void;
  onDelete?: (list: List) => void;
}

export function ListCard({ list, onPress, onEdit, onDelete }: ListCardProps) {
  const swipeableRef = useRef<Swipeable>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const itemCount = list.items?.length ?? 0;
  const createdDate = new Date(list.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const getBadgeStyle = () => {
    if (list.userRole === 'OWNER') return { bg: `${ACCENT_ORANGE}30`, text: '#c47800' };
    if (list.userRole === 'WRITER') return { bg: `${PRIMARY_COLOR}30`, text: '#2a7a4e' };
    if (list.userRole === 'READER') return { bg: `${SECONDARY_COLOR}30`, text: '#2d8a5f' };
    return null;
  };

  const getBadgeLabel = () => {
    if (list.userRole === 'OWNER') return 'Owner';
    if (list.userRole === 'WRITER') return 'Shared • Writer';
    if (list.userRole === 'READER') return 'Shared • Reader';
    return null;
  };

  const badgeStyle = getBadgeStyle();
  const badgeLabel = getBadgeLabel();

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
    if (!onEdit && !onDelete) return null;

    return (
      <View style={styles.swipeActions}>
        {onEdit && (
          <Animated.View style={styles.swipeActionWrapper}>
            <TouchableOpacity
              style={[styles.swipeAction]}
              onPress={() => {
                swipeableRef.current?.close();
                onEdit(list);
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
                onDelete(list);
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
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} overshootRight={false}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={styles.container}
          onPress={() => onPress(list)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{list.title}</Text>
                {badgeLabel && badgeStyle && (
                  <View style={[styles.badgeContainer, { backgroundColor: badgeStyle.bg }]}>
                    <Text style={[styles.badgeText, { color: badgeStyle.text }]}>{badgeLabel}</Text>
                  </View>
                )}
              </View>
            </View>
            {list.description && <Text style={styles.description}>{list.description}</Text>}
            <View style={styles.footer}>
              <View style={styles.itemCountContainer}>
                <Ionicons name="cart-outline" size={14} color={PRIMARY_COLOR} />
                <Text style={styles.itemCount}>{itemCount} items</Text>
              </View>
              <Text style={styles.date}>{createdDate}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.medium,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  titleContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: Spacing.xs,
  },
  badgeContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  itemCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemCount: {
    fontSize: 13,
    color: PRIMARY_COLOR,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: TEXT_MUTED,
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
    color: '#fff',
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
