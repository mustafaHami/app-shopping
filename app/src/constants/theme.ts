/**
 * Modern, friendly shopping list app color palette.
 * Colors are defined for light and dark modes.
 */

import { Platform } from 'react-native';

// ============================================
// NEW COLOR PALETTE
// ============================================

// Primary - Fresh mint green
export const PRIMARY_COLOR = '#9aecb0';
export const PRIMARY_DARK = '#7ed99a'; // Darker shade for pressed states

// Secondary - Soft teal green
export const SECONDARY_COLOR = '#75e2b7';

// Accent 1 - Warm yellow
export const ACCENT_YELLOW = '#fee77b';

// Accent 2 - Warm orange
export const ACCENT_ORANGE = '#fecb5f';

// Error color - Soft coral red
export const ERROR_COLOR = '#FF626F';

// Success color - Using primary as base
export const SUCCESS_COLOR = '#4CAF50';

// ============================================
// DERIVED COLORS
// ============================================

// Background tints (very light versions of main colors)
export const BG_TINT_PRIMARY = '#f0fbf3'; // Very light mint
export const BG_TINT_SECONDARY = '#e8f9f2'; // Very light teal

// Text colors
export const TEXT_PRIMARY = '#1a1a1a';
export const TEXT_SECONDARY = '#666666';
export const TEXT_MUTED = '#999999';
export const TEXT_ON_PRIMARY = '#1a1a1a'; // Dark text on mint buttons for contrast

// Border colors
export const BORDER_LIGHT = '#e8e8e8';
export const BORDER_DEFAULT = '#d0d0d0';

// Legacy export for backward compatibility
export const MAIN_COLOR = PRIMARY_COLOR;

const tintColorLight = PRIMARY_COLOR;
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: TEXT_PRIMARY,
    background: '#fff',
    backgroundTint: BG_TINT_PRIMARY,
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    main: PRIMARY_COLOR,
    primary: PRIMARY_COLOR,
    primaryDark: PRIMARY_DARK,
    secondary: SECONDARY_COLOR,
    accentYellow: ACCENT_YELLOW,
    accentOrange: ACCENT_ORANGE,
    error: ERROR_COLOR,
    success: SUCCESS_COLOR,
    border: BORDER_LIGHT,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    backgroundTint: '#1a2420',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    main: tintColorDark,
    primary: PRIMARY_COLOR,
    primaryDark: PRIMARY_DARK,
    secondary: SECONDARY_COLOR,
    accentYellow: ACCENT_YELLOW,
    accentOrange: ACCENT_ORANGE,
    error: ERROR_COLOR,
    success: SUCCESS_COLOR,
    border: '#333',
  },
};

// ============================================
// GRADIENTS
// ============================================
export const Gradients = {
  // Primary gradient for auth screens background
  authBackground: ['#9aecb0', '#75e2b7'] as const,
  // Subtle header gradient
  header: ['#f8fdf9', '#f0fbf3'] as const,
  // Card highlight gradient
  cardHighlight: ['#ffffff', '#f8fdf9'] as const,
};

// ============================================
// SHADOWS
// ============================================
export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  colored: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  }),
};

// ============================================
// SPACING & SIZING
// ============================================
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

// ============================================
// FONTS
// ============================================
export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
