# Damu Auto — Технический Handoff

> Полное ревью проекта для передачи в новую сессию. Прочитав этот файл, можно продолжать работу без дополнительных вопросов по архитектуре, БД и фронтенду.

---

## 1. Что это за проект

**Damu Auto** — сайт-витрина + экспертный хаб магазина **оригинальных запчастей Geely** (г. Павлодар, Казахстан). Продажи идут через Kaspi.kz (каждый товар — внешняя ссылка «Заказать на Kaspi»), сайт не имеет своей корзины/оплаты.

**Модельный ряд (только Geely):** Atlas, Monjaro, Coolray, Okavango.

**Ключевые блоки:**
1. **Каталог** — товары с OEM-номерами, фильтр по моделям и категориям, раскрытие карточки in-place (desktop modal / mobile bottom-sheet).
2. **Центр ТО (калькулятор)** — интерактивная схема авто (wireframe) с подсвечиваемыми узлами + таймлайн интервалов; данные строятся из правил ТО в БД.
3. **Блог «Оригинал vs Подделка»** — статьи (Markdown) + компонент макро-сравнения «оригинал/подделка» со слайдером и лупой.
4. **Форма заявки** → пишет в БД (готова к webhook в n8n/CRM).
5. **Админка** `/admin` — CRUD товаров, блога, правил ТО, просмотр заявок, визуальный редактор схем авто.
6. **Соответствие закону РК** «О персональных данных» — cookie-баннер, согласие в форме, правовые страницы.

Репозиторий: `github.com/grekoff501677-a11y/damu-auto-new` (ветка `main`). Деплой — Vercel (+ есть `netlify.toml` как запасной вариант).

---

## 2. Стек и версии

| | |
|---|---|
| Framework | **Next.js 16.2.7** (App Router, `src/`, Turbopack) |
| React | **19.2.4** |
| Язык | TypeScript 5 |
| Стили | **Tailwind CSS v4** — токены в CSS через `@theme` (⚠️ **нет** `tailwind.config.js`) |
| UI-компоненты | **shadcn** (в `src/components/ui/`), Radix/base-ui под капотом |
| Анимация | **motion v12** (преемник framer-motion), импорт из `motion/react` |
| БД/Auth | **Supabase** (Postgres + Auth + RLS) через `@supabase/ssr` |
| Markdown | `react-markdown` + `remark-gfm` |
| Иконки | `lucide-react` |
| Изображения | **Cloudinary** (логотип, схемы авто) с трансформацией `f_auto,q_auto` |
| Node (локально) | v24 |

### ⚠️ Важно про Next 16 (из `AGENTS.md`)
Это новая версия Next — API могут отличаться от обучающих данных. Главное, что уже учтено в коде:
- **`params` и `searchParams` — это Promise**, их нужно `await`. Пример: `async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params }`.
- Динамические страницы помечены `export const dynamic = 'force-dynamic'`, чтобы всегда отражать свежие данные из БД.
- Серверные мутации — через **Server Actions** (`'use server'`).

---

## 3. Структура проекта

```
src/
  app/
    layout.tsx              # root: шрифты, Header, Footer, MobileTabBar, CookieConsent, PageTransition
    globals.css             # дизайн-токены (палитра, glass, grid, focus) — Tailwind v4 @theme
    page.tsx                # Главная (HERO + фичи + Центр ТО + Оригинал vs Подделка + форма)
    catalog/page.tsx        # Каталог (из БД)
    calculator/page.tsx     # Центр ТО (из БД)
    blog/page.tsx           # Список статей (published)
    blog/[slug]/page.tsx    # Статья: Markdown + макро-слайдер
    contact/page.tsx        # Контакты + форма
    privacy-policy/page.tsx # Правовая (РК)
    data-consent/page.tsx   # Правовая (РК)
    api/
      leads/route.ts        # POST заявки (валидация, rate-limit, consent, HMAC IP-hash, whitelist metadata)
      auth/logout/route.ts  # запасной POST logout (same-origin check); админка использует Server Action
    admin/
      layout.tsx            # БЕЗ guard (passthrough) — оборачивает и login, и protected
      login/page.tsx        # форма входа (Supabase email/password)
      (protected)/          # ← route group: ВЕСЬ guard здесь
        layout.tsx          # auth-guard (redirect на /admin/login) + chrome + logout
        actions.ts          # logout Server Action (CSRF-safe: Next проверяет Origin)
        page.tsx            # дашборд (счётчики + плитки разделов)
        products/           # список + new + [id] + actions + DeleteButton + ProductForm
        blog/               # аналогично
        calculator/         # матрица правил ТО по моделям (AddRuleForm, DeleteRuleButton)
        blueprints/         # визуальный редактор схем авто (BlueprintEditor) + list + [id]
        leads/              # таблица заявок + смена статуса + удаление (LeadRow)
  components/
    layout/   Header, Footer, MobileTabBar
    catalog/  CatalogGrid
    calculator/ MaintenanceCenter, VehicleBlueprint
    blog/     MacroCompareSlider
    forms/    LeadForm
    shared/   HeroLogo, CookieConsent, LegalDoc, PageTransition, Reveal, TiltCard
    admin/    AdminHeader, AdminField
    ui/       shadcn-компоненты + gradient-tracing, realistic-fog-background
  lib/
    supabase/ client.ts (browser), server.ts (cookie-based), admin.ts (service-role)
    queries.ts        # server-only: чтение публичных данных из БД (+ типы Public*)
    types/index.ts    # типы, зеркалят схему БД
    vehicle-blueprints.ts # КОД-фолбэк схемы Monjaro (если в БД пусто)
    textures.ts       # процедурные CSS-текстуры для макро-слайдера (homepage)
    useMediaQuery.ts  # хук (mobile detection)
    utils.ts          # cn()
database/
  schema.sql              # таблицы + RLS + триггеры
  seed.sql                # модели Geely + пример товара + правила ТО Monjaro
  migrations/002_blueprints.sql  # колонки blueprint_url + blueprint_nodes + сид Monjaro
  migrations/003_rls_security_fixes.sql  # админ-политики compat/blog_prods + drop anon-INSERT leads
  migrations/004_blueprints_all_models.sql  # схемы + хотспоты для Atlas/Coolray/Okavango
```

### Мёртвый код (можно удалить, сейчас НЕ импортируется)
- `src/lib/catalog-data.ts` — старые демо-товары (каталог теперь из БД).
- `src/lib/maintenance-data.ts` — старые демо-интервалы (Центр ТО теперь из БД).
- `next-themes` в зависимостях — не используется (тема всегда тёмная).

---

## 4. База данных (Supabase / Postgres)

### Таблицы (`database/schema.sql`)
- **car_models** — `id, brand, name, full_name(generated), slug, year_from/to, is_active, sort_order` + (миграция 002) `blueprint_url text`, `blueprint_nodes jsonb default '[]'`.
- **products** — `id, name, slug, short_desc, description, category, oem_number, kaspi_url, images text[], specifications jsonb, is_available, is_featured, sort_order, created/updated_at`.
- **product_compatibility** — M2M `product_id ↔ car_model_id` (+notes). PK составной.
- **blog_posts** — `title, slug, excerpt, content(Markdown), category('update'|'guide'), cover_image, before_image, after_image, before_label, after_label, published, published_at`.
- **blog_post_products** — M2M статья ↔ товары (виджеты в статье; в UI пока не задействовано).
- **maintenance_rules** — `car_model_id, product_id?, product_name, rule_type('replace'|'inspect'), interval_km, interval_months, spec_hint, sort_order`.
- **leads** — `name, phone, message, car_model, source('website'|'calculator'|'product'), status('new'|'contacted'|'closed'), metadata jsonb, created_at`.

### RLS (включён на всех таблицах)
- Публичное чтение: `products` (is_available), `car_models` (is_active), `blog_posts` (published), `product_compatibility`, `blog_post_products`, `maintenance_rules` — всем.
- `leads`: **anon-политики INSERT нет** — единственный путь записи это `/api/leads` (service-role, минует RLS, со своей валидацией/consent/rate-limit); `authenticated` — полный доступ.
- Остальное (включая `product_compatibility` и `blog_post_products`): `authenticated` (админ) — полный доступ, политики с явным `USING` + `WITH CHECK`.
- Триггер `set_updated_at` на products/blog_posts.
- ⚠️ История: до миграции 003 у `product_compatibility`/`blog_post_products` не было админ-политик записи → галочки совместимости в админке **молча** терялись (RLS отфильтровывал DELETE, отклонял INSERT, а ошибки не проверялись). Исправлено в схеме, миграции 003 и `saveProduct` (теперь ошибки проверяются).

### ⚠️ ОБЯЗАТЕЛЬНО при настройке новой БД (порядок)
1. Создать **новый, чистый** проект Supabase (в прошлый раз ключи случайно вели в чужой проект с таблицами `clients/financial_goals/products` — это вызвало конфликт; нужен отдельный проект под Damu Auto).
2. SQL Editor → выполнить `database/schema.sql`.
3. SQL Editor → выполнить `database/seed.sql` (4 модели Geely, 1 товар, правила ТО для Monjaro).
4. SQL Editor → выполнить **`database/migrations/002_blueprints.sql`** — добавляет колонки схем авто и сидит Monjaro (картинка + 5 хотспотов). **Без этой миграции** кнопка «Сохранить» в редакторе схем падает (нет колонок), хотя публичный сайт Monjaro всё равно покажет из кода-фолбэка.
5. SQL Editor → выполнить **`database/migrations/003_rls_security_fixes.sql`** — админ-политики записи для `product_compatibility`/`blog_post_products` + удаление anon-INSERT в `leads`. (В свежем `schema.sql` это уже учтено, но на существующей БД миграция обязательна — иначе совместимость товаров не сохраняется.)
5a. SQL Editor → выполнить **`database/migrations/004_blueprints_all_models.sql`** — схемы (Cloudinary SVG) + по 5 хотспотов для Atlas/Coolray/Okavango. Позиции выверены по реальной отрисовке узлов на каждой схеме; точную подгонку делать в `/admin/blueprints`.
6. Authentication → Users → **Add user** (email + пароль, ✅ Auto Confirm) — это логин в админку. Регистрации на сайте нет.
7. 🔴 **Authentication → Sign In / Up → Email → отключить signups** (по умолчанию в Supabase они ВКЛЮЧЕНЫ). Все RLS-политики дают полный CRUD любому `authenticated` — если регистрация открыта, кто угодно может зарегистрироваться через публичный anon-ключ и получить права админа.

Текущее состояние данных в рабочей БД: правила ТО заданы **только для Monjaro**; у Atlas/Coolray/Okavango калькулятор показывает пустое состояние (нужно добавить правила через `/admin/calculator`). Блог пуст. Товаров мало — наполнять через админку.

---

## 5. Supabase-клиенты и Auth

- `lib/supabase/client.ts` — `createBrowserClient` (anon) для клиентских компонентов.
- `lib/supabase/server.ts` — `createServerClient` (anon, cookie-based) для серверных компонентов/Server Actions; учитывает сессию пользователя → под ней работает RLS `authenticated`.
- `lib/supabase/admin.ts` — `createClient` с **service-role** ключом, **только** в серверных роутах (например `/api/leads`). Никогда не отдавать в браузер.

**Env (`.env.local` локально + Vercel → Settings → Environment Variables):**
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...           # секрет, только сервер
# (опционально) LEAD_IP_HASH_SALT=...   # ключ HMAC для ip_hash заявок; без него берётся service-role ключ
# (будущее) N8N_WEBHOOK_URL=...         # для пересылки заявок в CRM (в коде закомментировано)
```
`.env.local` в `.gitignore` — в репозиторий не попадает (это норма; на Vercel ключи задаются отдельно).

### Админка и фикс redirect-loop (важно понимать)
Изначально `admin/layout.tsx` содержал auth-guard и оборачивал **всё** под `/admin`, включая `/admin/login` → редирект логина сам на себя → петля → выкидывало на `/`. **Решение:** route group `(protected)`:
- `admin/layout.tsx` — простой passthrough (без guard).
- `admin/(protected)/layout.tsx` — здесь guard (`getUser()` → нет → `redirect('/admin/login')`) + шапка + logout.
- `/admin/login` лежит вне `(protected)` → не охраняется.
Группа `(protected)` не меняет URL: `(protected)/page.tsx` = `/admin`.

---

## 6. Публичные данные (как фронт читает БД)

Всё чтение — в **`lib/queries.ts`** (`import 'server-only'`):
- `getCatalogProducts()` → товары + имена совместимых моделей (join `product_compatibility(car_models(name))`), маппинг в `PublicProduct` (hue по категории для процедурного фона, если нет фото).
- `getCarModels()` → активные модели.
- `getMaintenanceModels()` → модели + **построенные `milestones`** из `maintenance_rules`:
  - билдер `buildMilestones`: шаги по 10 000 км до `max(interval_km)`; на каждом шаге деталь «due», если `km % interval_km === 0`;
  - узел (`bodyNode`) определяется эвристикой `inferNode(product_name)` по ключевым словам (масло/фильтр→engine, салон→cabin, тормоз→brakes, антифриз→cooling, акпп/dct→transmission);
  - в модель кладётся `blueprint` из БД (`blueprint_url`+`blueprint_nodes`), иначе код-фолбэк `getBlueprint(slug)`.
- `getPublishedPosts()` / `getPostBySlug()`.

Публичные страницы (`/`, `/catalog`, `/calculator`, `/blog`, `/blog/[slug]`) — `force-dynamic`, поэтому изменения в админке появляются на сайте сразу. **Проверено сквозняком:** товар/статья/правило, добавленные в БД, мгновенно видны на публичных страницах; форма → БД → раздел «Заявки».

Категории каталога: `CATEGORY_LABELS` в `queries.ts` (`all/oil/filter/fluid/spark_plug/other`) — совпадают с категориями в `ProductForm`.

---

## 7. Ключевые фронтенд-компоненты

### MaintenanceCenter (`components/calculator/MaintenanceCenter.tsx`) — client
Centerpiece «Контрольный центр ТО». Левая панель — схема авто на анимированном тумане; правая — горизонтальный gauge интервалов (10k…100k) + карточки деталей (2 колонки на мобиле, список на десктопе) с кнопками Kaspi. Модели — свайпаемая карусель. Туман (`FogBackground`) рендерится на всю левую панель **только если у модели есть `blueprint.image`**; иначе — SVG-силуэт без WebGL. Поверх тумана — еле заметная blueprint-сетка (CSS, радиальная маска по краям) и виньетка.

### VehicleBlueprint (`components/calculator/VehicleBlueprint.tsx`) — client
Два режима:
1. **Image mode** (есть `blueprint.image`): `<img>` схемы (прозрачный SVG/PNG с Cloudinary) + поверх **хотспоты** из `blueprint.hotspots[]`. Хотспот = полое светящееся кольцо (НЕ заливка); активные (когда `bodyNode` входит в active-узлы выбранного интервала) — светятся голубым (`#9FE0FF` + cyan-glow + pulse), неактивные — приглушённый контур, декоративные (без `bodyNode`) — золотой контур. **Выноски-линии**: прямые `<line>` или **кривые** (quadratic bezier `M..Q..`, если у `line` есть `cx/cy`), подпись у конца линии. Hover-ореол на каждой точке (зона 36px). SVG-оверлей для линий: `viewBox 0 0 100 100 preserveAspectRatio="none"`, `vector-effect="non-scaling-stroke"`.
2. **Fallback SVG**: схематичный силуэт SUV с узлами (для моделей без картинки).

Координаты хотспотов — в **% от изображения**. Модель хотспота (`BlueprintHotspot` в `types`): `{ id, x, y, bodyNode?, label?, line?: { x2, y2, cx?, cy?, kind?: 'curve' | 'elbow' } }`.

**Стили выносок** (общий хелпер `leaderLinePath()` в `lib/utils.ts`, используется и публичным компонентом, и редактором):
- **прямая** — нет `cx/cy`;
- **изгиб** (`kind` отсутствует или `'curve'`) — квадратичная Безье, `cx/cy` = контрольная точка (старые данные без `kind` читаются как изгиб);
- **излом** (`kind: 'elbow'`) — полилиния `M…L cx cy L…`: угловой сегмент + горизонтальный «подчерк» к подписи, как на тех-чертежах. В редакторе стиль переключается сегмент-контролом «Прямая / Изгиб / Излом», жёлтый ромб — перетаскиваемая точка изгиба/угол излома.

### realistic-fog-background (`components/ui/realistic-fog-background.tsx`) — client, WebGL
Анимированный туман (fbm-шейдер) на WebGL. Адаптирован под контейнер (ResizeObserver), палитра — холодный navy + еле тёплый акцент + луч света; учитывает `prefers-reduced-motion`. Дефолтные цвета вынесены в module-level константы (чтобы не пересоздавать GL-контекст каждый рендер). Используется фоном в Центре ТО.

### CatalogGrid (`components/catalog/CatalogGrid.tsx`) — client
Props: `products, categories, models, initialModel`. Фильтр по модели + категории. Сетка **строго 2 колонки на мобиле**, 4 на десктопе. Раскрытие карточки: **desktop** — layout-morph модалка (motion `layoutId`), **mobile** — **bottom-sheet** (drag-to-dismiss). `TiltCard` 3D-наклон только на десктопе (`intensity=0`+`glare=false` на мобиле). Фон карточки — фото товара или процедурный градиент по `hue`.

### MacroCompareSlider (`components/blog/MacroCompareSlider.tsx`) — client
Слайдер «оригинал/подделка»: перетаскивание раздела (pointer events, работает на тач), **макро-лупа** — на десктопе тумблер, на мобиле **long-press** (лупа смещена над пальцем). Поддерживает либо `image` (URL), либо `texture` (CSS из `lib/textures.ts`). На homepage/в демо используются процедурные текстуры; в статьях блога — `before_image/after_image` из БД.

### HeroLogo (`components/shared/HeroLogo.tsx`) — client ⭐ (много итераций, аккуратно!)
Логотип в правой части HERO (на мобиле — центр над заголовком). **Сценарий (по фидбеку)**: эмблема в тени (`brightness 0.45`); **две тонкие кометы** рождаются на **6 часах**, поднимаются по обеим сторонам кольца (CW 6→3→12, CCW 6→9→12, `rotate: [0, ±180, ±180]`, доезжают к 88% цикла) и **каждая везёт свой спотлайт**, выхватывающий лого из тени по своей стороне (маска SPOT с длинной полутенью до 70%, внутренний `<img>` контр-вращается). **При встрече на 12 часах** кометы гаснут (`opacity times [0,0.06,0.88,1]`) и по лого **сверху вниз мягким градиентом** проходит свет (WASH linear-gradient маска, вспышка на times [0.8→0.9→1]). Цикл 4.4 с; скачок rotate при репите невидим (opacity=0). Фоновых radial-подложек НЕТ (давали «квадрат» свечения на краях блока — фидбек).
- **Логотип** — векторный знак DAMU: `.../e_trim/f_auto,q_auto,w_700/v1781179834/...ztg9td.svg`. ⚠️ У исходного SVG артборд больше рисунка — **`e_trim` обязателен**. История неудачных форматов: `.cdr` нерендерим, `.ai` был без PDF-совместимости (пустой растр).
- `components/ui/gradient-tracing.tsx` не используется (остался в ui/ с пропом `responsive`). Версии анимации в git: комета-спотлайт `aa758d7`, tracing-кольцо `d604f6a`, дуги 12/6→3/9 `1c1adbb`, tracing на 6 ч + статичный свет `a532d15`.
- Картинка лого — Cloudinary `f_auto,q_auto,w_700` (~96 КБ вместо 1.5 МБ SVG).
- Текущий URL логотипа: `.../v1781097287/...tcyixo.svg`.

> Заметка по правкам HeroLogo: пользователь чувствителен к деталям свечения. Если просят «ярче/темнее» — это `brightness` reveal-слоя и базы; «свет резкий» — `blur` + прозрачные стопы; «комета не в ту сторону» — направление `rotate`. **Скриншот-превью часто виснет** на этой странице (WebGL/анимации) — не уходить в цикл, лучше менять значение и просить проверить на деплое.

### Header / Footer / MobileTabBar
- **Header**: плавающий glass; сверху — **статичная** строка Geely Club (по строке раз в ~8 с пробегает золотой шиммер `.shimmer-gold`; бегущая marquee удалена как назойливая — фидбек). Логотип через `next/image` (`priority`), ссылки. На мобиле верхняя nav скрыта — её заменяет нижний таб-бар.
- **MobileTabBar**: фиксированный нижний бар (Каталог/ТО/Подделки/Заявка), 48px-таргеты, safe-area, прячется на `/admin`.
- Оба компонента скрываются на `/admin`.

### Прочее
- `PageTransition` — fade/slide при смене роута (motion + usePathname).
- `Reveal` — scroll-reveal (whileInView).
- `CookieConsent` — glass-баннер, пишет `localStorage` + cookie, появляется один раз.
- `LegalDoc` — рендер правовых страниц (структурированные секции).
- `AdminHeader/AdminField` — переиспользуемые элементы админ-форм (TextField/TextArea/SelectField/Toggle).

---

## 8. Дизайн-система (`globals.css`, Tailwind v4)

Тема всегда **тёмная**, бренд — **глубокий navy + золото** (фирменный логотип).

| Токен | Значение | Назначение |
|---|---|---|
| `--background` | `#061521` | основной фон |
| `--surface` / `--surface-raised` | `#0B253A` / `#0E2A42` | панели, карточки |
| `--accent` | `#C49A45` (gold) | акценты, CTA, активные состояния |
| `--accent-foreground` | `#0B1A28` | текст на золоте |
| `--gold-soft` | `#D9B870` | градиенты |
| `--foreground` | `#FFFFFF` | заголовки |
| `--muted-foreground` | `#94A3B8` | вторичный текст / OEM |
| `--border` / `--glass-border` | `rgba(196,154,69,0.10..0.12)` | бордеры с золотым отливом |
| прямые | `--color-brand-deep/navy/gold` | `#061521/#0B253A/#C49A45` |

**Шрифты:** заголовки — **Space Grotesk** (`next/font/google`), тело — **Satoshi** (Fontshare, через `<link>` в `layout.tsx`), fallback Inter. (Чек-лист «$10K» требует НЕ Inter/Roboto — соблюдено.)

**Утилиты в globals.css:** `.glass`/`.glass-strong` (glassmorphism), `.glow-accent`, `.text-gradient`/`.text-gold-gradient`, `.grid-backdrop`, `.shimmer-gold` (редкий шиммер по тексту), `.no-scrollbar`, `.touch-target` (48px), `.gpu`, глобальный `:focus-visible` ring (a11y), кастомный скроллбар, `prefers-reduced-motion`.

---

## 9. Мобайл / Touch / Доступность

- Mobile-first: нижний таб-бар вместо бургера; таргеты ≥ 44–48px; bottom-sheets вместо модалок; 2-колоночные сетки; свайп-карусели; touch-перетаскивания в слайдере/редакторе.
- `useMediaQuery('(max-width: 767px)')` — переключение desktop/mobile поведения.
- `:focus-visible` ring, семантический HTML, мета-теги (см. `layout.tsx`).
- ⚠️ Был баг (исправлен): `TiltCard` вызывал хук `useTransform` условно внутри `glare` → при смене `isMobile` менялось число хуков → краш каталога на мобиле. Сейчас все хуки безусловны.

---

## 10. Соответствие закону РК «О персональных данных»

- **CookieConsent** — баннер согласия (localStorage + cookie).
- **LeadForm** — обязательный, **по умолчанию снятый** чекбокс согласия; кнопка submit заблокирована, пока не отмечен; ссылки на правовые страницы.
- **`/privacy-policy`** и **`/data-consent`** — структурированные правовые страницы под Закон РК № 94-V (ссылки в футере).
- **`/api/leads`** — серверная валидация (имя/телефон, regex телефона), очистка управляющих символов, in-memory rate-limit (5/мин на IP), **обязательная проверка `consent === true`** (иначе 422), хранение `consent_at` и **HMAC-SHA256-хэша IP** (не сырого; ключ — `LEAD_IP_HASH_SALT` или service-role ключ) в `metadata`. Клиентский `metadata` фильтруется по whitelist ключей (`page`, `referrer`, `utm_*`) с лимитом 300 символов на значение. Готов к webhook (закомментирован блок n8n).

---

## 11. Деплой и запуск

**Локально:**
```bash
npm install
# заполнить .env.local (3 ключа Supabase)
npm run dev      # http://localhost:3000
npm run build    # прод-сборка (Turbopack); сейчас зелёная, 20 роутов
```

**Vercel:** импорт репо → задать 3 env-переменные → Deploy. Каждый `git push` в `main` = авто-деплой.
**Netlify:** есть `netlify.toml` + `@netlify/plugin-nextjs` (запасной путь).

**Изображения:** `next.config.ts` включает AVIF/WebP. Логотип и схемы авто хостятся на **Cloudinary**; тяжёлые SVG отдаются как оптимизированный растр через `f_auto,q_auto[,w_700]`.

**Git-конвенции:** коммиты подписываются `Co-Authored-By: Claude ...`; работаем в `main` (для этого проекта так сложилось); PR не используются.

---

## 12. Что сделано / Что осталось (TODO)

**Готово:** дизайн-система и бренд; адаптив/touch; полная БД-схема + RLS; админка (auth + CRUD товаров/блога/правил ТО/заявок + визуальный редактор схем); публичные страницы на живых данных; форма заявок с РК-комплаенсом; интерактивный Центр ТО (схема + туман + хотспоты); макро-слайдер; HERO с анимированным логотипом-кометой.

**Осталось / на будущее:**
1. **Наполнить контент** через админку: правила ТО для Atlas/Coolray/Okavango; товары с фото (Cloudinary) и совместимостью; статьи блога. Схемы авто для всех 4 моделей сидятся миграцией 004 — осталось при желании подогнать хотспоты и добавить выноски в `/admin/blueprints`.
2. **Запустить миграции 002 и 003** в актуальной БД, если ещё не запущены (002 — иначе падает сохранение схем; 003 — иначе молча теряется совместимость товаров).
2a. **Проверить в Supabase, что signups отключены** (см. §4, шаг 7) — критично для безопасности админки.
3. **Webhook в CRM/n8n** — раскомментировать блок в `api/leads/route.ts` + добавить `N8N_WEBHOOK_URL`.
4. `blog_post_products` (виджеты товаров внутри статей) — таблица есть, UI не реализован.
4a. Привязка правил ТО к товарам: `getMaintenanceModels()` уже джойнит `products(kaspi_url)` → реальные ссылки Kaspi в Центре ТО, но в `AddRuleForm` нет выбора товара — `product_id` пока заполняется только через SQL. Нужен селект товара в форме.
5. Удалить мёртвый код (см. §3), если нужно почистить.
6. Перфоманс схем авто: SVG с Cloudinary бывают тяжёлыми — отдавать через `f_auto,q_auto` (для растровых превью) либо хранить оптимизированные.
7. Rate-limit заявок — in-memory `Map` (на serverless каждый холодный инстанс со своим счётчиком) и доверяет `x-forwarded-for`. Для реальной защиты от спама: Upstash Redis rate-limit и/или Turnstile/hCaptcha.

**Открытых багов нет** (аудит 2026-06-11: исправлены RLS-политики совместимости, сброс `published_at`, мёртвый `product_id` в правилах ТО, CSRF logout, слабый IP-хэш, нефильтрованный `metadata`). Сборка зелёная, TypeScript без ошибок.

---

## 13. Подводные камни (на что не наступать)

- **Не вызывать React-хуки условно** (был краш в TiltCard).
- **`params`/`searchParams` — await** (Next 16).
- **service-role ключ — только сервер** (`lib/supabase/admin.ts`), не тащить в client-компоненты.
- **Tailwind v4**: править токены в `globals.css` (`@theme` / `:root`), а не искать `tailwind.config.js` — его нет.
- **radial-gradient маски**: по умолчанию `farthest-corner` — для предсказуемого размера колец использовать `closest-side`/`farthest-side` (этот нюанс уже отлажен в HeroLogo).
- **Скриншот-превью** виснет на WebGL/анимированных страницах — не уходить в циклы проверок, менять значение и проверять на деплое.
- **Кириллица в Bash/PowerShell**: при записи файлов с русским текстом через шелл легко словить mojibake/NUL — писать такие файлы инструментом Write, а не через эхо/sed в шелле.
