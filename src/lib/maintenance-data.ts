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

// ── Reusable part definitions ──
const P = {
  oil:        (): DemoPart => ({ name: 'Моторное масло',     type: 'replace', oem: '2304100XGW01A', spec: '5W-30 · 4 л · Fully Synthetic', node: 'engine',       kaspiUrl: KASPI }),
  oilFilter:  (): DemoPart => ({ name: 'Масляный фильтр',    type: 'replace', oem: '1016050491',    spec: 'Original · резьба M20',         node: 'engine',       kaspiUrl: KASPI }),
  airFilter:  (): DemoPart => ({ name: 'Воздушный фильтр',   type: 'replace', oem: '1016060638',    spec: 'Original бумажный',             node: 'engine',       kaspiUrl: KASPI }),
  cabin:      (): DemoPart => ({ name: 'Салонный фильтр',    type: 'replace', oem: '8022016800',    spec: 'Угольный · PM2.5',              node: 'cabin',        kaspiUrl: KASPI }),
  brakeInsp:  (): DemoPart => ({ name: 'Тормозная жидкость', type: 'inspect', oem: 'DOT4-1L',       spec: 'DOT 4 · проверка уровня',       node: 'brakes',       kaspiUrl: KASPI }),
  brakeRepl:  (): DemoPart => ({ name: 'Тормозная жидкость', type: 'replace', oem: 'DOT4-1L',       spec: 'DOT 4 · полная замена',         node: 'brakes',       kaspiUrl: KASPI }),
  coolInsp:   (): DemoPart => ({ name: 'Антифриз LEC II',    type: 'inspect', oem: '1136000179',    spec: 'Концентрат · проверка плотности',node: 'cooling',      kaspiUrl: KASPI }),
  coolRepl:   (): DemoPart => ({ name: 'Антифриз LEC II',    type: 'replace', oem: '1136000179',    spec: 'Концентрат · синий · −40°C',    node: 'cooling',      kaspiUrl: KASPI }),
  plugs:      (): DemoPart => ({ name: 'Свечи зажигания',    type: 'replace', oem: 'F01R00A2S7',    spec: 'Iridium · зазор 0.9 мм',        node: 'engine',       kaspiUrl: KASPI }),
  dct:        (): DemoPart => ({ name: 'Масло АКПП / DCT',   type: 'replace', oem: '3050001100',    spec: 'DCT Fluid · 6 л',               node: 'transmission', kaspiUrl: KASPI }),
  suspension: (): DemoPart => ({ name: 'Подвеска / ходовая', type: 'inspect', oem: '2906100XGW',    spec: 'Диагностика стоек и сайлентблоков', node: 'brakes',     kaspiUrl: KASPI }),
}

// ── 10 service intervals: 10 000 … 100 000 km ──
function buildMilestones(): Milestone[] {
  const out: Milestone[] = []
  for (let k = 1; k <= 10; k++) {
    const parts: DemoPart[] = [P.oil(), P.oilFilter()] // every interval
    if (k % 2 === 0) { parts.push(P.airFilter(), P.cabin()) }       // 20,40,60,80,100k
    if (k === 3 || k === 9) { parts.push(P.brakeInsp()) }            // 30,90k — inspect
    if (k === 5) { parts.push(P.brakeRepl()) }                       // 50k — replace
    if (k === 3) { parts.push(P.coolInsp()) }                        // 30k — inspect
    if (k === 8) { parts.push(P.coolRepl()) }                        // 80k — replace
    if (k === 6 || k === 10) { parts.push(P.plugs(), P.dct()) }      // 60,100k — major
    if (k === 10) { parts.push(P.suspension()) }                     // 100k — full check
    out.push({ km: k * 10000, months: k * 6, parts })
  }
  return out
}

const milestones = buildMilestones()

// ── Geely-only lineup ──
export const DEMO_MODELS: DemoModel[] = [
  { slug: 'geely-atlas',    brand: 'Geely', name: 'Atlas',    milestones },
  { slug: 'geely-monjaro',  brand: 'Geely', name: 'Monjaro',  milestones },
  { slug: 'geely-coolray',  brand: 'Geely', name: 'Coolray',  milestones },
  { slug: 'geely-okavango', brand: 'Geely', name: 'Okavango', milestones },
]
