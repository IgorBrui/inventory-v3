import { PlatformColor } from 'react-native';

// Системные цвета iOS: автоматически подстраиваются под светлую и тёмную тему
export const colors = {
  background: PlatformColor('systemGroupedBackground'),
  card: PlatformColor('secondarySystemGroupedBackground'),
  text: PlatformColor('label'),
  secondaryText: PlatformColor('secondaryLabel'),
  separator: PlatformColor('separator'),
  accent: PlatformColor('systemBlue'),
  danger: PlatformColor('systemRed'),
  fill: PlatformColor('tertiarySystemFill'),
};
