import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Get API URL from environment variable or use default
const ENV_API_URL =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL;

// For physical devices, use your computer's local network IP
// Get it by running: ipconfig getifaddr en0 (Mac) or ipconfig (Windows)
const LOCAL_IP = '192.168.1.43';

// Use environment variable if set, otherwise fallback to local development URLs
export const API_BASE_URL =
  ENV_API_URL ||
  (Platform.OS === 'android'
    ? 'http://10.0.2.2:3000'
    : __DEV__
      ? `http://${LOCAL_IP}:3000` // For Expo Go on physical devices
      : 'http://localhost:3000'); // For simulator/emulator
