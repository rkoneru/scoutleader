/**
 * Visual language: field-guide colours, high contrast, big touch targets.
 * Everything a screen needs comes from here so the look stays consistent.
 */

export const colors = {
  background: '#F4F1EA',
  surface: '#FFFFFF',
  surfaceMuted: '#EDE8DD',
  border: '#D8D1C2',
  text: '#1C2B24',
  textMuted: '#5B6A61',
  textInverse: '#F7F5F0',
  primary: '#20573C',
  primaryDark: '#163E2A',
  accent: '#B8651B',
  positive: '#2F7D4F',
  caution: '#B08018',
  negative: '#9E3B2E',
  overlay: 'rgba(28, 43, 36, 0.45)',
} as const;

export const dimensionColors = {
  communication: '#2F6FA8',
  conflict_resolution: '#9E3B2E',
  delegation: '#7A4E9E',
  planning: '#20573C',
  initiative: '#B8651B',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  pill: 999,
} as const;

export const type = {
  display: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.4 },
  title: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.2 },
  heading: { fontSize: 17, fontWeight: '700' as const },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyStrong: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
  small: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  smallStrong: { fontSize: 13, fontWeight: '700' as const, lineHeight: 18 },
  label: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.8 },
} as const;

export const shadow = {
  card: {
    shadowColor: '#1C2B24',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
} as const;
