import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useInventoryStore } from '@/store/inventoryStore';

export default function RootLayout() {
  const start = useInventoryStore((s) => s.start);

  useEffect(() => {
    start();
  }, [start]);

  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="index" options={{ title: 'Инвентаризация', headerLargeTitleEnabled: true }} />
      <Stack.Screen name="container/[id]" options={{ title: 'Контейнер' }} />
      <Stack.Screen name="container-form" options={{ presentation: 'modal' }} />
      <Stack.Screen name="item-form" options={{ presentation: 'modal' }} />
      <Stack.Screen name="scan" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="debug" options={{ title: 'Отладка БД' }} />
    </Stack>
  );
}
