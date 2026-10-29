export type Room = {
  id: number;
  remoteId: string | null;
  name: string;
};

export type Container = {
  id: number;
  remoteId: string | null;
  roomId: number;
  name: string;
  description: string;
};

export type Item = {
  id: number;
  remoteId: string | null;
  containerId: number;
  name: string;
  typeId: string;
  quantity: number;
  note: string;
};

export type PropertyType = {
  id: string;
  category: string;
  icon: string;
};

export type Inventory = {
  rooms: Room[];
  containers: Container[];
  items: Item[];
};
