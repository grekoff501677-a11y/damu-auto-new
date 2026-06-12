// ============================================================
// Home page blocks registry — single source of truth for the
// page constructor (/admin/sections).
//
// Two kinds of blocks:
//  • SYSTEM blocks (system:true) — the five coded, partly
//    interactive sections (hero, features, maintenance,
//    originality, lead_form). Single instance each; can be
//    reordered / hidden / text-edited, but not added or deleted.
//  • LIBRARY blocks (system:false) — plain content blocks the
//    admin can ADD from a palette (text, banner, divider). Any
//    number of instances; can be added, deleted, reordered, edited.
//
// A page is an ordered list of rows in `page_sections`, each row
// identified by its own `id`. `section_key` holds the block TYPE
// (so several 'text' rows can coexist).
// ============================================================

export type SectionFieldDef =
  | { kind: 'text'; key: string; label: string; placeholder?: string }
  | { kind: 'textarea'; key: string; label: string; placeholder?: string }
  | { kind: 'toggle'; key: string; label: string }
  | {
      kind: 'list'
      key: string
      label: string
      max: number
      itemLabel: string
      itemFields: { key: string; label: string; kind: 'text' | 'textarea' }[]
    }

export type SectionConfig = Record<string, unknown>

export type SectionDef = {
  key: string
  label: string
  note: string
  /** single coded section (true) vs addable content block (false) */
  system: boolean
  /** default position for system blocks (library blocks append to the end) */
  order: number
  defaults: SectionConfig
  fields: SectionFieldDef[]
}

// ── System blocks (the five interactive sections) ──
export const SYSTEM_SECTIONS: SectionDef[] = [
  {
    key: 'hero',
    label: 'Главный экран (HERO)',
    note: 'Логотип с анимацией и чипы моделей — системные, редактируются тексты и кнопки.',
    system: true,
    order: 1,
    defaults: {
      badge: 'Экспертный хаб · Павлодар',
      titlePre: 'Оригинальные запчасти для',
      titleAccent: 'Geely',
      titlePost: 'в Павлодаре',
      subtitle:
        'Инженерный подход без воды. Интерактивный центр ТО, макро-сравнение оригинала и подделки, каталог с проверенными OEM-номерами.',
      ctaPrimary: 'Открыть каталог',
      ctaPrimaryHref: '/catalog',
      ctaSecondary: 'Центр ТО',
      ctaSecondaryHref: '/calculator',
      ctaSecondaryOn: true,
      modelsLabel: 'Модели:',
      modelsOn: true,
    },
    fields: [
      { kind: 'text', key: 'badge', label: 'Бейдж над заголовком' },
      { kind: 'text', key: 'titlePre', label: 'Заголовок — начало' },
      { kind: 'text', key: 'titleAccent', label: 'Заголовок — золотое слово' },
      { kind: 'text', key: 'titlePost', label: 'Заголовок — окончание (с градиентом)' },
      { kind: 'textarea', key: 'subtitle', label: 'Подзаголовок' },
      { kind: 'text', key: 'ctaPrimary', label: 'Кнопка 1 — текст' },
      { kind: 'text', key: 'ctaPrimaryHref', label: 'Кнопка 1 — ссылка', placeholder: '/catalog или https://...' },
      { kind: 'toggle', key: 'ctaSecondaryOn', label: 'Показывать кнопку 2' },
      { kind: 'text', key: 'ctaSecondary', label: 'Кнопка 2 — текст' },
      { kind: 'text', key: 'ctaSecondaryHref', label: 'Кнопка 2 — ссылка', placeholder: '/calculator или https://...' },
      { kind: 'toggle', key: 'modelsOn', label: 'Показывать чипы моделей' },
      { kind: 'text', key: 'modelsLabel', label: 'Подпись к чипам моделей' },
    ],
  },
  {
    key: 'features',
    label: 'Три преимущества',
    note: 'Иконки фиксированы; редактируются заголовки и описания карточек.',
    system: true,
    order: 2,
    defaults: {
      items: [
        { title: 'Только оригинал', desc: 'Каждая позиция с OEM-номером и гидом по проверке подлинности.' },
        { title: 'Контрольный центр ТО', desc: 'Интерактивный расчёт обслуживания по пробегу с визуализацией.' },
        { title: 'Заказ через Kaspi', desc: 'Прямые ссылки на каждый товар — привычная оплата и доставка.' },
      ],
    },
    fields: [
      {
        kind: 'list', key: 'items', label: 'Карточки', max: 3, itemLabel: 'Карточка',
        itemFields: [
          { key: 'title', label: 'Заголовок', kind: 'text' },
          { key: 'desc', label: 'Описание', kind: 'textarea' },
        ],
      },
    ],
  },
  {
    key: 'maintenance',
    label: 'Контрольный центр ТО',
    note: 'Интерактивная схема и данные ТО — системные, редактируются заголовки блока.',
    system: true,
    order: 3,
    defaults: {
      kicker: 'Инструмент №1',
      title: 'Контрольный центр обслуживания',
      desc: 'Выберите модель и точку на временной шкале — силуэт автомобиля подсветит узлы, а нужные детали появятся справа с OEM-спецификацией и ссылкой на Kaspi.',
    },
    fields: [
      { kind: 'text', key: 'kicker', label: 'Надзаголовок' },
      { kind: 'text', key: 'title', label: 'Заголовок' },
      { kind: 'textarea', key: 'desc', label: 'Описание' },
    ],
  },
  {
    key: 'originality',
    label: 'Оригинал vs Подделка',
    note: 'Макро-слайдер с лупой — системный, редактируются тексты, подпись и кнопка.',
    system: true,
    order: 4,
    defaults: {
      kicker: 'Наша миссия',
      title: 'Оригинал vs Подделка',
      desc: 'Включите макро-линзу и наведите на сравнение — увеличение ×2.6 покажет разницу в структуре волокон фильтра оригинала и подделки.',
      caption: 'Масляный фильтр · структура фильтровальной бумаги',
      ctaLabel: 'Все гиды и обновления',
      ctaHref: '/blog',
    },
    fields: [
      { kind: 'text', key: 'kicker', label: 'Надзаголовок' },
      { kind: 'text', key: 'title', label: 'Заголовок' },
      { kind: 'textarea', key: 'desc', label: 'Описание' },
      { kind: 'text', key: 'caption', label: 'Подпись под слайдером' },
      { kind: 'text', key: 'ctaLabel', label: 'Кнопка — текст' },
      { kind: 'text', key: 'ctaHref', label: 'Кнопка — ссылка', placeholder: '/blog или https://...' },
    ],
  },
  {
    key: 'lead_form',
    label: 'Форма заявки',
    note: 'Сама форма системная (валидация, РК-комплаенс), редактируются тексты слева.',
    system: true,
    order: 5,
    defaults: {
      kicker: 'Связь',
      title: 'Не нашли нужную деталь?',
      desc: 'Оставьте заявку — подберём запчасть по VIN или модели и проверим совместимость. Отвечаем быстро.',
    },
    fields: [
      { kind: 'text', key: 'kicker', label: 'Надзаголовок' },
      { kind: 'text', key: 'title', label: 'Заголовок' },
      { kind: 'textarea', key: 'desc', label: 'Описание' },
    ],
  },
]

// ── Library blocks (addable from the palette) ──
export const BLOCK_LIBRARY: SectionDef[] = [
  {
    key: 'text',
    label: 'Текстовый блок',
    note: 'Надзаголовок, заголовок и абзац текста. Можно центрировать.',
    system: false,
    order: 100,
    defaults: { kicker: '', title: 'Новый заголовок', body: 'Текст блока…', centered: false },
    fields: [
      { kind: 'text', key: 'kicker', label: 'Надзаголовок (необязательно)' },
      { kind: 'text', key: 'title', label: 'Заголовок' },
      { kind: 'textarea', key: 'body', label: 'Текст' },
      { kind: 'toggle', key: 'centered', label: 'По центру' },
    ],
  },
  {
    key: 'banner',
    label: 'Баннер с кнопкой',
    note: 'Акцентная плашка с заголовком, подзаголовком и кнопкой-ссылкой.',
    system: false,
    order: 101,
    defaults: {
      title: 'Заголовок баннера',
      subtitle: 'Короткий призыв к действию.',
      buttonLabel: 'Перейти',
      buttonHref: '/catalog',
      buttonOn: true,
    },
    fields: [
      { kind: 'text', key: 'title', label: 'Заголовок' },
      { kind: 'textarea', key: 'subtitle', label: 'Подзаголовок' },
      { kind: 'toggle', key: 'buttonOn', label: 'Показывать кнопку' },
      { kind: 'text', key: 'buttonLabel', label: 'Кнопка — текст' },
      { kind: 'text', key: 'buttonHref', label: 'Кнопка — ссылка', placeholder: '/catalog или https://...' },
    ],
  },
  {
    key: 'divider',
    label: 'Разделитель',
    note: 'Тонкая золотая линия с отступами. Необязательная подпись по центру.',
    system: false,
    order: 102,
    defaults: { label: '' },
    fields: [
      { kind: 'text', key: 'label', label: 'Подпись по центру (необязательно)' },
    ],
  },
]

export const ALL_BLOCK_DEFS: SectionDef[] = [...SYSTEM_SECTIONS, ...BLOCK_LIBRARY]

export function blockDef(type: string): SectionDef | undefined {
  return ALL_BLOCK_DEFS.find((b) => b.key === type)
}

// kept for back-compat (admin validation of system keys)
export const SECTION_REGISTRY = SYSTEM_SECTIONS

export type ResolvedBlock = {
  /** DB row id; null only for graceful virtual system blocks (table empty) */
  id: string | null
  type: string
  label: string
  note: string
  system: boolean
  order: number
  visible: boolean
  config: SectionConfig
}

type BlockRow = {
  id: string
  section_key: string
  sort_order: number | null
  is_visible: boolean | null
  config: SectionConfig | null
}

/** Build the ordered block list from DB rows. Unknown types are dropped.
 *  Any system block missing from the DB is appended as a virtual default
 *  (so the page renders even before the migration runs). */
export function resolveBlocks(rows: BlockRow[]): ResolvedBlock[] {
  const out: ResolvedBlock[] = []
  const seenSystem = new Set<string>()
  for (const r of rows) {
    const def = blockDef(r.section_key)
    if (!def) continue
    if (def.system) seenSystem.add(def.key)
    out.push({
      id: r.id,
      type: def.key,
      label: def.label,
      note: def.note,
      system: def.system,
      order: r.sort_order ?? def.order,
      visible: r.is_visible ?? true,
      config: { ...def.defaults, ...(r.config ?? {}) },
    })
  }
  for (const def of SYSTEM_SECTIONS) {
    if (seenSystem.has(def.key)) continue
    out.push({
      id: null, type: def.key, label: def.label, note: def.note,
      system: true, order: def.order, visible: true, config: { ...def.defaults },
    })
  }
  return out.sort((a, b) => a.order - b.order)
}
