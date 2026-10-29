import { ScrollView, StyleSheet } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ChipSelect, FormButton, TextField } from '@/components/Form';
import { HeaderButton } from '@/components/HeaderButton';
import { colors } from '@/theme';
import { confirmDelete } from '@/utils/dialogs';
import { useContainerFormViewModel } from '@/viewmodels/useContainerFormViewModel';

export default function ContainerFormScreen() {
  const params = useLocalSearchParams<{ id?: string; roomId?: string }>();
  const vm = useContainerFormViewModel(Number(params.id) || undefined, Number(params.roomId) || undefined);

  const save = async () => {
    const id = await vm.save();
    router.back();
    if (!vm.isEditing) router.push(`/container/${id}`);
  };

  const remove = async () => {
    if (await confirmDelete(`Удалить «${vm.name}»?`, 'Все вещи в контейнере тоже будут удалены.')) {
      await vm.remove();
      router.dismissTo('/');
    }
  };

  return (
    <ScrollView style={styles.screen} contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled">
      <Stack.Screen
        options={{
          title: vm.isEditing ? 'Контейнер' : 'Новый контейнер',
          headerLeft: () => <HeaderButton title="Отмена" onPress={router.back} />,
          headerRight: () => <HeaderButton title="Готово" bold disabled={!vm.canSave} onPress={save} />,
        }}
      />
      <TextField label="Название" value={vm.name} onChangeText={vm.setName} placeholder="Например, Коробка «Зима»" />
      <TextField
        label="Описание"
        value={vm.description}
        onChangeText={vm.setDescription}
        placeholder="Где стоит, как выглядит"
        multiline
      />
      <ChipSelect label="Комната" options={vm.roomOptions} value={vm.roomId} onChange={vm.setRoomId} />
      {vm.isEditing ? <FormButton title="Удалить контейнер" destructive onPress={remove} /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, paddingTop: 16 },
});
