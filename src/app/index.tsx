import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text } from 'react-native';
import { Stack, router } from 'expo-router';
import { Card } from '@/components/Card';
import { HeaderButton } from '@/components/HeaderButton';
import { Row } from '@/components/Row';
import { Room } from '@/models/inventory';
import { colors } from '@/theme';
import { confirmDelete, promptText, showActions } from '@/utils/dialogs';
import { ContainerNode, useHomeViewModel } from '@/viewmodels/useHomeViewModel';

export default function HomeScreen() {
  const vm = useHomeViewModel();

  const openContainer = (id: number) => router.push(`/container/${id}`);
  const openItem = (id: number) => router.push({ pathname: '/item-form', params: { id } });
  const addContainer = (roomId?: number) => router.push({ pathname: '/container-form', params: { roomId } });

  const addRoom = async () => {
    const name = await promptText('Новая комната');
    if (name !== null) await vm.saveRoom(name);
  };

  const showAddMenu = () =>
    showActions('Добавить', [
      { title: 'Комнату', run: addRoom },
      ...(vm.hasRooms ? [{ title: 'Контейнер', run: () => addContainer() }] : []),
      ...(vm.hasContainers ? [{ title: 'Вещь', run: () => router.push('/item-form') }] : []),
    ]);

  const showRoomMenu = (room: Room) =>
    showActions(room.name, [
      { title: 'Добавить контейнер', run: () => addContainer(room.id) },
      {
        title: 'Переименовать',
        run: async () => {
          const name = await promptText('Название комнаты', room.name);
          if (name !== null) await vm.saveRoom(name, room.id);
        },
      },
      {
        title: 'Удалить комнату',
        destructive: true,
        run: async () => {
          if (await confirmDelete(`Удалить «${room.name}»?`, 'Все контейнеры и вещи в комнате тоже будут удалены.')) {
            await vm.deleteRoom(room.id);
          }
        },
      },
    ]);

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => <HeaderButton title="Сканер" onPress={() => router.push('/scan')} />,
          headerRight: () => <HeaderButton title="Добавить" onPress={showAddMenu} />,
          headerSearchBarOptions: {
            placeholder: 'Поиск вещей',
            onChangeText: (e) => vm.onQueryChange(e.nativeEvent.text),
          },
        }}
      />
      <ScrollView
        style={styles.screen}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={<RefreshControl refreshing={vm.syncStatus === 'syncing'} onRefresh={vm.sync} />}
      >
        {!vm.loaded ? <ActivityIndicator style={styles.loader} /> : null}

        {vm.syncStatus === 'failed' ? (
          <Card>
            <Row
              icon="⚠️"
              title="Не удалось обновить данные"
              subtitle={`${vm.syncError}. Показаны локальные данные.`}
              detail="Повторить"
              onPress={vm.sync}
            />
          </Card>
        ) : null}

        {vm.loaded && !vm.hasRooms ? (
          <Text style={styles.empty}>Пока пусто. Нажмите «Добавить», чтобы создать первую комнату.</Text>
        ) : null}

        {vm.isSearching ? (
          vm.results.length > 0 ? (
            <Card title={`Найдено: ${vm.results.length}`}>
              {vm.results.map(({ item, location }) => (
                <Row
                  key={item.id}
                  icon={item.type.icon}
                  title={item.name}
                  subtitle={`📍 ${location}`}
                  detail={`×${item.quantity}`}
                  onPress={() => openContainer(item.containerId)}
                />
              ))}
            </Card>
          ) : (
            <Text style={styles.empty}>Ничего не найдено</Text>
          )
        ) : (
          vm.tree.map(({ room, containers }) => (
            <Card key={room.id} title={`🏠 ${room.name}`} onTitlePress={() => showRoomMenu(room)}>
              {containers.map((node) => (
                <ContainerTree
                  key={node.container.id}
                  node={node}
                  expanded={vm.isExpanded(node.container.id)}
                  onToggle={() => vm.toggleContainer(node.container.id)}
                  onOpen={() => openContainer(node.container.id)}
                  onOpenItem={openItem}
                />
              ))}
              {containers.length === 0 ? (
                <Row title="Добавить контейнер" icon="➕" onPress={() => addContainer(room.id)} />
              ) : null}
            </Card>
          ))
        )}

        <Card>
          <Row icon="🛠" title="Отладка БД" onPress={() => router.push('/debug')} />
        </Card>
      </ScrollView>
    </>
  );
}

type TreeProps = {
  node: ContainerNode;
  expanded: boolean;
  onToggle: () => void;
  onOpen: () => void;
  onOpenItem: (id: number) => void;
};

function ContainerTree({ node: { container, items }, expanded, onToggle, onOpen, onOpenItem }: TreeProps) {
  return (
    <>
      <Row
        icon={expanded ? '📂' : '📦'}
        title={container.name}
        subtitle={container.description || undefined}
        detail={`${items.length} ${expanded ? '▾' : '▸'}`}
        onPress={onToggle}
      />
      {expanded ? (
        <>
          {items.map((item) => (
            <Row
              key={item.id}
              indent={1}
              icon={item.type.icon}
              title={item.name}
              detail={`×${item.quantity}`}
              onPress={() => onOpenItem(item.id)}
            />
          ))}
          <Row indent={1} title="Открыть карточку контейнера" chevron onPress={onOpen} />
        </>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, paddingTop: 12 },
  loader: { marginTop: 24 },
  empty: { color: colors.secondaryText, textAlign: 'center', marginTop: 24, marginHorizontal: 32 },
});
