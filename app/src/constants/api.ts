import { Platform } from 'react-native';

// For physical devices, use your computer's local network IP
// Get it by running: ipconfig getifaddr en0 (Mac) or ipconfig (Windows)
const LOCAL_IP = '192.168.1.43';

export const API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3000'
    : __DEV__
      ? `http://${LOCAL_IP}:3000` // For Expo Go on physical devices
      : 'http://localhost:3000'; // For simulator/emulator
