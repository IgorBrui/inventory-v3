import { ScrollView, StyleSheet } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ChipSelect, FormButton, Stepper, TextField } from '@/components/Form';
import { HeaderButton } from '@/components/HeaderButton';
import { colors } from '@/theme';
import { confirmDelete } from '@/utils/dialogs';
import { useItemFormViewModel } from '@/viewmodels/useItemFormViewModel';

export default function ItemFormScreen() {
  const params = useLocalSearchParams<{ id?: string; containerId?: string }>();
  const vm = useItemFormViewModel(Number(params.id) || undefined, Number(params.containerId) || undefined);

  const save = async () => {
    await vm.save();
    router.back();
  };

  const remove = async () => {
    if (await confirmDelete(`Удалить «${vm.name}»?`, 'Вещь будет удалена из контейнера.')) {
      await vm.remove();
      router.back();
    }
  };

  return (
    <ScrollView style={styles.screen} contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled">
      <Stack.Screen
        options={{
          title: vm.isEditing ? 'Вещь' : 'Новая вещь',
          headerLeft: () => <HeaderButton title="Отмена" onPress={router.back} />,
          headerRight: () => <HeaderButton title="Готово" bold disabled={!vm.canSave} onPress={save} />,
        }}
      />
      <TextField label="Название" value={vm.name} onChangeText={vm.setName} placeholder="Например, HDMI-кабель" />
      <Stepper label="Количество" value={vm.quantity} onChange={vm.setQuantity} />
      <ChipSelect label="Тип имущества" options={vm.typeOptions} value={vm.typeId} onChange={vm.setTypeId} />
      <ChipSelect label="Контейнер" options={vm.containerOptions} value={vm.containerId} onChange={vm.setContainerId} />
      <TextField label="Заметка" value={vm.note} onChangeText={vm.setNote} placeholder="Необязательно" multiline />
      {vm.isEditing ? <FormButton title="Удалить вещь" destructive onPress={remove} /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, paddingTop: 16 },
});
