export type CatalogCategory =
  | 'accessories' | 'maintenance' | 'engine' | 'suspension' | 'tech'

export const CATEGORIES: { id: CatalogCategory | 'all'; label: string }[] = [
  { id: 'all',         label: 'Всё' },
  { id: 'maintenance', label: 'Наборы ТО' },
  { id: 'engine',      label: 'Двигатель' },
  { id: 'suspension',  label: 'Подвеска' },
  { id: 'accessories', label: 'Аксессуары' },
  { id: 'tech',        label: 'Электроника' },
]

export type CatalogProduct = {
  id: string
  name: string
  category: CatalogCategory
  oem: string
  models: string[]
  short: string
  description: string
  /** hue for the procedural product image */
  hue: number
  kaspiUrl: string
}

const KASPI = 'https://kaspi.kz/shop'

export const DEMO_PRODUCTS: CatalogProduct[] = [
  { id: 'p1', name: 'Моторное масло Geely 5W-30', category: 'maintenance', oem: '2304100XGW01A',
    models: ['Monjaro', 'Tugella', 'Preface'], hue: 145,
    short: 'Полная синтетика · 4 л',
    description: 'Оригинальное полностью синтетическое масло, одобренное Geely. Защита от износа при экстремальных температурах −35…+40°C, стабильная вязкость и увеличенный интервал замены.',
    kaspiUrl: KASPI },
  { id: 'p2', name: 'Комплект фильтров ТО', category: 'maintenance', oem: 'KIT-1016-A',
    models: ['Monjaro', 'Coolray'], hue: 150,
    short: 'Воздушный + салонный + масляный',
    description: 'Полный набор оригинальных фильтров для планового ТО. Включает воздушный, угольный салонный (PM2.5) и масляный фильтр. Всё для одной замены.',
    kaspiUrl: KASPI },
  { id: 'p3', name: 'Свечи зажигания Iridium', category: 'engine', oem: 'F01R00A2S7',
    models: ['Monjaro', 'Tugella', 'L7'], hue: 190,
    short: 'Иридиевые · зазор 0.9 мм',
    description: 'Иридиевые свечи с увеличенным ресурсом до 60 000 км. Стабильное искрообразование, ровная работа двигателя на холостых и снижение расхода топлива.',
    kaspiUrl: KASPI },
  { id: 'p4', name: 'Тормозные колодки передние', category: 'suspension', oem: '3501175XGW',
    models: ['Monjaro', 'Preface'], hue: 200,
    short: 'Керамика · низкая пыль',
    description: 'Керамические тормозные колодки с минимальным пылением и тихой работой. Стабильный коэффициент трения, не повреждают диски.',
    kaspiUrl: KASPI },
  { id: 'p5', name: 'Антифриз LEC II', category: 'maintenance', oem: '1136000179',
    models: ['Monjaro', 'Tugella', 'Preface', 'Coolray'], hue: 210,
    short: 'Концентрат · синий · −40°C',
    description: 'Оригинальный концентрат охлаждающей жидкости Geely LEC II. Защита от коррозии алюминиевых компонентов, совместим с современными системами охлаждения.',
    kaspiUrl: KASPI },
  { id: 'p6', name: 'Коврики салона EVA', category: 'accessories', oem: 'EVA-MNJ-22',
    models: ['Monjaro'], hue: 130,
    short: '3D · бортики · влагозащита',
    description: '3D-коврики из EVA-материала с высокими бортиками. Точная посадка по модели, удерживают влагу и грязь, легко моются.',
    kaspiUrl: KASPI },
  { id: 'p7', name: 'Видеорегистратор 4K', category: 'tech', oem: 'DVR-4K-LX',
    models: ['L7', 'L9'], hue: 250,
    short: 'GPS · ночной режим · Wi-Fi',
    description: 'Скрытый видеорегистратор 4K с интеграцией в штатное место. GPS-трекинг, ночная съёмка Sony Starvis, управление через приложение по Wi-Fi.',
    kaspiUrl: KASPI },
  { id: 'p8', name: 'Амортизаторы передние', category: 'suspension', oem: '2906100XGW',
    models: ['Tugella', 'Preface'], hue: 205,
    short: 'Газомасляные · OEM',
    description: 'Оригинальные газомасляные амортизаторы. Восстанавливают заводскую плавность хода и управляемость, рассчитаны на дороги Казахстана.',
    kaspiUrl: KASPI },
]
