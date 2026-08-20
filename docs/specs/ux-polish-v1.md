# UX Polish v1 — специфікація дизайну

Статус: **Прийнято — 2026-08-20**  
Дата: 2026-08-20

## 1. Мета

Покращити зручність використання та інформаційну щільність розгорнутого User-facing MVP v1 без зміни семантики симуляції та без розширення предметного scope MVP.

Ітерація усуває конкретну usability-проблему, виявлену під час live walkthrough: поточні великі картки форм і результатів займають надто багато вертикального простору, повторюють підписи та змушують користувача зайво прокручувати сторінку.

Основна ціль дизайну:

> Зберегти чинну чотирикрокову ментальну модель, але зробити типовий desktop-сценарій компактним, читабельним і зручним для швидкого коригування.

## 2. Межі scope

UX Polish v1 змінює представлення, навігацію, користувацькі назви та workflow швидкого редагування.

Не змінюються:

- `Simulation Engine v1`;
- формули Availability Estimator;
- семантика service templates і правила ролей;
- семантика статусів;
- recommendation logic;
- моделювання `ExternalProvider`;
- погоджені W/Wh-спрощення з `user-facing-mvp-v1.md`.

Не додаються backend, база даних, cloud service, optimizer, dynamic load model або нова доменна сутність.

## 3. Розглянуті альтернативи дизайну

### A. Повністю табличний UI

Використати щільні таблиці для Equipment, Backup, Services і Result.

Переваги:
- максимальна компактність;
- зручне порівняння рядків.

Недоліки:
- інтерфейс для побутового користувача може виглядати як адміністративний редактор даних;
- залежності сервісів і пояснення результатів складніше швидко читати.

### B. Компактні рядки + progressive details — обрано

Типовий стан подається одним компактним рядком, а другорядні поля та деталі відкриваються лише за потреби.

Переваги:
- висока інформаційна щільність без втрати чотирикрокового flow;
- зберігаються читабельні пояснення сервісів і залежностей;
- optional-поля візуально залишаються другорядними;
- підтримується цільовий desktop baseline без вертикального scroll.

Недоліки:
- потрібні чіткі правила формування summary labels і collapsed/expanded states.

### C. Односторінковий dashboard/configurator

Розмістити Equipment, Backup, Services, Scenario і Result на одному екрані.

Переваги:
- менше переходів між екранами.

Недоліки:
- істотно вище когнітивне навантаження для нового користувача;
- структурна зміна значно більша, ніж потрібно для поточного MVP.

### Рішення

Використати **B: компактні рядки + progressive details**, зберігши чинний чотирикроковий wizard.

## 4. Desktop acceptance baseline

Основний acceptance viewport — **CSS viewport 1920 × 1080**.

Baseline-конфігурація для перевірки щільності:

- 5 `Device`;
- 2 `BackupSource`;
- 3 `ServiceInstance`;
- 2 `ExternalProvider`.

Для перевірки щільності Step 4 у контрольному валідному fixture всі 3 `ServiceInstance` обираються як target services.

У default/collapsed state кожен із чотирьох кроків має вміщуватися в цей viewport **без вертикального page scroll**.

Вимога no-scroll стосується нормального collapsed state. Відкриті `Details`, dropdown menus, dialogs/modals, validation states з великою кількістю повідомлень або надзвичайно довгі користувацькі назви можуть використовувати локальний або page scroll за потреби.

На менших viewport інтерфейс має залишатися функціональним і читабельним, але UX Polish v1 не вимагає відсутності вертикального scroll нижче acceptance viewport.

## 5. Спільні правила labels сутностей

### 5.1 Користувацькі custom names

Custom `Name` є optional і візуально другорядним для:

- `Device`;
- `BackupSource`;
- `ServiceInstance`.

Внутрішнє/domain-поле `name` залишається непорожнім. Якщо користувач не задає custom name, normalization генерує детермінований непорожній fallback із технічних атрибутів сутності.

`id` залишається внутрішнім і не вводиться користувачем.

### 5.2 Device label

Default technical label:

```text
<Category> · <powerW> W
```

Приклади:

```text
Router · 15 W
Laptop/Desktop · 60 W
```

З meaningful custom name:

```text
Bedroom router (Router · 15 W)
```

Якщо custom name після trim/case normalization дублює category або згенерований default label, дубльований текст не показується.

Якщо два неназвані `Device` інакше мали б однаковий visible label, UI додає компактний ordinal лише для розрізнення, наприклад `Router · 15 W #1`, `Router · 15 W #2`.

### 5.3 BackupSource label

Default technical label:

```text
<Type> · <usableCapacityWh> Wh
```

Якщо maximum output задано:

```text
<Type> · <usableCapacityWh> Wh · <maxOutputPowerW> W max
```

Приклад із custom name:

```text
EcoFlow (Power station · 1000 Wh · 1200 W max)
```

Duplicate custom name приховується за тим самим правилом, що й для `Device`.

### 5.4 Service label

Default technical label використовує template та optional variant:

```text
Internet · Fiber
Remote Work
```

З meaningful custom name:

```text
Home internet (Internet · Fiber)
```

### 5.5 ExternalProvider

`ExternalProvider` зберігає явне user-visible name, оскільки поточна модель не має окремого provider type/category, з якого можна безпечно згенерувати рівноцінний label.

## 6. Step 1 — Equipment

Великі Device cards замінюються компактними однорядковими entries.

У collapsed row пріоритет мають:

- generated/display label;
- category;
- power;
- summary внутрішньої батареї;
- `Details`;
- remove action.

`Name` не показується як перше або головне поле. Воно редагується всередині `Details` і чітко позначається як optional.

Internal battery capacity залишається частиною погодженої Device model. Рядок може показувати коротке summary на кшталт `120 Wh battery` або `No battery`.

`Add device` залишається видимою біля заголовка секції.

## 7. Step 2 — Backup

### 7.1 BackupSource rows

Великі BackupSource cards замінюються компактними рядками.

Основна інформація:

- technical/display label;
- type;
- usable capacity;
- summary maximum output, якщо задано;
- `Details`;
- remove action.

Custom `Name` є optional і редагується в `Details`.

`maxOutputPowerW` залишається optional. Чинна семантика validation/warning не змінюється.

### 7.2 Device assignments

Assignment interaction адаптується до кількості configured external sources:

- **0 sources:** source selector не показується; `Device` просто не має external assignment;
- **1 source:** для кожного `Device` використовується простий external-backup on/off control; увімкнення призначає єдине source;
- **2+ sources:** on/off control зберігається; коли backup увімкнений, показується компактний source selector.

Вимкнення external backup не вимикає наявну internal battery. `Device` може залишатися internal-battery-only, як і в погодженому estimator contract.

Assignment rows використовують спільний Device display label і не повторюють зайво `Name`/category text.

## 8. Step 3 — Services & Scenario

### 8.1 Service rows

Кожен `ServiceInstance` у collapsed state представлений одним компактним рядком.

Collapsed row показує:

- service technical/display label;
- коротке summary залежностей;
- target toggle/state;
- `Details`;
- remove action.

Приклад:

```text
Internet · Fiber — Router, ONT/ONU, Internet provider   Target ○   Details
Remote Work — Internet, Laptop                         Target ●   Details
```

Custom Service `Name` є optional і редагується в `Details`.

Редагування template, variant і dependency roles доступне через `Details`. Погоджені обмеження cardinality/category не змінюються.

Target selection розміщується в рядку Service, щоб користувач одночасно бачив сервіс і його роль у scenario. Внутрішня модель `targetServiceIds` не змінюється.

### 8.2 External providers

External providers використовують компактні рядки:

```text
Internet provider · 600 min
```

Provider name залишається required. Availability залишається scenario input у цілих хвилинах відповідно до User-facing MVP v1.

### 8.3 Outage scenario

Outage duration залишається видимим primary scenario field.

Additional loads залишаються відокремленими від mandatory service dependencies і використовують компактні controls. Чинна семантика не змінюється.

## 9. Step 4 — Result dashboard

Result впорядковується за цінністю для прийняття рішення, а не за внутрішніми підсистемами.

### 9.1 Primary target result

Верхня частина першою відповідає:

- який target service;
- status;
- available duration порівняно з outage duration;
- limiting dependency/dependencies.

Приклад:

```text
REMOTE WORK    LIMITED
6 h available / 8 h outage
Limiting: Router, ONT/ONU
```

### 9.2 Causal explanation

Causal paths залишаються видимими, але компактними, наприклад:

```text
Remote Work → Internet → Router
Remote Work → Internet → ONT/ONU
```

Для кожного path не потрібні великі вкладені cards.

### 9.3 Backup summary

Кожен використаний `BackupSource` показує компактне summary:

- display label;
- active load;
- runtime;
- `Edit` action.

### 9.4 Device availability

Device results використовують компактне row/table-like представлення замість окремих великих cards.

Primary value — total availability. External/internal breakdown може показуватися inline, якщо це компактно, або всередині `Details`.

### 9.5 Warnings і recommendations

Порожні warnings/recommendations не повинні займати великі окремі блоки.

Якщо вони є, відображаються як компактні читабельні повідомлення. Чинна семантика warning/recommendation не змінюється.

## 10. Quick edit з Result

Користувач повинен мати змогу порівняти змінений backup/outage scenario без повернення на два кроки назад для типових коригувань.

Підтримувані quick edits:

### BackupSource

Із summary конкретного source:

- `usableCapacityWh`;
- `maxOutputPowerW`.

Quick editor **не змінює**:

- source type;
- source assignments;
- Device configuration;
- service structure.

### Outage

Quick edit підтримує:

- outage duration.

### Recalculation

Quick edits застосовуються через явну дію `Recalculate`. Повторно використовується той самий normalization → estimator → simulation pipeline; альтернативний calculation path не створюється.

## 11. Wizard navigation

Чотирикроковий wizard зберігається:

```text
1 Equipment → 2 Backup → 3 Services & Scenario → 4 Result
```

Верхній stepper стає інтерактивним для прямої навігації назад:

- зі Step 2 можна натиснути Step 1;
- зі Step 3 — Steps 1 і 2;
- зі Step 4 — Steps 1, 2 і 3;
- навігація назад не втрачає введені form data;
- stepper controls доступні з клавіатури.

Forward navigation залишається явною через чинні context actions на кшталт `Continue` і `Run scenario`; UX Polish v1 не вимагає clickable forward jumps у stepper.

Компактна кнопка `Back` зберігається як secondary action, оскільки це знайомий і очевидний navigation affordance. Stepper є швидшою альтернативою, а не єдиним способом повернутися.

Якщо після розрахунку користувач змінює upstream data, попередній Result позначається як stale і не повинен подаватися як актуальний. Для актуалізації потрібен новий `Run scenario`/`Recalculate`.

Primary bottom actions залишаються контекстними: `Continue`, `Run scenario`, `Recalculate`.

## 12. Language switch — UA / EN

UA/EN входить до UX Polish v1 як другий пріоритет після compact redesign.

Вимоги:

- видимий компактний language switch у header застосунку;
- перемикання мови не скидає form data, current step, assignments або current valid result;
- labels, helper text, validation errors, warnings, recommendation text, statuses і action buttons перекладаються узгоджено;
- underlying status values, error codes і recommendation identifiers не змінюються;
- автоматичне locale detection для v1 не потрібне;
- English залишається initial/default language, доки користувач її не змінить;
- persistence між browser sessions для v1 не потрібне.

Нова third-party i18n dependency не додається без окремого погодження користувача. Мінімальна реалізація може використовувати local translation dictionaries і React state/context.

## 13. Validation та error handling

Уся чинна validation behavior залишається authoritative.

UX-зміни повинні забезпечити:

- validation errors залишаються пов'язаними з відповідною entity/field, навіть якщо поле знаходиться всередині `Details`;
- якщо error стосується collapsed detail, UI робить його помітним і може автоматично відкрити або підсвітити affected details area;
- quick edit використовує ті самі validation rules, що й відповідні wizard inputs;
- після validation error не показується synthetic/partial Result, як і в чинній accepted behavior.

## 14. Accessibility та interaction requirements

Мінімально:

- interactive stepper items доступні з клавіатури;
- `Details` controls повідомляють expanded/collapsed state;
- form labels програмно пов'язані з inputs;
- status не передається лише візуальним стилем;
- dialogs/modals, якщо використовуються для quick edit, підтримують keyboard operation і зрозумілий cancel/close path.

Ця ітерація не заявляє formal WCAG conformance без окремого фактичного тестування.

## 15. Testing strategy

Використовувати чинний project test setup і browser verification workflow; не додавати новий testing framework лише для цієї ітерації без окремого погодження.

Обов'язкові категорії coverage:

- unit tests для label generation і duplicate suppression;
- tests optional custom-name normalization;
- tests one-source і multi-source assignment behavior;
- navigation/stale-result state tests;
- quick-edit integration tests через чинний normalization → estimator → engine pipeline;
- language-switch state-preservation tests;
- regression tests, що доводять незмінність accepted estimator/engine outputs;
- manual browser acceptance при 1920 × 1080 для density baseline.

Числові результати й надалі фіксуються лише після фактичного виконання тестів або як контрольні test fixtures, а не як вигадані вимірювання.

## 16. Критерій успіху

UX Polish v1 успішний, якщо побутовий користувач може налаштувати, переглянути, скоригувати й повторно запустити accepted User-facing MVP flow з істотно меншим візуальним шумом і зайвою навігацією, а погоджена семантика симуляції залишається незмінною.

Вимірюваний desktop-критерій: з 5 `Device`, 2 `BackupSource`, 3 `ServiceInstance` і 2 `ExternalProvider` кожен default/collapsed wizard step вміщується у viewport 1920 × 1080 без вертикального page scroll; Step 4 density fixture використовує всі 3 `ServiceInstance` як targets.
