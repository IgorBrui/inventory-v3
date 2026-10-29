import { concatMap, from, Subscription } from 'rxjs';
import { create } from 'zustand';
import { migrateDatabase } from '@/data/database';
import { describeApiError, fetchInventory$ } from '@/data/inventoryApi';
import { ContainerInput, inventoryRepository, ItemInput, RoomInput } from '@/data/inventoryRepository';
import { Inventory } from '@/models/inventory';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'failed';

type InventoryState = Inventory & {
  loaded: boolean;
  syncStatus: SyncStatus;
  syncError?: string;
  start: () => Promise<void>;
  reload: () => Promise<void>;
  sync: () => void;
  saveRoom: (input: RoomInput, id?: number) => Promise<number>;
  deleteRoom: (id: number) => Promise<void>;
  saveContainer: (input: ContainerInput, id?: number) => Promise<number>;
  deleteContainer: (id: number) => Promise<void>;
  saveItem: (input: ItemInput, id?: number) => Promise<number>;
  deleteItem: (id: number) => Promise<void>;
};

// Единый источник данных для всех ViewModel
export const useInventoryStore = create<InventoryState>((set, get) => {
  let syncSubscription: Subscription | undefined;

  // После любой записи перечитываем базу, чтобы все экраны получили актуальные данные
  const mutate =
    <A extends unknown[], R>(action: (...args: A) => Promise<R>) =>
    async (...args: A) => {
      const result = await action(...args);
      await get().reload();
      return result;
    };

  return {
    rooms: [],
    containers: [],
    items: [],
    loaded: false,
    syncStatus: 'idle',
    start: async () => {
      migrateDatabase();
      // Сначала показываем локальные данные, затем обновляем их с сервера
      await get().reload();
      get().sync();
    },
    reload: async () => {
      const inventory = await inventoryRepository.load();
      set({ ...inventory, loaded: true });
    },
    sync: () => {
      if (syncSubscription && !syncSubscription.closed) return;
      set({ syncStatus: 'syncing', syncError: undefined });
      syncSubscription = fetchInventory$()
        .pipe(
          concatMap((remote) => from(inventoryRepository.mergeRemote(remote))),
          concatMap(() => from(get().reload())),
        )
        .subscribe({
          complete: () => set({ syncStatus: 'synced' }),
          error: (error) => set({ syncStatus: 'failed', syncError: describeApiError(error) }),
        });
    },
    saveRoom: mutate(inventoryRepository.saveRoom),
    deleteRoom: mutate(inventoryRepository.deleteRoom),
    saveContainer: mutate(inventoryRepository.saveContainer),
    deleteContainer: mutate(inventoryRepository.deleteContainer),
    saveItem: mutate(inventoryRepository.saveItem),
    deleteItem: mutate(inventoryRepository.deleteItem),
  };
});
