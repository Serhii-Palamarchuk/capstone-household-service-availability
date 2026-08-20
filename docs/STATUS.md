# Поточний стан проєкту

## Поточний етап

Завершено й прийнято:

- `Simulation Engine v1`;
- `React Demo v1`;
- `Deploy v1`;
- `User-facing MVP v1`: design, acceptance scenarios `AC-01…AC-14`, implementation, final whole-branch review, cleanup, merge у `main`, deployment і post-deploy live smoke.

Live URL: https://serhii-palamarchuk.github.io/capstone-household-service-availability/

Поточний deployed flow:

```text
Equipment → Backup → Services & Scenario → Result
```

`Simulation Engine v1`, Availability Estimator formulas, service-template semantics і recommendation logic є стабільною базою та не повинні змінюватися в поточній UX-ітерації.

## Supervisor checkpoint — Week 2

Weekly Capstone Progress Report — Week 2 був відправлений Тетяні через LMS; repository + live demo також були надіслані.

За повідомленням користувача 2026-08-20, завдання за Week 2 вже прийняте, але окремих текстових коментарів/нового feedback Тетяни не надійшло.

Користувач окремо вирішив не блокувати Week 3 очікуванням додаткового feedback і перейти до usability/UX polish без розширення MVP scope.

## Accepted deployed verification baseline

Перед UX Polish v1 поточна accepted реалізація має фактичну перевірену базу:

- full suite після cleanup/merge: `100 passed`, `0 failed`;
- production build Vite `8.2.1` — successful;
- локальний browser AC-14 walkthrough включав rerun без reload;
- post-deploy live browser smoke AC-12 підтвердив основний accepted flow.

Post-deploy AC-12 controlled fixture:

- Home backup: `80 W`, runtime `360 min`;
- Router: `360 min`;
- ONT/ONU: `360 min`;
- Laptop: `360 min` external + `120 min` internal = `480 min`;
- Remote Work: `Limited`, availability `360 min`;
- limiting dependencies: Router + ONT/ONU;
- causal paths через Internet до Router та ONT/ONU;
- `MISSING_BACKUP_SOURCE_MAX_OUTPUT` показано очікувано.

Ці значення є контрольними test fixtures, а не результатами реальних вимірювань автономності.

## Week 3 — UX Polish v1 design checkpoint

2026-08-20 користувач провів usability review актуального live UI та погодив напрям **compact rows + progressive details** замість великих card-блоків.

Підготовлено draft-документи для фінального user review:

- `docs/specs/ux-polish-v1.md`;
- `docs/specs/ux-polish-v1-acceptance.md` (`UX-01…UX-30`).

Ключові погоджені UX-рішення:

- desktop acceptance viewport: `1920 × 1080`;
- density fixture: 5 Devices, 2 BackupSources, 3 ServiceInstances, 2 ExternalProviders; для Result усі 3 валідні ServiceInstances є targets;
- default/collapsed state кожного з 4 кроків має вміщуватися без вертикального page scroll;
- Device / BackupSource / Service custom `Name` стає optional і візуально другорядним;
- технічні labels формуються автоматично, наприклад `Router · 15 W` і `Power station · 1000 Wh · 1200 W max`;
- meaningful custom name показується як `Bedroom router (Router · 15 W)`;
- дублікати name/type/category не повторюються;
- однакові unnamed entities отримують компактний UI-disambiguator `#1`, `#2`;
- Backup assignment: 1 source → on/off control; 2+ sources → on/off + selector;
- Services показуються компактними rows із summary dependencies, target state і `Details`;
- Result перетворюється на компактний dashboard із пріоритетом target status/availability/limiting cause;
- Result дозволяє quick edit `usableCapacityWh`, `maxOutputPowerW` і outage duration з `Recalculate` через той самий pipeline;
- stepper дозволяє пряме повернення на будь-який попередній крок; компактна `Back`-кнопка також залишається;
- зміна upstream inputs робить попередній Result stale і вимагає нового run/recalculate;
- UA/EN switch входить у UX Polish v1 як другий пріоритет після compact redesign; перемикання не скидає state;
- нова third-party i18n dependency без окремого погодження не додається;
- engine/estimator/domain semantics не змінюються.

Статус UX Polish v1: **design draft written → awaiting final user review**. Coding cycle ще не починався.

## Source of truth

- `docs/STATUS.md` — поточний operational snapshot;
- `docs/DECISIONS.md` — accepted суттєві рішення;
- `docs/specs/user-facing-mvp-v1.md` — accepted User-facing MVP contract;
- `docs/specs/user-facing-mvp-v1-acceptance.md` — accepted AC-01…AC-14;
- `docs/specs/ux-polish-v1.md` — поточний UX Polish design draft;
- `docs/specs/ux-polish-v1-acceptance.md` — поточний UX acceptance draft;
- `docs/specs/repository-workflow.md` — agent workflow.

## Наступна дія

1. Користувач переглядає written `UX Polish v1` spec + acceptance draft.
2. Якщо зміни не потрібні — зафіксувати UX рішення як Accepted у `docs/DECISIONS.md` і змінити draft-status у spec/acceptance.
3. Після цього створити окремий implementation plan і лише потім передавати реалізацію Codex/Developer → Reviewer workflow.
4. Паралельно готувати Weekly Capstone Progress Report — Week 3 лише з фактично виконаних робіт і перевірених результатів.
