import type { BodyNode } from '@/components/calculator/VehicleBlueprint'

/** Position of a maintenance hotspot, in % of the blueprint image (0–100). */
export type NodePos = { x: number; y: number }

export type BlueprintConfig = {
  /** Cloudinary (or any) URL of the AI-generated wireframe render */
  image: string
  /** hotspot coordinates per body node, in % of the image */
  nodes: Partial<Record<BodyNode, NodePos>>
}

/**
 * Per-model blueprint images + hotspot coordinates.
 *
 * HOW TO ADD A MODEL:
 *  1. Generate a 3/4 wireframe render with the SAME framing for every model
 *     (see the prompt in the chat). Square (1:1), car centred, front-left 3/4.
 *  2. Upload to Cloudinary, copy the delivered URL.
 *  3. Add an entry below keyed by the car_models.slug.
 *  4. Tune node x/y (% of image) so each dot sits on the right part of the car.
 *
 * If a model has no entry here, the component falls back to the schematic SVG.
 *
 * Example (coordinates approximate the reference framing — tune per image):
 *
 * 'geely-monjaro': {
 *   image: 'https://res.cloudinary.com/<cloud>/image/upload/v1/damu/blueprints/monjaro.png',
 *   nodes: {
 *     engine:       { x: 30, y: 56 },
 *     cooling:      { x: 22, y: 60 },
 *     cabin:        { x: 45, y: 38 },
 *     transmission: { x: 50, y: 64 },
 *     brakes:       { x: 40, y: 74 },
 *   },
 * },
 */
export const VEHICLE_BLUEPRINTS: Record<string, BlueprintConfig> = {
  'geely-monjaro': {
    image:
      'https://res.cloudinary.com/djjcxxgfm/image/upload/v1781078459/%D0%94%D0%B8%D0%B7%D0%B0%D0%B9%D0%BD_%D0%B1%D0%B5%D0%B7_%D0%BD%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F_mnsl8e.svg',
    nodes: {
      engine:       { x: 30, y: 51 },
      cooling:      { x: 17, y: 55 },
      cabin:        { x: 51, y: 37 },
      transmission: { x: 54, y: 62 },
      brakes:       { x: 32, y: 72 },
    },
  },
}

export function getBlueprint(slug: string): BlueprintConfig | undefined {
  return VEHICLE_BLUEPRINTS[slug]
}
