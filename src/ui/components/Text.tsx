import React from 'react';
import { StyleSheet, Text as RNText, type TextProps, type TextStyle } from 'react-native';

import { colors, type as typeScale } from '../theme';

type Variant = keyof typeof typeScale;
type Tone = 'default' | 'muted' | 'inverse' | 'primary' | 'positive' | 'negative' | 'caution';

interface Props extends TextProps {
  variant?: Variant;
  tone?: Tone;
  center?: boolean;
}

const tones: Record<Tone, TextStyle> = {
  default: { color: colors.text },
  muted: { color: colors.textMuted },
  inverse: { color: colors.textInverse },
  primary: { color: colors.primary },
  positive: { color: colors.positive },
  negative: { color: colors.negative },
  caution: { color: colors.caution },
};

export function Text({ variant = 'body', tone = 'default', center, style, ...rest }: Props) {
  return (
    <RNText
      {...rest}
      style={[typeScale[variant], tones[tone], center && styles.center, style]}
    />
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
});
