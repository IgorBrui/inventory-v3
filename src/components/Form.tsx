import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '@/theme';

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
};

export function TextField({ label, value, onChangeText, placeholder, multiline }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.secondaryText}
        multiline={multiline}
      />
    </View>
  );
}

type Option<T> = { value: T; label: string };

type ChipSelectProps<T> = {
  label: string;
  options: Option<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
};

export function ChipSelect<T extends string | number>({ label, options, value, onChange }: ChipSelectProps<T>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chips}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

type StepperProps = { label: string; value: number; onChange: (value: number) => void; min?: number };

export function Stepper({ label, value, onChange, min = 1 }: StepperProps) {
  return (
    <View style={[styles.field, styles.stepperRow]}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <Pressable style={styles.stepButton} onPress={() => onChange(Math.max(min, value - 1))}>
        <Text style={styles.stepText}>−</Text>
      </Pressable>
      <Text style={styles.stepValue}>{value}</Text>
      <Pressable style={styles.stepButton} onPress={() => onChange(value + 1)}>
        <Text style={styles.stepText}>+</Text>
      </Pressable>
    </View>
  );
}

type ButtonProps = { title: string; onPress: () => void; destructive?: boolean };

export function FormButton({ title, onPress, destructive }: ButtonProps) {
  return (
    <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={onPress}>
      <Text style={[styles.buttonText, destructive && styles.destructive]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: { marginHorizontal: 16, marginBottom: 16 },
  label: { color: colors.secondaryText, fontSize: 13, textTransform: 'uppercase', marginBottom: 6, marginLeft: 4 },
  input: {
    backgroundColor: colors.card,
    color: colors.text,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 17,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: colors.card, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 7 },
  chipSelected: { backgroundColor: colors.accent },
  chipText: { color: colors.text, fontSize: 15 },
  chipTextSelected: { color: 'white' },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 8,
    paddingLeft: 12,
  },
  stepperLabel: { flex: 1, color: colors.text, fontSize: 17 },
  stepButton: {
    width: 36,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.fill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { color: colors.accent, fontSize: 20 },
  stepValue: { color: colors.text, fontSize: 17, minWidth: 40, textAlign: 'center' },
  button: { marginHorizontal: 16, marginBottom: 12, backgroundColor: colors.card, borderRadius: 10, padding: 13 },
  pressed: { opacity: 0.6 },
  buttonText: { color: colors.accent, fontSize: 17, textAlign: 'center' },
  destructive: { color: colors.danger },
});
