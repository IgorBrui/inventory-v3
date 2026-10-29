import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { Card } from '@/components/Card';
import { HeaderButton } from '@/components/HeaderButton';
import { Row } from '@/components/Row';
import { colors } from '@/theme';
import { useContainerViewModel } from '@/viewmodels/useContainerViewModel';

export default function ContainerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const containerId = Number(id);
  const vm = useContainerViewModel(containerId);

  if (!vm.container) {
    return <Text style={styles.empty}>Контейнер не найден</Text>;
  }

  return (
    <ScrollView style={styles.screen} contentInsetAdjustmentBehavior="automatic">
      <Stack.Screen
        options={{
          title: vm.container.name,
          headerRight: () => (
            <HeaderButton
              title="Изменить"
              onPress={() => router.push({ pathname: '/container-form', params: { id: containerId } })}
            />
          ),
        }}
      />

      <View style={styles.qr}>
        {/* Белая подложка нужна, чтобы код читался и в тёмной теме */}
        <View style={styles.qrBackground}>
          <QRCode value={vm.qrValue} size={180} />
        </View>
        <Text style={styles.qrCaption}>Маркировка контейнера №{vm.container.id}</Text>
      </View>

      <Card title="Контейнер">
        <Row icon="📦" title={vm.container.name} subtitle={vm.container.description || undefined} />
        <Row icon="🏠" title={vm.room?.name ?? '—'} subtitle="Комната" />
        <Row icon="🧮" title="Всего предметов" detail={String(vm.totalQuantity)} />
      </Card>

      <Card title={`Содержимое (${vm.items.length})`}>
        {vm.items.map((item) => (
          <Row
            key={item.id}
            icon={item.type.icon}
            title={item.name}
            subtitle={[item.type.category, item.note].filter(Boolean).join(' · ')}
            detail={`×${item.quantity}`}
            onPress={() => router.push({ pathname: '/item-form', params: { id: item.id } })}
          />
        ))}
        <Row
          icon="➕"
          title="Добавить вещь"
          onPress={() => router.push({ pathname: '/item-form', params: { containerId } })}
        />
      </Card>

      <Card>
        <Row icon="📤" title="Экспортировать список вещей" onPress={vm.exportItems} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, paddingTop: 12 },
  empty: { color: colors.secondaryText, textAlign: 'center', marginTop: 40 },
  qr: { alignItems: 'center', marginBottom: 20 },
  qrBackground: { backgroundColor: 'white', padding: 12, borderRadius: 12 },
  qrCaption: { color: colors.secondaryText, fontSize: 13, marginTop: 8 },
});
