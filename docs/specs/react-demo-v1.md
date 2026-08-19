# React Demo v1 — специфікація

## 1. Мета

Побудувати мінімальний React SPA, який демонструє наскрізний сценарій роботи вже прийнятого `Simulation Engine v1` без backend, persistence або зовнішніх інтеграцій.

Demo має дозволити користувачеві змінити параметри контрольного сценарію `Internet`, запустити симуляцію та побачити розраховану тривалість доступності, статус і причинне пояснення.

## 2. Межі

`React Demo v1` — це демонстраційний UI, а не повний CRUD MVP.

У scope:

- один зафіксований сервіс `Internet`;
- залежності `Router`, `ONT/ONU`, `Internet Provider`;
- введення тривалості відключення `H` у годинах;
- введення доступності трьох leaf-залежностей у годинах;
- перетворення введених годин у цілі хвилини перед викликом engine;
- запуск через публічний `simulate(model, scenario)`;
- відображення `T`, `status`, limiting dependency/dependencies і causal path/paths;
- відображення validation errors, якщо engine повернув failure;
- повторний запуск після зміни input без перезавантаження сторінки;
- адаптивне базове оформлення без UI framework.

Поза scope:

- створення/редагування/видалення довільних Service/Device/ExternalProvider;
- graph editor;
- кілька демонстраційних сервісів;
- accounts;
- persistence/local storage;
- backend/API;
- DB;
- зовнішні графіки відключень;
- AI;
- battery W/Wh calculator;
- deploy. Deploy планується окремим етапом після acceptance `React Demo v1`.

## 3. Контрольний сценарій

Модель:

```text
Internet
├─ Router
├─ ONT/ONU
└─ Internet Provider
```

Початкові значення форми:

- Outage duration: `6 h`;
- Router availability: `8 h`;
- ONT/ONU availability: `2 h`;
- Internet Provider availability: `72 h`.

Перед викликом simulation engine значення переводяться у хвилини:

- `H = 360`;
- Router = `480`;
- ONT/ONU = `120`;
- Internet Provider = `4320`.

Очікуваний результат згідно з канонічним simulation contract:

- `T(Internet) = 120 min = 2 h`;
- status = `Limited`;
- limiting dependency = `ONT/ONU`;
- causal path = `Internet → ONT/ONU`.

Після зміни `ONT/ONU availability` з `2 h` на `8 h` очікується:

- `T(Internet) = 480 min = 8 h`;
- status = `Available`;
- limiting dependencies = порожньо;
- causal paths = порожньо.

Ці значення є контрольними fixture-даними, а не результатами реальних вимірювань.

## 4. UI

Одна сторінка складається з трьох логічних блоків.

### 4.1. Заголовок

- назва: `Household Service Availability`;
- коротке пояснення, що система оцінює доступність сервісу через його обов’язкові залежності.

### 4.2. Scenario form

Поля типу `number`:

- `Outage duration (hours)`;
- `Router availability (hours)`;
- `ONT/ONU availability (hours)`;
- `Internet Provider availability (hours)`.

Правила UI input:

- дозволяються значення `>= 0` для leaf availability;
- outage має бути `> 0`;
- форма не повинна самостійно дублювати всі domain validation rules engine;
- значення, які не можна коректно перетворити в цілі хвилини, мають дати зрозуміле повідомлення і не викликати `simulate()` з некоректним payload;
- основна simulation validation залишається в engine.

Кнопка:

`Run simulation`

### 4.3. Result

При success показати:

- Service: `Internet`;
- `Availability: <hours> h`;
- `Status: Available | Limited | Unavailable`;
- `Limiting dependency` або `Limiting dependencies`;
- `Causal path` або `Causal paths`.

Для `Available` limiting dependency і causal path не показуються як причини; UI пояснює, що сервіс доступний протягом усього заданого outage scenario.

При failure показати список engine validation errors у зрозумілому текстовому вигляді, зберігаючи їхні `code` для діагностики.

## 5. Інтеграція з engine

React-компоненти не реалізують simulation rules.

UI формує conceptual model/scenario, після чого викликає:

```js
simulate(model, scenario)
```

Єдиним source of truth для calculation/status/bottleneck/causal paths залишається `apps/web/src/simulation/`.

Назви demo nodes повинні відображатися через окремий lookup `id → display name`; engine contract не змінюється заради UI.

## 6. Технології

- React — погоджений frontend framework проєкту;
- Vite — мінімальний dev/build harness, без додаткового UI framework;
- CSS — власні стилі;
- поточний `node:test` suite для simulation engine зберігається без заміни;
- новий UI testing framework у `React Demo v1` не додається.

Acceptance UI перевіряється через build + контрольний functional walkthrough. Автоматизоване UI testing може бути окремо обґрунтовано пізніше, якщо стане потрібним для вимог проєкту.

## 7. Acceptance criteria

`React Demo v1` приймається, якщо:

1. `npm test` зберігає green весь `Simulation Engine v1` suite.
2. Production build React SPA завершується успішно.
3. Початковий контрольний сценарій показує `2 h`, `Limited`, `ONT/ONU`, `Internet → ONT/ONU`.
4. Після зміни ONT/ONU на `8 h` повторний run показує `8 h`, `Available` та не показує limiting cause/path.
5. Значення leaf availability `0 h` може бути передано engine і приводить до валідного `Unavailable`, якщо воно є minimum.
6. Некоректний outage/input не спричиняє падіння сторінки; користувач бачить зрозуміле повідомлення.
7. React UI не містить власної копії алгоритму `min`, status rules або bottleneck traversal.
8. Backend, persistence, DB, external integrations і сторонній UI framework не додані.
9. Повторний запуск працює без reload сторінки.
10. Reviewer фактично перевіряє build, simulation regression suite і контрольний walkthrough перед acceptance.

## 8. Наступний етап

Після acceptance `React Demo v1` потрібен окремий етап `Deploy v1`.

Конкретна hosting/cloud platform не обирається цією специфікацією. Її вибір має відповідати технологічним обмеженням проєкту та бути погоджений окремо.