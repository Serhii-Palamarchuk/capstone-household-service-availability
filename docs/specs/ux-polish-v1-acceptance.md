# UX Polish v1 — критерії приймання

Статус: **Прийнято — 2026-08-20**  
Дата: 2026-08-20

Цей документ перевіряє `docs/specs/ux-polish-v1.md`. Він додає лише UX acceptance; погоджена семантика розрахунків User-facing MVP v1 не змінюється.

## UX-01 — Desktop density baseline

**Дано** CSS viewport `1920 × 1080`  
**І** валідну конфігурацію з 5 `Device`, 2 `BackupSource`, 3 `ServiceInstance` і 2 `ExternalProvider`  
**І** для Step 4 усі 3 валідні `ServiceInstance` вибрані як target services  
**Коли** користувач відкриває кожен wizard step у default/collapsed state  
**Тоді** Step 1, Step 2, Step 3 і Step 4 не мають вертикального page scroll.

Відкриті `Details`, dialogs/modals, dropdown menus, довгі списки validation messages і надзвичайно довгі custom names не входять до вимоги no-scroll.

## UX-02 — Компактні рядки Equipment

**Дано** кілька `Device`  
**Коли** відображається Step 1  
**Тоді** кожен `Device` подається насамперед одним компактним рядком, а не великою окремою card  
**І** category, power та battery summary читаються без відкриття details  
**І** optional custom `Name` не подається як головне required field.

## UX-03 — Optional Device name

**Дано** `Device` з валідними category і power та порожнім custom `Name`  
**Коли** форма нормалізується і scenario валідний  
**Тоді** порожній custom `Name` не створює required-name validation error  
**І** resulting domain entity все одно отримує детермінований непорожній internal name/fallback.

## UX-04 — Device technical label

**Дано** Router з `powerW = 15` і без custom name  
**Тоді** user-visible label еквівалентний:

```text
Router · 15 W
```

**Дано** той самий `Device` з custom name `Bedroom router`  
**Тоді** label еквівалентний:

```text
Bedroom router (Router · 15 W)
```

## UX-05 — Приховування дублювання та розрізнення labels

**Дано** custom Device name, що після trim/case normalization дорівнює category або generated technical label  
**Тоді** UI не показує дубльований текст на кшталт `Router (Router · 15 W)`, якщо custom value не додає інформації.

**Дано** два неназвані `Device`, які інакше мають однаковий visible label  
**Тоді** UI додає компактний детермінований disambiguator, наприклад `#1` / `#2`.

## UX-06 — Compact BackupSource rows і optional name

**Дано** `BackupSource` з type `Power station`, `usableCapacityWh = 1000`, `maxOutputPowerW = 1200` і без custom name  
**Тоді** technical label еквівалентний:

```text
Power station · 1000 Wh · 1200 W max
```

**І** порожній custom `Name` не блокує normalization/simulation  
**І** детермінований непорожній domain fallback залишається доступним.

**Дано** custom name `EcoFlow`  
**Тоді** user-visible label еквівалентний:

```text
EcoFlow (Power station · 1000 Wh · 1200 W max)
```

## UX-07 — Спрощення assignment для одного source

**Дано** рівно один `BackupSource`  
**Коли** відображається Step 2  
**Тоді** кожен `Device` використовує простий external-backup on/off control  
**І** redundant source dropdown не потрібен  
**І** увімкнення backup призначає єдиний source  
**І** вимкнення backup видаляє external assignment, не видаляючи internal battery.

## UX-08 — Assignment для кількох sources

**Дано** два або більше `BackupSource`  
**Коли** external backup увімкнений для `Device`  
**Тоді** доступний компактний source selector  
**І** `Device` як і раніше може мати максимум одне external source у scenario.

**Коли** external backup вимкнений  
**Тоді** external assignment для цього `Device` не включається.

## UX-09 — Збереження чинної backup validation semantics

**Дано** використаний `BackupSource` без `maxOutputPowerW`  
**Коли** scenario запускається  
**Тоді** calculation дозволений і чинний missing-max-output warning усе ще повертається.

**Дано** known max output, нижчий за active assigned load  
**Тоді** чинний overload validation error усе ще блокує simulation.

## UX-10 — Compact Service rows

**Дано** кілька `ServiceInstance`  
**Коли** Step 3 показано в collapsed state  
**Тоді** кожен service насамперед представлений одним compact row  
**І** row показує template/variant identity, dependency summary, target state і `Details` action  
**І** усі required role editors не розгорнуті за замовчуванням.

## UX-11 — Optional Service name

**Дано** валідні template/variant/bindings `ServiceInstance` і порожній custom `Name`  
**Коли** форма нормалізується  
**Тоді** порожній custom `Name` не створює required-name validation error  
**І** `ServiceInstance` усе одно отримує детермінований непорожній internal fallback.

Приклади default labels:

```text
Internet · Fiber
Remote Work
```

## UX-12 — Explicit naming для ExternalProvider зберігається

**Дано** `ExternalProvider`  
**Тоді** provider name залишається явним required user-facing field  
**Тому що** поточна модель не має незалежного provider category/type, з якого можна безпечно сформувати рівноцінний label.

## UX-13 — Target selection інтегровано в service row

**Дано** `ServiceInstance` на Step 3  
**Коли** користувач змінює його target state  
**Тоді** `scenario.targetServiceIds` відображає зміну  
**І** underlying target/mandatory-load semantics не змінюються.

## UX-14 — Progressive details

**Дано** collapsed `Device`, `BackupSource` або Service row  
**Коли** користувач активує `Details`  
**Тоді** secondary/editing fields стають доступними  
**І** control доступно повідомляє expanded/collapsed state  
**І** згортання row не втрачає введені values.

## UX-15 — Validation у collapsed details залишається помітною

**Дано** invalid field, який зараз знаходиться всередині collapsed `Details`  
**Коли** запускається validation  
**Тоді** користувач може визначити, яка entity/field невалідна  
**І** affected details area відкривається або чітко позначається  
**І** error не приховується через compact layout.

## UX-16 — Ієрархія інформації Result

**Дано** successful scenario  
**Коли** показується Step 4  
**Тоді** target service status, availability порівняно з outage duration і limiting dependency/dependencies відображаються перед subsystem details  
**І** causal paths залишаються читабельними  
**І** результати `BackupSource` та `Device` використовують compact summaries замість однієї великої card на кожен item.

## UX-17 — Порожні warnings/recommendations не створюють великих блоків

**Дано** zero warnings або zero recommendations  
**Тоді** відповідний empty state не резервує великий card/block вертикального простору.

**Дано** warnings або recommendations існують  
**Тоді** їхня чинна семантика й зміст тексту залишаються доступними в компактному читабельному представленні.

## UX-18 — Quick edit BackupSource

**Дано** successful Result із принаймні одним використаним `BackupSource`  
**Коли** користувач обирає `Edit` для конкретного source  
**Тоді** користувач може змінити лише:

- `usableCapacityWh`;
- `maxOutputPowerW`.

**І** source type, assignments, `Device` та service structure не редагуються в цьому quick editor.

**Коли** користувач підтверджує `Recalculate`  
**Тоді** стандартний normalization → estimator → simulation pipeline запускається повторно.

## UX-19 — Quick edit outage duration

**Дано** successful Result  
**Коли** користувач змінює outage duration через quick edit і обирає `Recalculate`  
**Тоді** scenario перераховується через стандартний pipeline  
**І** новий Result використовує змінену outage duration  
**І** full page reload не потрібен.

## UX-20 — Quick-edit validation

**Дано** invalid quick-edit capacity, max output або outage duration  
**Коли** користувач намагається виконати recalculation  
**Тоді** застосовуються ті самі validation rules, що й у wizard  
**І** synthetic або partial Result не показується як актуальний.

## UX-21 — Інтерактивний backward stepper

**Дано** користувач на Step 2  
**Тоді** Step 1 у stepper інтерактивний.

**Дано** користувач на Step 3  
**Тоді** Step 1 і Step 2 у stepper інтерактивні.

**Дано** користувач на Step 4  
**Тоді** Step 1, Step 2 і Step 3 у stepper інтерактивні.

**Коли** користувач натискає earlier completed step  
**Тоді** wizard переходить до нього без втрати form data.

**І** forward progression продовжується через `Continue` / `Run scenario`; clickable forward jumps не потрібні.

## UX-22 — Back button зберігається

**Дано** Step 2, Step 3 або Step 4  
**Тоді** компактна secondary дія `Back` залишається доступною разом зі stepper navigation.

## UX-23 — Keyboard accessibility stepper

**Дано** keyboard-only navigation  
**Тоді** interactive earlier stepper items можна сфокусувати та активувати без pointing device.

## UX-24 — Захист від stale Result

**Дано** successful Result уже існує  
**Коли** користувач повертається на попередній step і змінює upstream scenario/configuration data  
**Тоді** previous Result позначається stale/not-current  
**І** не подається як актуальний calculated result  
**І** потрібен новий `Run scenario` або `Recalculate`.

**Дано** користувач повернувся назад і нічого не змінив  
**Тоді** раніше валідні введені data зберігаються.

## UX-25 — UA/EN switch зберігає state

**Дано** користувач ввів `Device`, `BackupSource`, assignments, services і scenario data  
**Коли** користувач перемикається між English та Ukrainian  
**Тоді** current form values, assignments, current step і current valid Result зберігаються  
**І** page reload/reset не потрібен.

## UX-26 — Translation coverage

**Коли** вибрано UA  
**Тоді** visible application labels, helper text, action buttons, validation messages, warnings, recommendations і displayed statuses мають український UI text.

**Коли** вибрано EN  
**Тоді** еквівалентний content подається англійською.

**І** underlying status values, validation/error codes і recommendation identifiers не змінюються.

Technical identifiers, що використовуються лише для debugging/internal diagnostics, не повинні замінювати user-facing message.

## UX-27 — Межі реалізації language switch

**Тоді** UX Polish v1 не додає нову third-party i18n dependency без окремого погодження користувача  
**І** English залишається initial/default language для v1  
**І** locale autodetection та cross-session language persistence не потрібні.

## UX-28 — Regression protection симуляції

Використовуючи чинні accepted controlled fixtures, включно з AC-12:

**Коли** змінюються лише UX presentation/navigation  
**Тоді** numerical outputs Availability Estimator і Simulation Engine залишаються незмінними для ідентичних normalized inputs.

Для accepted AC-12 fixture це включає раніше зафіксовані контрольні очікування, зокрема Home backup `80 W / 360 min` і Remote Work `Limited / 360 min`; це test-fixture values, а не реальні вимірювання автономності.

## UX-29 — Без розширення domain scope

Реалізація UX Polish v1 не приймається, якщо для неї потрібно змінити:

- формули Availability Estimator;
- status/dependency logic Simulation Engine;
- семантику service-template roles;
- recommendation rules;
- accepted domain scope.

Будь-яка така потреба оформлюється як окреме design decision, а не мовчки додається до UX polish.

## UX-30 — Evidence browser verification

Перед merge/deploy фактично зафіксувати verification через чинний project workflow:

- результат full existing test suite;
- результат production build;
- focused UX tests, додані для цієї ітерації;
- manual `1920 × 1080` density walkthrough усіх чотирьох steps із fixture UX-01;
- navigation + stale-result walkthrough;
- quick-edit rerun walkthrough;
- UA/EN state-preservation walkthrough;
- browser console observations, якщо вони перевірялися.

Не повідомляти про pass, performance figure або usability result, якщо вони фактично не були спостережені або протестовані.
