import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import {
  PRIMARY_COLOR,
  PRIMARY_DARK,
  SECONDARY_COLOR,
  ERROR_COLOR,
  TEXT_PRIMARY,
  BorderRadius,
} from '@/src/constants/theme';

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

  // Animation for press feedback
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
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

  return (
    <Animated.View style={[styles.animatedWrapper, { transform: [{ scale: scaleAnim }] }]}>
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
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={1}
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  animatedWrapper: {
    flex: 1,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButton: {
    backgroundColor: PRIMARY_COLOR,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  dangerButton: {
    backgroundColor: ERROR_COLOR,
    shadowColor: ERROR_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryDisabled: {
    backgroundColor: '#c5f0cf',
    opacity: 0.8,
    shadowOpacity: 0,
    elevation: 0,
  },
  secondaryDisabled: {
    backgroundColor: '#F5F5F5',
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  dangerDisabled: {
    backgroundColor: '#FFB3B9',
    opacity: 0.8,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  primaryText: {
    color: '#fff',
  },
  secondaryText: {
    color: '#3C3C43',
  },
  dangerText: {
    color: '#fff',
  },
  primaryTextDisabled: {
    color: '#fff',
    opacity: 0.7,
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
