import type { BlueprintData } from '@/components/calculator/VehicleBlueprint'

/**
 * Code fallback for vehicle blueprints, used only when a model has no blueprint
 * saved in the database. Manage blueprints visually in /admin/blueprints.
 */
export const VEHICLE_BLUEPRINTS: Record<string, BlueprintData> = {
  'geely-monjaro': {
    image:
      'https://res.cloudinary.com/djjcxxgfm/image/upload/v1781078459/%D0%94%D0%B8%D0%B7%D0%B0%D0%B9%D0%BD_%D0%B1%D0%B5%D0%B7_%D0%BD%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F_mnsl8e.svg',
    hotspots: [
      { id: 'n1', x: 30, y: 51, bodyNode: 'engine',       label: 'Двигатель' },
      { id: 'n2', x: 17, y: 55, bodyNode: 'cooling',      label: 'Охлаждение' },
      { id: 'n3', x: 51, y: 37, bodyNode: 'cabin',        label: 'Салон' },
      { id: 'n4', x: 54, y: 62, bodyNode: 'transmission', label: 'Трансмиссия' },
      { id: 'n5', x: 32, y: 72, bodyNode: 'brakes',       label: 'Тормоза / подвеска' },
    ],
  },
}

export function getBlueprint(slug: string): BlueprintData | undefined {
  return VEHICLE_BLUEPRINTS[slug]
}
