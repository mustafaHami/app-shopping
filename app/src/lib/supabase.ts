import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const supabaseUrl =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  '';
const supabaseAnonKey =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  '';

// Custom storage implementation using Expo SecureStore with chunking for large values
const CHUNK_SIZE = 2000; // Leave some buffer below the 2048 limit

const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }

    try {
      // Try to get the value directly first
      const value = await SecureStore.getItemAsync(key);
      if (value) {
        // Check if it's a chunked value
        if (value.startsWith('chunked:')) {
          const chunkCount = parseInt(value.split(':')[1], 10);
          const chunks: string[] = [];

          for (let i = 0; i < chunkCount; i++) {
            const chunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`);
            if (chunk) {
              chunks.push(chunk);
            }
          }

          return chunks.join('');
        }
        return value;
      }
      return null;
    } catch (error) {
      console.error('Error getting item from SecureStore:', error);
      return null;
    }
  },

  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }

    try {
      // If value is small enough, store it normally
      if (value.length < CHUNK_SIZE) {
        await SecureStore.setItemAsync(key, value);
        return;
      }

      // Split into chunks
      const chunks: string[] = [];
      for (let i = 0; i < value.length; i += CHUNK_SIZE) {
        chunks.push(value.slice(i, i + CHUNK_SIZE));
      }

      // Store metadata about chunks
      await SecureStore.setItemAsync(key, `chunked:${chunks.length}`);

      // Store each chunk
      for (let i = 0; i < chunks.length; i++) {
        await SecureStore.setItemAsync(`${key}_chunk_${i}`, chunks[i]);
      }
    } catch (error) {
      console.error('Error setting item in SecureStore:', error);
      throw error;
    }
  },

  removeItem: async (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }

    try {
      const value = await SecureStore.getItemAsync(key);

      if (value?.startsWith('chunked:')) {
        const chunkCount = parseInt(value.split(':')[1], 10);

        // Remove all chunks
        for (let i = 0; i < chunkCount; i++) {
          await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
        }
      }

      // Remove the main key
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error removing item from SecureStore:', error);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
