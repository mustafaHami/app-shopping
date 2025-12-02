import React, { useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema } from '../schemas/auth-schema';
import { SignUpData } from '../types';
import { useSignUp } from '../hooks/use-auth';
import {
  PRIMARY_COLOR,
  SECONDARY_COLOR,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_MUTED,
  ERROR_COLOR,
  BorderRadius,
  Spacing,
} from '@/src/constants/theme';
import { showToast } from '@/src/utils/toast';

interface SignUpFormProps {
  onSuccess?: () => void;
  onSwitchToSignIn?: () => void;
}

export function SignUpForm({ onSuccess, onSwitchToSignIn }: SignUpFormProps) {
  const { mutate: signUp, isPending } = useSignUp();
  const [showPassword, setShowPassword] = useState(false);

  // Button animation
  const buttonScale = useRef(new Animated.Value(1)).current;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      pseudonym: '',
      password: '',
    },
  });

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const onSubmit = (data: SignUpData) => {
    signUp(data, {
      onSuccess: () => {
        // Small delay to ensure list is created and queries are ready
        setTimeout(() => {
          onSuccess?.();

          // Show toast after navigation
          setTimeout(() => {
            showToast.success({
              title: 'Account Created! 🎉',
              message: 'Welcome to Shopping List',
            });
          }, 300);
        }, 100);
      },
      onError: error => {
        showToast.error({
          title: 'Sign Up Failed',
          message: error.message || 'Failed to create account',
        });
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Get Started</Text>
      <Text style={styles.subtitle}>Create your account</Text>

      <Controller
        control={control}
        name="pseudonym"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Pseudonym</Text>
            <TextInput
              style={[styles.input, errors.pseudonym && styles.inputError]}
              placeholder="Choose a pseudonym"
              placeholderTextColor={TEXT_MUTED}
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              editable={!isPending}
            />
            {errors.pseudonym && <Text style={styles.errorText}>{errors.pseudonym.message}</Text>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
                placeholder="Create a password"
                placeholderTextColor={TEXT_MUTED}
                secureTextEntry={!showPassword}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                editable={!isPending}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(p => !p)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={TEXT_MUTED}
                />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
            <Text style={styles.hintText}>
              At least 8 characters with uppercase, lowercase, and number
            </Text>
          </View>
        )}
      />

      <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: buttonScale }] }]}>
        <TouchableOpacity
          style={[styles.button, isPending && styles.buttonDisabled]}
          onPress={handleSubmit(onSubmit)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isPending}
          activeOpacity={1}
        >
          <Text style={styles.buttonText}>{isPending ? 'Creating Account...' : 'Sign Up'}</Text>
        </TouchableOpacity>
      </Animated.View>

      {onSwitchToSignIn && (
        <TouchableOpacity onPress={onSwitchToSignIn} style={styles.linkButton}>
          <Text style={styles.linkText}>
            Already have an account? <Text style={styles.linkTextHighlight}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  fieldContainer: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_SECONDARY,
    marginBottom: Spacing.xs,
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
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 12,
    zIndex: 10,
    padding: 2,
  },
  inputError: {
    borderColor: ERROR_COLOR,
    backgroundColor: '#fff5f5',
  },
  errorText: {
    color: ERROR_COLOR,
    fontSize: 12,
    marginTop: Spacing.xs,
    fontWeight: '500',
  },
  hintText: {
    color: TEXT_MUTED,
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  buttonWrapper: {
    marginTop: Spacing.md,
  },
  button: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: BorderRadius.md,
    padding: 16,
    alignItems: 'center',
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  linkButton: {
    marginTop: Spacing.lg,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  linkText: {
    color: TEXT_SECONDARY,
    fontSize: 15,
  },
  linkTextHighlight: {
    color: SECONDARY_COLOR,
    fontWeight: '700',
  },
});
