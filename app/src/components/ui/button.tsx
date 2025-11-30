import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MAIN_COLOR, ERROR_COLOR } from '@/src/constants/theme';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}

export function Button({
  onPress,
  title,
  variant = 'primary',
  disabled = false,
  loading = false,
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isDanger = variant === 'danger';
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPrimary && styles.primaryButton,
        isSecondary && styles.secondaryButton,
        isDanger && styles.dangerButton,
        isDisabled &&
          (isPrimary
            ? styles.primaryDisabled
            : isDanger
              ? styles.dangerDisabled
              : styles.secondaryDisabled),
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#fff' : isDanger ? '#fff' : '#666'} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            isPrimary && styles.primaryText,
            isSecondary && styles.secondaryText,
            isDanger && styles.dangerText,
            isDisabled &&
              (isPrimary
                ? styles.primaryTextDisabled
                : isDanger
                  ? styles.dangerTextDisabled
                  : styles.secondaryTextDisabled),
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: MAIN_COLOR,
  },
  secondaryButton: {
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  dangerButton: {
    backgroundColor: ERROR_COLOR,
  },
  primaryDisabled: {
    backgroundColor: '#A5D6A7',
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  secondaryDisabled: {
    backgroundColor: '#F2F2F7',
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  dangerDisabled: {
    backgroundColor: '#FFD6DA',
    opacity: 0.7,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#3C3C43',
  },
  dangerText: {
    color: '#fff',
  },
  primaryTextDisabled: {
    color: '#FFFFFF',
    opacity: 0.6,
  },
  secondaryTextDisabled: {
    color: '#3C3C43',
    opacity: 0.4,
  },
  dangerTextDisabled: {
    color: '#fff',
    opacity: 0.7,
  },
});
