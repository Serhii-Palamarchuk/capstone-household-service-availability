# Поточний стан проєкту

## Поточний етап

Завершено й прийнято:

- `Simulation Engine v1`;
- `React Demo v1`;
- `Deploy v1`;
- `User-facing MVP v1`: design, `AC-01…AC-14`, implementation, review/cleanup, merge у `main`, deployment і post-deploy live smoke.

Live URL: https://serhii-palamarchuk.github.io/capstone-household-service-availability/

Поточний deployed flow:

```text
Equipment → Backup → Services & Scenario → Result
```

`Simulation Engine v1`, Availability Estimator formulas, service-template semantics, status semantics і recommendation logic є стабільною базою та не повинні змінюватися в поточній UX-ітерації.

## Supervisor checkpoint — Week 2

Weekly Capstone Progress Report — Week 2 був відправлений Тетяні через LMS; repository + live demo також були надіслані.

За повідомленням користувача 2026-08-20, Week 2 завдання вже прийняте, але окремих текстових коментарів/нового feedback Тетяни не надійшло. Користувач вирішив не блокувати наступну UX-ітерацію очікуванням додаткового feedback і продовжити без розширення MVP scope.

## Accepted deployed verification baseline before UX Polish v1

Остання фактично перевірена база User-facing MVP v1:

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

## Week 3 — UX Polish v1 accepted design

2026-08-20 користувач затвердив `UX Polish v1`.

Accepted docs:

- `docs/specs/ux-polish-v1.md`;
- `docs/specs/ux-polish-v1-acceptance.md` (`UX-01…UX-30`);
- `docs/DECISIONS.md` — D-005;
- `docs/plans/ux-polish-v1.md` — implementation plan.

Ключовий accepted UX contract:

- підхід **compact rows + progressive details**;
- 4-step wizard з інтерактивним backward stepper і окремою компактною `Back`-кнопкою;
- desktop acceptance viewport `1920 × 1080`;
- density fixture: 5 Devices, 2 BackupSources, 3 ServiceInstances, 2 ExternalProviders; на Result усі 3 сервіси є targets;
- кожен default/collapsed step має вміщуватися без vertical page scroll;
- Device / BackupSource / Service custom `Name` — optional і візуально другорядний; normalized domain `name` лишається non-empty через deterministic fallback;
- user-facing technical labels містять корисні характеристики та не дублюють custom name/category/type;
- Backup assignment: 1 source → on/off; 2+ sources → on/off + selector;
- Services — compact rows із dependency summary, target state і Details;
- Result — decision-first compact dashboard;
- quick edit із Result: `usableCapacityWh`, `maxOutputPowerW`, outage duration, лише через standard normalization → estimator → simulation pipeline;
- upstream edit робить попередній Result stale;
- UA/EN входить у UX Polish v1; English initial/default; language switch не скидає state/result;
- нова third-party i18n dependency не додається;
- ExternalProvider name лишається required;
- engine/estimator/template/recommendation semantics не змінюються.

## Implementation plan

`docs/plans/ux-polish-v1.md` містить 8 послідовних reviewer gates:

1. optional names + deterministic/display labels;
2. local EN/UA translation layer;
3. backward stepper + stale-result state;
4. compact Equipment + Backup;
5. compact Services & Scenario + discoverable validation;
6. compact Result + allow-listed quick edit;
7. повне EN/UA wiring;
8. density/accessibility polish + final regression/browser verification + evidence.

План вимагає TDD/focused tests для нових pure helpers, повний existing suite, production build, manual `1920 × 1080` walkthrough, quick-edit/navigation/language smoke та whole-branch review. Числові/успішні результати не фіксуються до фактичного виконання перевірок.

## Week 3 report submission

`Weekly Capstone Progress Report — Week 3` підготовлено як ретроспективний звіт за погодженою з керівником звітною послідовністю.

Scope Week 3 report:

- User-facing MVP v1 — реалізація, інтеграція, merge/deploy і первинне тестування;
- post-deploy live smoke;
- виявлені usability-проблеми;
- UX Polish v1 design + acceptance criteria + implementation plan як підготовка наступної ітерації.

2026-08-20 звіт за Week 3 відправлено Тетяні через LMS і продубльовано у Slack. Поточний статус: `submitted → awaiting supervisor feedback`.

Реалізація UX Polish v1 відноситься до Week 4 report. Користувач уже запустив Codex для цієї реалізації, але нові test/build/browser/merge/deploy results ще не зафіксовані.

## Source of truth

- `docs/STATUS.md` — current operational snapshot;
- `docs/DECISIONS.md` — accepted суттєві рішення;
- `docs/specs/user-facing-mvp-v1.md` — accepted User-facing MVP contract;
- `docs/specs/user-facing-mvp-v1-acceptance.md` — accepted AC-01…AC-14;
- `docs/specs/ux-polish-v1.md` — accepted UX Polish v1 design;
- `docs/specs/ux-polish-v1-acceptance.md` — accepted UX-01…UX-30;
- `docs/plans/ux-polish-v1.md` — implementation plan;
- `docs/specs/repository-workflow.md` — Developer → Reviewer workflow.

## Наступна дія

UX Polish v1 coding cycle запущено користувачем через Codex в ізольованій гілці/worktree. До отримання фінального звіту не фіксувати успішні test/build/browser results і не заявляти merge/deploy.

Після завершення Codex: перевірити фактичні результати, whole-branch review і стан branch; лише після цього окремо вирішити merge/deploy. Перевірені результати використовувати для Week 4 report.

Паралельно готуватися до Week 5: Розділ 3 «Методологія» та перша версія Розділу 4 «Результати та обговорення».
