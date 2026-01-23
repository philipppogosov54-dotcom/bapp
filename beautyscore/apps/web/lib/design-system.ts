/**
 * BeautyScore Design System
 * 
 * Centralized design tokens and utilities
 * Based on memory: Inline Styles (React style objects), NOT Tailwind CSS
 */

// ============================================
// Colors
// ============================================

export const colors = {
  // Primary palette
  primary: '#FDFCFB',      // белый
  secondary: '#F7F5F3',    // бежевый
  
  // Accent colors
  accentGreen: '#2D7A4F',
  accentOrange: '#C4804D',
  
  // Text colors
  textPrimary: '#1A1714',
  textSecondary: '#4A4540',
  textTertiary: '#8C8177',
  textHint: '#6B6259',
  textInverse: '#FDFCFB',
  
  // Status colors
  success: '#2D7A4F',
  warning: '#C4804D',
  error: '#D64550',
  info: '#4A7AB8',
  
  // Borders
  border: '#E5E0DB',
  borderLight: '#F0EDE9',
  
  // Backgrounds
  bgPrimary: '#FDFCFB',
  bgSecondary: '#F7F5F3',
  bgTertiary: '#EDE9E4',
  bgOverlay: 'rgba(26, 23, 20, 0.5)',
  bgCard: '#FFFFFF',
} as const

// ============================================
// Typography
// ============================================

export const typography = {
  fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  
  // Font sizes
  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },
  
  // Font weights
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Line heights
  lineHeights: {
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
  },
} as const

// ============================================
// Spacing
// ============================================

export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
} as const

// ============================================
// Border Radius
// ============================================

export const radius = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',      // buttons
  xl: '16px',      // buttons large
  '2xl': '20px',   // cards
  '3xl': '24px',   // cards large
  full: '9999px',
} as const

// ============================================
// Shadows
// ============================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(26, 23, 20, 0.05)',
  base: '0 1px 3px 0 rgba(26, 23, 20, 0.1), 0 1px 2px 0 rgba(26, 23, 20, 0.06)',
  md: '0 4px 6px -1px rgba(26, 23, 20, 0.1), 0 2px 4px -1px rgba(26, 23, 20, 0.06)',
  lg: '0 10px 15px -3px rgba(26, 23, 20, 0.1), 0 4px 6px -2px rgba(26, 23, 20, 0.05)',
  xl: '0 20px 25px -5px rgba(26, 23, 20, 0.1), 0 10px 10px -5px rgba(26, 23, 20, 0.04)',
} as const

// ============================================
// Breakpoints
// ============================================

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

// ============================================
// Z-Index
// ============================================

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modal: 40,
  popover: 50,
  tooltip: 60,
  toast: 70,
} as const

// ============================================
// Transitions
// ============================================

export const transitions = {
  fast: '150ms ease-in-out',
  normal: '200ms ease-in-out',
  slow: '300ms ease-in-out',
} as const

// ============================================
// Export all as single object
// ============================================

export const designSystem = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  breakpoints,
  zIndex,
  transitions,
} as const

export default designSystem
