import { useRef, useState } from 'react';
import { parseContainerQr } from '@/models/containerQr';
import { useInventoryStore } from '@/store/inventoryStore';

export type ScanResult = { kind: 'found'; containerId: number } | { kind: 'unknown' } | { kind: 'missing' };

export function useScannerViewModel() {
  const containers = useInventoryStore((s) => s.containers);
  const [paused, setPaused] = useState(false);
  // Камера присылает один и тот же код много раз подряд — обрабатываем только первый
  const busy = useRef(false);

  const recognize = (data: string): ScanResult => {
    const containerId = parseContainerQr(data);
    if (containerId === null) return { kind: 'unknown' };
    return containers.some((c) => c.id === containerId) ? { kind: 'found', containerId } : { kind: 'missing' };
  };

  return {
    paused,
    handleScan: (data: string): ScanResult | null => {
      if (busy.current) return null;
      busy.current = true;
      setPaused(true);
      return recognize(data);
    },
    resume: () => {
      busy.current = false;
      setPaused(false);
    },
  };
}
