import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('inventory.db');

// Каждая миграция переводит схему на следующую версию (PRAGMA user_version)
const migrations: string[] = [
  `
  CREATE TABLE rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    remote_id TEXT UNIQUE,
    name TEXT NOT NULL
  );
  CREATE TABLE containers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    remote_id TEXT UNIQUE,
    room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    remote_id TEXT UNIQUE,
    container_id INTEGER NOT NULL REFERENCES containers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type_id TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    note TEXT NOT NULL DEFAULT ''
  );
  CREATE INDEX idx_containers_room ON containers(room_id);
  CREATE INDEX idx_items_container ON items(container_id);
  `,
  // Записи из REST API, удалённые пользователем: при синхронизации не восстанавливаются
  `
  CREATE TABLE deleted_remote (remote_id TEXT PRIMARY KEY);
  `,
];

export function migrateDatabase() {
  db.execSync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  const row = db.getFirstSync<{ user_version: number }>('PRAGMA user_version');
  const version = row?.user_version ?? 0;

  migrations.slice(version).forEach((sql, index) => {
    db.withTransactionSync(() => {
      db.execSync(sql);
      db.execSync(`PRAGMA user_version = ${version + index + 1}`);
    });
  });
}
