import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BaseToast, ErrorToast, InfoToast, BaseToastProps } from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { MAIN_COLOR } from '@/src/constants/theme';

export const toastConfig = {
  success: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={styles.successToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text2NumberOfLines={3}
      renderLeadingIcon={() => (
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
        </View>
      )}
    />
  ),
  error: (props: BaseToastProps) => (
    <ErrorToast
      {...props}
      style={styles.errorToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text2NumberOfLines={3}
      renderLeadingIcon={() => (
        <View style={styles.iconContainer}>
          <Ionicons name="close-circle" size={28} color="#F44336" />
        </View>
      )}
    />
  ),
  info: (props: BaseToastProps) => (
    <InfoToast
      {...props}
      style={styles.infoToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text2NumberOfLines={3}
      renderLeadingIcon={() => (
        <View style={styles.iconContainer}>
          <Ionicons name="information-circle" size={28} color={MAIN_COLOR} />
        </View>
      )}
    />
  ),
};

const styles = StyleSheet.create({
  successToast: {
    borderLeftColor: '#4CAF50',
    borderLeftWidth: 5,
    backgroundColor: '#fff',
    height: 'auto',
    minHeight: 70,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  errorToast: {
    borderLeftColor: '#F44336',
    borderLeftWidth: 5,
    backgroundColor: '#fff',
    height: 'auto',
    minHeight: 70,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  infoToast: {
    borderLeftColor: MAIN_COLOR,
    borderLeftWidth: 5,
    backgroundColor: '#fff',
    height: 'auto',
    minHeight: 70,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  contentContainer: {
    paddingHorizontal: 15,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 15,
  },
  text1: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  text2: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666',
    marginTop: 2,
  },
});
