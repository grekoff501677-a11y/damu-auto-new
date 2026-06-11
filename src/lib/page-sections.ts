// ============================================================
// Page sections registry — the single source of truth for the
// home-page "section manager". Each section has a stable key, a
// human label, default text content, and a declarative list of
// editable fields used to auto-build the admin form.
//
// The set of sections is fixed (they map to coded, partly
// interactive blocks). The admin can reorder them, toggle
// visibility and edit their texts — not invent new block types.
// ============================================================

export type SectionFieldDef =
  | { kind: 'text'; key: string; label: string; placeholder?: string }
  | { kind: 'textarea'; key: string; label: string; placeholder?: string }
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
  /** label shown in the admin list */
  label: string
  /** short note about what the block does / what stays interactive */
  note: string
  /** default position (1-based) and default visibility */
  order: number
  defaults: SectionConfig
  fields: SectionFieldDef[]
}

export const SECTION_REGISTRY: SectionDef[] = [
  {
    key: 'hero',
    label: 'Главный экран (HERO)',
    note: 'Логотип с анимацией и чипы моделей — системные, редактируются тексты.',
    order: 1,
    defaults: {
      badge: 'Экспертный хаб · Павлодар',
      titlePre: 'Оригинальные запчасти для',
      titleAccent: 'Geely',
      titlePost: 'в Павлодаре',
      subtitle:
        'Инженерный подход без воды. Интерактивный центр ТО, макро-сравнение оригинала и подделки, каталог с проверенными OEM-номерами.',
      ctaPrimary: 'Открыть каталог',
      ctaSecondary: 'Центр ТО',
      modelsLabel: 'Модели:',
    },
    fields: [
      { kind: 'text', key: 'badge', label: 'Бейдж над заголовком' },
      { kind: 'text', key: 'titlePre', label: 'Заголовок — начало' },
      { kind: 'text', key: 'titleAccent', label: 'Заголовок — золотое слово' },
      { kind: 'text', key: 'titlePost', label: 'Заголовок — окончание (с градиентом)' },
      { kind: 'textarea', key: 'subtitle', label: 'Подзаголовок' },
      { kind: 'text', key: 'ctaPrimary', label: 'Кнопка 1 (каталог)' },
      { kind: 'text', key: 'ctaSecondary', label: 'Кнопка 2 (Центр ТО)' },
      { kind: 'text', key: 'modelsLabel', label: 'Подпись к чипам моделей' },
    ],
  },
  {
    key: 'features',
    label: 'Три преимущества',
    note: 'Иконки фиксированы; редактируются заголовки и описания карточек.',
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
        kind: 'list',
        key: 'items',
        label: 'Карточки',
        max: 3,
        itemLabel: 'Карточка',
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
    note: 'Макро-слайдер с лупой — системный, редактируются тексты и подпись.',
    order: 4,
    defaults: {
      kicker: 'Наша миссия',
      title: 'Оригинал vs Подделка',
      desc: 'Включите макро-линзу и наведите на сравнение — увеличение ×2.6 покажет разницу в структуре волокон фильтра оригинала и подделки.',
      caption: 'Масляный фильтр · структура фильтровальной бумаги',
      ctaLabel: 'Все гиды и обновления',
    },
    fields: [
      { kind: 'text', key: 'kicker', label: 'Надзаголовок' },
      { kind: 'text', key: 'title', label: 'Заголовок' },
      { kind: 'textarea', key: 'desc', label: 'Описание' },
      { kind: 'text', key: 'caption', label: 'Подпись под слайдером' },
      { kind: 'text', key: 'ctaLabel', label: 'Кнопка (в блог)' },
    ],
  },
  {
    key: 'lead_form',
    label: 'Форма заявки',
    note: 'Сама форма системная (валидация, РК-комплаенс), редактируются тексты слева.',
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

export type ResolvedSection = {
  key: string
  label: string
  note: string
  order: number
  visible: boolean
  config: SectionConfig
}

type SectionRow = {
  section_key: string
  sort_order: number | null
  is_visible: boolean | null
  config: SectionConfig | null
}

/** Merge DB rows over the registry: every section always exists (graceful
 *  even before the migration runs), config falls back to defaults per key. */
export function resolveSections(rows: SectionRow[]): ResolvedSection[] {
  const byKey = new Map(rows.map((r) => [r.section_key, r]))
  return SECTION_REGISTRY.map((s) => {
    const row = byKey.get(s.key)
    return {
      key: s.key,
      label: s.label,
      note: s.note,
      order: row?.sort_order ?? s.order,
      visible: row?.is_visible ?? true,
      config: { ...s.defaults, ...(row?.config ?? {}) },
    }
  }).sort((a, b) => a.order - b.order)
}
