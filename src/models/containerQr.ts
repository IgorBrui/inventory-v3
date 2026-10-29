// Содержимое QR-кода маркировки контейнера
const prefix = 'inventory://container/';

export const containerQrValue = (id: number) => `${prefix}${id}`;

export function parseContainerQr(data: string): number | null {
  const value = data.trim();
  if (!value.startsWith(prefix)) return null;
  const id = Number(value.slice(prefix.length));
  return Number.isInteger(id) && id > 0 ? id : null;
}
