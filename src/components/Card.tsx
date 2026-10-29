import { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';

type Props = PropsWithChildren<{ title?: string; onTitlePress?: () => void }>;

// Сгруппированный блок в стиле списков iOS
export function Card({ title, onTitlePress, children }: Props) {
  return (
    <View style={styles.wrapper}>
      {title ? (
        <Pressable onPress={onTitlePress} disabled={!onTitlePress} style={styles.header} hitSlop={6}>
          <Text style={styles.title}>{title}</Text>
          {onTitlePress ? <Text style={styles.more}>•••</Text> : null}
        </Pressable>
      ) : null}
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: 16, marginBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, marginHorizontal: 16 },
  title: { flex: 1, color: colors.secondaryText, fontSize: 13, textTransform: 'uppercase' },
  more: { color: colors.accent, fontSize: 13 },
  card: { backgroundColor: colors.card, borderRadius: 12, overflow: 'hidden' },
});
