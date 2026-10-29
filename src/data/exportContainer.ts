import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Container, PropertyType, Item, Room } from '@/models/inventory';

type ExportInput = {
  room: Room | undefined;
  container: Container;
  items: (Item & { type: PropertyType })[];
};

// Формирует JSON-файл со списком вещей контейнера и открывает системное меню «Поделиться»
export async function exportContainer({ room, container, items }: ExportInput) {
  const payload = {
    format: 'inventory-container',
    version: 1,
    exportedAt: new Date().toISOString(),
    room: room?.name ?? null,
    container: { name: container.name, description: container.description },
    items: items.map((item) => ({
      name: item.name,
      category: item.type.category,
      quantity: item.quantity,
      note: item.note,
    })),
  };

  const safeName = container.name.replace(/[\\/:*?"<>|«»]/g, '').trim() || 'container';
  const file = new File(Paths.cache, `${safeName}.json`);
  file.create({ overwrite: true });
  file.write(JSON.stringify(payload, null, 2));

  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', UTI: 'public.json' });
}
