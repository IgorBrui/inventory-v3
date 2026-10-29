import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '@/theme';

type Props = { title: string; onPress: () => void; disabled?: boolean; bold?: boolean };

export function HeaderButton({ title, onPress, disabled, bold }: Props) {
  return (
    <Pressable onPress={onPress} disabled={disabled} hitSlop={10} style={styles.button}>
      <Text style={[styles.text, bold && styles.bold, disabled && styles.disabled]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { paddingHorizontal: 6 },
  text: { color: colors.accent, fontSize: 17 },
  bold: { fontWeight: '600' },
  disabled: { opacity: 0.35 },
});
