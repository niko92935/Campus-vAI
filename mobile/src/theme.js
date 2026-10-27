import { Platform } from 'react-native';

export const colors = {
  bg: '#090807',
  bgDeep: '#050403',
  surface: '#131110',
  surfaceAlt: '#181512',
  surfaceRaised: '#1E1A16',
  border: '#29231D',
  borderStrong: '#3B3228',
  gold: '#D4AF37',
  goldBright: '#F3CE62',
  goldDeep: '#A77D1C',
  goldSoft: 'rgba(212, 175, 55, 0.12)',
  goldFaint: 'rgba(212, 175, 55, 0.06)',
  text: '#F8F5EF',
  textMuted: '#A79E92',
  textDim: '#786F65',
  green: '#4ADE80',
  greenSoft: 'rgba(74, 222, 128, 0.12)',
  blue: '#7DD3FC',
  blueSoft: 'rgba(125, 211, 252, 0.12)',
  purple: '#C4B5FD',
  purpleSoft: 'rgba(196, 181, 253, 0.12)',
  red: '#F87171',
  redSoft: 'rgba(248, 113, 113, 0.12)',
  orange: '#FDBA74',
  orangeSoft: 'rgba(253, 186, 116, 0.12)',
  white: '#FFFFFF',
  overlay: 'rgba(3, 2, 2, 0.72)',
};

export const accents = {
  gold: { fg: colors.gold, bg: colors.goldSoft, border: 'rgba(212, 175, 55, 0.26)' },
  blue: { fg: colors.blue, bg: colors.blueSoft, border: 'rgba(125, 211, 252, 0.24)' },
  green: { fg: colors.green, bg: colors.greenSoft, border: 'rgba(74, 222, 128, 0.24)' },
  purple: { fg: colors.purple, bg: colors.purpleSoft, border: 'rgba(196, 181, 253, 0.24)' },
  red: { fg: colors.red, bg: colors.redSoft, border: 'rgba(248, 113, 113, 0.24)' },
  orange: { fg: colors.orange, bg: colors.orangeSoft, border: 'rgba(253, 186, 116, 0.24)' },
};

export const radii = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
};

export const shadow = Platform.select({
  web: {
    boxShadow: '0 20px 55px rgba(0, 0, 0, 0.45)',
  },
  default: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 8,
  },
});

export const softShadow = Platform.select({
  web: {
    boxShadow: '0 10px 28px rgba(0, 0, 0, 0.28)',
  },
  default: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 4,
  },
});

export const fonts = {
  display: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.8,
  },
  h1: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.6,
  },
  h2: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: colors.text,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
  },
  small: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
  },
  tiny: {
    fontSize: 10,
    lineHeight: 14,
    color: colors.textDim,
  },
  eyebrow: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1.3,
    color: colors.gold,
    textTransform: 'uppercase',
  },
};
