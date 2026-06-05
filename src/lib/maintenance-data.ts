import type { BodyNode } from '@/components/calculator/VehicleBlueprint'

export type DemoPart = {
  name: string
  type: 'replace' | 'inspect'
  oem: string
  spec: string
  node: BodyNode
  kaspiUrl: string
}

export type Milestone = {
  km: number
  months: number
  parts: DemoPart[]
}

export type DemoModel = {
  slug: string
  brand: string
  name: string
  milestones: Milestone[]
}

const KASPI = 'https://kaspi.kz/shop'

// Shared service intervals (representative — managed via /admin in production)
const baseMilestones: Milestone[] = [
  {
    km: 10000, months: 6,
    parts: [
      { name: 'Моторное масло', type: 'replace', oem: '2304100XGW01A', spec: '5W-30 · 4 л · Fully Synthetic', node: 'engine', kaspiUrl: KASPI },
      { name: 'Масляный фильтр', type: 'replace', oem: '1016050491', spec: 'Original · резьба M20', node: 'engine', kaspiUrl: KASPI },
    ],
  },
  {
    km: 20000, months: 12,
    parts: [
      { name: 'Моторное масло', type: 'replace', oem: '2304100XGW01A', spec: '5W-30 · 4 л', node: 'engine', kaspiUrl: KASPI },
      { name: 'Воздушный фильтр', type: 'replace', oem: '1016060638', spec: 'Original бумажный', node: 'engine', kaspiUrl: KASPI },
      { name: 'Салонный фильтр', type: 'replace', oem: '8022016800', spec: 'Угольный · PM2.5', node: 'cabin', kaspiUrl: KASPI },
    ],
  },
  {
    km: 30000, months: 18,
    parts: [
      { name: 'Моторное масло', type: 'replace', oem: '2304100XGW01A', spec: '5W-30 · 4 л', node: 'engine', kaspiUrl: KASPI },
      { name: 'Антифриз LEC II', type: 'inspect', oem: '1136000179', spec: 'Концентрат · синий · −40°C', node: 'cooling', kaspiUrl: KASPI },
      { name: 'Тормозная жидкость', type: 'inspect', oem: 'DOT4-1L', spec: 'DOT 4 · точка кипения 230°C', node: 'brakes', kaspiUrl: KASPI },
    ],
  },
  {
    km: 60000, months: 36,
    parts: [
      { name: 'Свечи зажигания', type: 'replace', oem: 'F01R00A2S7', spec: 'Iridium · зазор 0.9 мм', node: 'engine', kaspiUrl: KASPI },
      { name: 'Масло АКПП / DCT', type: 'replace', oem: '3050001100', spec: 'DCT Fluid · 6 л', node: 'transmission', kaspiUrl: KASPI },
      { name: 'Тормозные колодки', type: 'inspect', oem: '3501175XGW', spec: 'Передние · керамика', node: 'brakes', kaspiUrl: KASPI },
    ],
  },
]

export const DEMO_MODELS: DemoModel[] = [
  { slug: 'geely-monjaro', brand: 'Geely',   name: 'Monjaro', milestones: baseMilestones },
  { slug: 'geely-tugella', brand: 'Geely',   name: 'Tugella', milestones: baseMilestones },
  { slug: 'geely-preface', brand: 'Geely',   name: 'Preface', milestones: baseMilestones },
  { slug: 'geely-coolray', brand: 'Geely',   name: 'Coolray', milestones: baseMilestones },
  { slug: 'li-auto-l7',    brand: 'Li Auto', name: 'L7',      milestones: baseMilestones },
  { slug: 'li-auto-l9',    brand: 'Li Auto', name: 'L9',      milestones: baseMilestones },
]
