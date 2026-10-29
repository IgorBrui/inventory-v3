import { useEffect, useMemo, useState } from 'react';
import { debounceTime, distinctUntilChanged, map, Subject } from 'rxjs';
import { getPropertyType } from '@/data/propertyTypes';
import { Container, Item, PropertyType, Room } from '@/models/inventory';
import { useInventoryStore } from '@/store/inventoryStore';

export type ItemView = Item & { type: PropertyType };
export type ContainerNode = { container: Container; items: ItemView[] };
export type RoomNode = { room: Room; containers: ContainerNode[] };
export type SearchResult = { item: ItemView; location: string };

export function useHomeViewModel() {
  const rooms = useInventoryStore((s) => s.rooms);
  const containers = useInventoryStore((s) => s.containers);
  const items = useInventoryStore((s) => s.items);
  const loaded = useInventoryStore((s) => s.loaded);
  const saveRoom = useInventoryStore((s) => s.saveRoom);
  const deleteRoom = useInventoryStore((s) => s.deleteRoom);
  const syncStatus = useInventoryStore((s) => s.syncStatus);
  const syncError = useInventoryStore((s) => s.syncError);
  const sync = useInventoryStore((s) => s.sync);

  // Поиск «на лету»: ждём паузу в наборе и пропускаем повторы одного и того же запроса
  const [query, setQuery] = useState('');
  const query$ = useMemo(() => new Subject<string>(), []);

  useEffect(() => {
    const subscription = query$
      .pipe(
        debounceTime(250),
        map((text) => text.trim().toLowerCase()),
        distinctUntilChanged(),
      )
      .subscribe(setQuery);
    return () => subscription.unsubscribe();
  }, [query$]);

  const [expanded, setExpanded] = useState<ReadonlySet<number>>(new Set());

  const tree = useMemo<RoomNode[]>(
    () =>
      rooms.map((room) => ({
        room,
        containers: containers
          .filter((c) => c.roomId === room.id)
          .map((container) => ({
            container,
            items: items
              .filter((i) => i.containerId === container.id)
              .map((item) => ({ ...item, type: getPropertyType(item.typeId) })),
          })),
      })),
    [rooms, containers, items],
  );

  const results = useMemo<SearchResult[]>(() => {
    if (!query) return [];
    return tree.flatMap(({ room, containers }) =>
      containers.flatMap(({ container, items }) =>
        items
          .filter((item) => item.name.toLowerCase().includes(query))
          .map((item) => ({ item, location: `${room.name} › ${container.name}` })),
      ),
    );
  }, [tree, query]);

  const toggleContainer = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return {
    loaded,
    tree,
    isSearching: query.length > 0,
    results,
    onQueryChange: (text: string) => query$.next(text),
    syncStatus,
    syncError,
    sync,
    isExpanded: (id: number) => expanded.has(id),
    toggleContainer,
    hasRooms: rooms.length > 0,
    hasContainers: containers.length > 0,
    saveRoom: async (name: string, id?: number) => {
      if (name.trim()) await saveRoom({ name: name.trim() }, id);
    },
    deleteRoom,
  };
}
