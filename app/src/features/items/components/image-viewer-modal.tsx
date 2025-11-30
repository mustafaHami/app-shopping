import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Image, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MAIN_COLOR } from '@/src/constants/theme';

interface ImageViewerModalProps {
  visible: boolean;
  imageUrl: string | null;
  itemTitle?: string;
  onClose: () => void;
}

export function ImageViewerModal({ visible, imageUrl, itemTitle, onClose }: ImageViewerModalProps) {
  if (!imageUrl) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
          <View style={styles.closeButtonInner}>
            <Ionicons name="close" size={28} color="#fff" />
          </View>
        </TouchableOpacity>

        {itemTitle && (
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {itemTitle}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.imageContainer} activeOpacity={1} onPress={onClose}>
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Tap anywhere to close</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  closeButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 80,
    zIndex: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 100,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
});
