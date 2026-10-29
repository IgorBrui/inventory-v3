import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';

type Props = {
  icon?: string;
  title: string;
  subtitle?: string;
  detail?: string;
  indent?: number;
  chevron?: boolean;
  onPress?: () => void;
};

export function Row({ icon, title, subtitle, detail, indent = 0, chevron, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.row, { paddingLeft: 16 + indent * 20 }, pressed && styles.pressed]}
    >
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <View style={styles.texts}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      {chevron ? <Text style={styles.chevron}>›</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingRight: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  pressed: { backgroundColor: colors.fill },
  icon: { fontSize: 22, marginRight: 12 },
  texts: { flex: 1 },
  title: { color: colors.text, fontSize: 17 },
  subtitle: { color: colors.secondaryText, fontSize: 13, marginTop: 2 },
  detail: { color: colors.secondaryText, fontSize: 17, marginLeft: 8 },
  chevron: { color: colors.secondaryText, fontSize: 22, marginLeft: 8 },
});
