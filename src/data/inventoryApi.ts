import axios from 'axios';
import Constants from 'expo-constants';
import { defer, map, Observable, retry, timer } from 'rxjs';
import { z } from 'zod';

const remoteInventorySchema = z.object({
  rooms: z.array(z.object({ id: z.string(), name: z.string() })),
  containers: z.array(
    z.object({ id: z.string(), roomId: z.string(), name: z.string(), description: z.string().default('') }),
  ),
  items: z.array(
    z.object({
      id: z.string(),
      containerId: z.string(),
      name: z.string(),
      typeId: z.string().default('other'),
      quantity: z.number().int().positive().default(1),
      note: z.string().default(''),
    }),
  ),
});

export type RemoteInventory = z.infer<typeof remoteInventorySchema>;

// По умолчанию обращаемся к mock-серверу (npm run api) на том же компьютере, что и Metro
function resolveApiUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_INVENTORY_URL;
  if (fromEnv) return fromEnv;
  const host = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';
  return `http://${host}:3001/db.json`;
}

export const inventoryApiUrl = resolveApiUrl();

export function describeApiError(error: unknown): string {
  if (error instanceof z.ZodError) return 'Сервер вернул данные в неверном формате';
  if (axios.isAxiosError(error)) {
    return error.response ? `Ошибка сервера: HTTP ${error.response.status}` : 'Сервер недоступен';
  }
  return String(error);
}

// Холодный поток: запрос выполняется при подписке, ответ проверяется схемой, при сбое — две повторные попытки
export function fetchInventory$(): Observable<RemoteInventory> {
  return defer(() => axios.get<unknown>(inventoryApiUrl, { timeout: 5000 })).pipe(
    map((response) => remoteInventorySchema.parse(response.data)),
    retry({ count: 2, delay: (_, attempt) => timer(attempt * 1000) }),
  );
}
