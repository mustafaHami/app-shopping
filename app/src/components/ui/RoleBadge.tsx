import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Role } from '@/src/features/members/types';

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
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeReader: {
    backgroundColor: '#F3E5F5',
  },
  badgeWriter: {
    backgroundColor: '#E3F2FD',
  },
  badgeOwner: {
    backgroundColor: '#FFF3E0',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  badgeTextReader: {
    color: '#7B1FA2',
  },
  badgeTextWriter: {
    color: '#1976D2',
  },
  badgeTextOwner: {
    color: '#F57C00',
  },
});
