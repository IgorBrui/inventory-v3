import { useMemo } from 'react';
import { exportContainer } from '@/data/exportContainer';
import { getPropertyType } from '@/data/propertyTypes';
import { containerQrValue } from '@/models/containerQr';
import { useInventoryStore } from '@/store/inventoryStore';
import { ItemView } from './useHomeViewModel';

export function useContainerViewModel(id: number) {
  const container = useInventoryStore((s) => s.containers.find((c) => c.id === id));
  const room = useInventoryStore((s) => s.rooms.find((r) => r.id === container?.roomId));
  const allItems = useInventoryStore((s) => s.items);

  const items = useMemo<ItemView[]>(
    () =>
      allItems
        .filter((i) => i.containerId === id)
        .map((item) => ({ ...item, type: getPropertyType(item.typeId) })),
    [allItems, id],
  );

  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);

  return {
    container,
    room,
    items,
    totalQuantity,
    qrValue: containerQrValue(id),
    exportItems: () => (container ? exportContainer({ room, container, items }) : Promise.resolve()),
  };
}
