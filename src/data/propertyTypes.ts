import { z } from 'zod';
import { PropertyType } from '@/models/inventory';
import rawTypes from './propertyTypes.json';

// Аналог Decodable: схема описывает структуру JSON и проверяет её при разборе
const propertyTypeSchema = z.object({
  id: z.string(),
  category: z.string(),
  icon: z.string(),
});

// Классификатор только для чтения: файл входит в бандл приложения
export const propertyTypes: readonly PropertyType[] = Object.freeze(z.array(propertyTypeSchema).parse(rawTypes));

export const fallbackType = propertyTypes.find((t) => t.id === 'other') ?? propertyTypes[0];

export function getPropertyType(id: string): PropertyType {
  return propertyTypes.find((t) => t.id === id) ?? fallbackType;
}
