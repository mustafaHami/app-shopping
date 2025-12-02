import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BaseToast, ErrorToast, InfoToast, BaseToastProps } from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import {
  PRIMARY_COLOR,
  SECONDARY_COLOR,
  ERROR_COLOR,
  SUCCESS_COLOR,
  BorderRadius,
} from '@/src/constants/theme';

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
          <View style={styles.successIconBg}>
            <Ionicons name="checkmark" size={18} color="#fff" />
          </View>
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
          <View style={styles.errorIconBg}>
            <Ionicons name="close" size={18} color="#fff" />
          </View>
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
          <View style={styles.infoIconBg}>
            <Ionicons name="information" size={18} color="#fff" />
          </View>
        </View>
      )}
    />
  ),
};

const styles = StyleSheet.create({
  successToast: {
    borderLeftColor: PRIMARY_COLOR,
    borderLeftWidth: 5,
    backgroundColor: '#fff',
    height: 'auto',
    minHeight: 70,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  errorToast: {
    borderLeftColor: ERROR_COLOR,
    borderLeftWidth: 5,
    backgroundColor: '#fff',
    height: 'auto',
    minHeight: 70,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  infoToast: {
    borderLeftColor: SECONDARY_COLOR,
    borderLeftWidth: 5,
    backgroundColor: '#fff',
    height: 'auto',
    minHeight: 70,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  contentContainer: {
    paddingHorizontal: 15,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 15,
  },
  successIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ERROR_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: SECONDARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
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
