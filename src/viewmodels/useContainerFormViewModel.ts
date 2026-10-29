import { useState } from 'react';
import { useInventoryStore } from '@/store/inventoryStore';

export function useContainerFormViewModel(id?: number, initialRoomId?: number) {
  const rooms = useInventoryStore((s) => s.rooms);
  const existing = useInventoryStore((s) => s.containers.find((c) => c.id === id));
  const saveContainer = useInventoryStore((s) => s.saveContainer);
  const deleteContainer = useInventoryStore((s) => s.deleteContainer);

  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [roomId, setRoomId] = useState(existing?.roomId ?? initialRoomId ?? rooms[0]?.id);

  return {
    isEditing: existing !== undefined,
    name,
    setName,
    description,
    setDescription,
    roomId,
    setRoomId,
    roomOptions: rooms.map((r) => ({ value: r.id, label: r.name })),
    canSave: name.trim().length > 0 && roomId !== undefined,
    save: () =>
      saveContainer({ roomId: roomId!, name: name.trim(), description: description.trim() }, existing?.id),
    remove: () => (existing ? deleteContainer(existing.id) : Promise.resolve()),
  };
}
