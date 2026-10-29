import { Container, Inventory, Item, Room } from '@/models/inventory';
import { db } from './database';
import { RemoteInventory } from './inventoryApi';

export type RoomInput = Pick<Room, 'name'>;
export type ContainerInput = Pick<Container, 'roomId' | 'name' | 'description'>;
export type ItemInput = Pick<Item, 'containerId' | 'name' | 'typeId' | 'quantity' | 'note'>;

export interface InventoryRepository {
  load(): Promise<Inventory>;
  saveRoom(input: RoomInput, id?: number): Promise<number>;
  deleteRoom(id: number): Promise<void>;
  saveContainer(input: ContainerInput, id?: number): Promise<number>;
  deleteContainer(id: number): Promise<void>;
  saveItem(input: ItemInput, id?: number): Promise<number>;
  deleteItem(id: number): Promise<void>;
  mergeRemote(remote: RemoteInventory): Promise<void>;
}

type Table = 'rooms' | 'containers' | 'items';

// Запоминаем удалённую запись из REST API, чтобы синхронизация не вернула её обратно
function rememberDeletion(table: Table, id: number) {
  db.runSync(
    `INSERT OR IGNORE INTO deleted_remote (remote_id)
     SELECT remote_id FROM ${table} WHERE id = ? AND remote_id IS NOT NULL`,
    id,
  );
}

function remoteIdMap(table: Table) {
  const rows = db.getAllSync<{ id: number; remoteId: string }>(
    `SELECT id, remote_id AS remoteId FROM ${table} WHERE remote_id IS NOT NULL`,
  );
  return new Map(rows.map((r) => [r.remoteId, r.id]));
}

export const inventoryRepository: InventoryRepository = {
  async load() {
    const [rooms, containers, items] = await Promise.all([
      db.getAllAsync<Room>('SELECT id, remote_id AS remoteId, name FROM rooms ORDER BY name'),
      db.getAllAsync<Container>(
        'SELECT id, remote_id AS remoteId, room_id AS roomId, name, description FROM containers ORDER BY name',
      ),
      db.getAllAsync<Item>(
        `SELECT id, remote_id AS remoteId, container_id AS containerId, name, type_id AS typeId, quantity, note
         FROM items ORDER BY name`,
      ),
    ]);
    return { rooms, containers, items };
  },

  async saveRoom({ name }, id) {
    if (id) {
      await db.runAsync('UPDATE rooms SET name = ? WHERE id = ?', name, id);
      return id;
    }
    const result = await db.runAsync('INSERT INTO rooms (name) VALUES (?)', name);
    return result.lastInsertRowId;
  },

  async deleteRoom(id) {
    rememberDeletion('rooms', id);
    // Контейнеры и вещи удаляются каскадно (ON DELETE CASCADE)
    await db.runAsync('DELETE FROM rooms WHERE id = ?', id);
  },

  async saveContainer({ roomId, name, description }, id) {
    if (id) {
      await db.runAsync(
        'UPDATE containers SET room_id = ?, name = ?, description = ? WHERE id = ?',
        roomId,
        name,
        description,
        id,
      );
      return id;
    }
    const result = await db.runAsync(
      'INSERT INTO containers (room_id, name, description) VALUES (?, ?, ?)',
      roomId,
      name,
      description,
    );
    return result.lastInsertRowId;
  },

  async deleteContainer(id) {
    rememberDeletion('containers', id);
    await db.runAsync('DELETE FROM containers WHERE id = ?', id);
  },

  async saveItem({ containerId, name, typeId, quantity, note }, id) {
    if (id) {
      await db.runAsync(
        'UPDATE items SET container_id = ?, name = ?, type_id = ?, quantity = ?, note = ? WHERE id = ?',
        containerId,
        name,
        typeId,
        quantity,
        note,
        id,
      );
      return id;
    }
    const result = await db.runAsync(
      'INSERT INTO items (container_id, name, type_id, quantity, note) VALUES (?, ?, ?, ?, ?)',
      containerId,
      name,
      typeId,
      quantity,
      note,
    );
    return result.lastInsertRowId;
  },

  async deleteItem(id) {
    rememberDeletion('items', id);
    await db.runAsync('DELETE FROM items WHERE id = ?', id);
  },

  async mergeRemote(remote) {
    // Обновляем записи по remote_id; пользовательские записи (remote_id IS NULL) не затрагиваются
    db.withTransactionSync(() => {
      const deleted = new Set(
        db.getAllSync<{ remoteId: string }>('SELECT remote_id AS remoteId FROM deleted_remote').map((r) => r.remoteId),
      );

      for (const room of remote.rooms) {
        if (deleted.has(room.id)) continue;
        db.runSync(
          `INSERT INTO rooms (remote_id, name) VALUES (?, ?)
           ON CONFLICT(remote_id) DO UPDATE SET name = excluded.name`,
          room.id,
          room.name,
        );
      }

      const roomIds = remoteIdMap('rooms');
      for (const container of remote.containers) {
        const roomId = roomIds.get(container.roomId);
        if (deleted.has(container.id) || roomId === undefined) continue;
        db.runSync(
          `INSERT INTO containers (remote_id, room_id, name, description) VALUES (?, ?, ?, ?)
           ON CONFLICT(remote_id) DO UPDATE SET
             room_id = excluded.room_id, name = excluded.name, description = excluded.description`,
          container.id,
          roomId,
          container.name,
          container.description,
        );
      }

      const containerIds = remoteIdMap('containers');
      for (const item of remote.items) {
        const containerId = containerIds.get(item.containerId);
        if (deleted.has(item.id) || containerId === undefined) continue;
        db.runSync(
          `INSERT INTO items (remote_id, container_id, name, type_id, quantity, note) VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT(remote_id) DO UPDATE SET
             container_id = excluded.container_id, name = excluded.name, type_id = excluded.type_id,
             quantity = excluded.quantity, note = excluded.note`,
          item.id,
          containerId,
          item.name,
          item.typeId,
          item.quantity,
          item.note,
        );
      }
    });
  },
};
