import { useMemo, useState } from 'react';
import { fallbackType, propertyTypes } from '@/data/propertyTypes';
import { useInventoryStore } from '@/store/inventoryStore';

const typeOptions = propertyTypes.map((t) => ({ value: t.id, label: `${t.icon} ${t.category}` }));

export function useItemFormViewModel(id?: number, initialContainerId?: number) {
  const rooms = useInventoryStore((s) => s.rooms);
  const containers = useInventoryStore((s) => s.containers);
  const existing = useInventoryStore((s) => s.items.find((i) => i.id === id));
  const saveItem = useInventoryStore((s) => s.saveItem);
  const deleteItem = useInventoryStore((s) => s.deleteItem);

  const [name, setName] = useState(existing?.name ?? '');
  const [typeId, setTypeId] = useState(existing?.typeId ?? fallbackType.id);
  const [quantity, setQuantity] = useState(existing?.quantity ?? 1);
  const [note, setNote] = useState(existing?.note ?? '');
  const [containerId, setContainerId] = useState(existing?.containerId ?? initialContainerId ?? containers[0]?.id);

  const containerOptions = useMemo(
    () =>
      containers.map((c) => ({
        value: c.id,
        label: `${rooms.find((r) => r.id === c.roomId)?.name ?? '?'} › ${c.name}`,
      })),
    [rooms, containers],
  );

  return {
    isEditing: existing !== undefined,
    name,
    setName,
    typeId,
    setTypeId,
    quantity,
    setQuantity,
    note,
    setNote,
    containerId,
    setContainerId,
    typeOptions,
    containerOptions,
    canSave: name.trim().length > 0 && containerId !== undefined,
    save: () =>
      saveItem({ containerId: containerId!, name: name.trim(), typeId, quantity, note: note.trim() }, existing?.id),
    remove: () => (existing ? deleteItem(existing.id) : Promise.resolve()),
  };
}
