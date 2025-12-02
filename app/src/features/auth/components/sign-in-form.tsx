import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema } from '../schemas/auth-schema';
import { SignInData } from '../types';
import { useSignIn } from '../hooks/use-auth';
import { MAIN_COLOR } from '@/src/constants/theme';
import { showToast } from '@/src/utils/toast';

interface SignInFormProps {
  onSuccess?: () => void;
  onSwitchToSignUp?: () => void;
}

export function SignInForm({ onSuccess, onSwitchToSignUp }: SignInFormProps) {
  const { mutate: signIn, isPending } = useSignIn();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      pseudonym: '',
      password: '',
    },
  });

  const onSubmit = (data: SignInData) => {
    signIn(data, {
      onSuccess: () => {
        onSuccess?.();
      },
      onError: error => {
        showToast.error({
          title: 'Sign In Failed',
          message: error.message || 'Failed to sign in',
        });
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>

      <Controller
        control={control}
        name="pseudonym"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.fieldContainer}>
            <TextInput
              style={[styles.input, errors.pseudonym && styles.inputError]}
              placeholder="Pseudonym"
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
            <View style={{ position: 'relative' }}>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="Password"
                secureTextEntry={!showPassword}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                editable={!isPending}
              />
              <TouchableOpacity
                style={{ position: 'absolute', right: 12, top: 12, zIndex: 10 }}
                onPress={() => setShowPassword(p => !p)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
          </View>
        )}
      />

      <TouchableOpacity
        style={[styles.button, isPending && styles.buttonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={isPending}
      >
        <Text style={styles.buttonText}>{isPending ? 'Signing In...' : 'Sign In'}</Text>
      </TouchableOpacity>

      {onSwitchToSignUp && (
        <TouchableOpacity onPress={onSwitchToSignUp} style={styles.linkButton}>
          <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ff0000',
  },
  errorText: {
    color: '#ff0000',
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: MAIN_COLOR,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: MAIN_COLOR,
    fontSize: 14,
  },
});
