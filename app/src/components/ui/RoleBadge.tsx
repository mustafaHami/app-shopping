import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Role } from '@/src/features/members/types';
import {
  PRIMARY_COLOR,
  SECONDARY_COLOR,
  ACCENT_YELLOW,
  ACCENT_ORANGE,
  BorderRadius,
} from '@/src/constants/theme';

interface RoleBadgeProps {
  role: Role;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  return (
    <View
      style={[
        styles.badge,
        role === 'READER' && styles.badgeReader,
        role === 'WRITER' && styles.badgeWriter,
        role === 'OWNER' && styles.badgeOwner,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          role === 'READER' && styles.badgeTextReader,
          role === 'WRITER' && styles.badgeTextWriter,
          role === 'OWNER' && styles.badgeTextOwner,
        ]}
      >
        {role}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  badgeReader: {
    backgroundColor: `${SECONDARY_COLOR}30`, // 30% opacity of secondary
  },
  badgeWriter: {
    backgroundColor: `${PRIMARY_COLOR}40`, // 40% opacity of primary
  },
  badgeOwner: {
    backgroundColor: `${ACCENT_ORANGE}40`, // 40% opacity of orange accent
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeTextReader: {
    color: '#2d8a5f', // Darker teal for contrast
  },
  badgeTextWriter: {
    color: '#2a7a4e', // Darker green for contrast
  },
  badgeTextOwner: {
    color: '#c47800', // Darker orange for contrast
  },
});
