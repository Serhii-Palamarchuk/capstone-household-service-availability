# User-facing MVP v1 — acceptance scenarios

Status: **Accepted — 2026-08-19**.

Основа: `docs/specs/user-facing-mvp-v1.md`. Існуючі `TS-01…TS-29` у `docs/TEST_SCENARIOS.md` залишаються acceptance-контрактом `Simulation Engine v1` і не дублюються тут.

Усі числа нижче — контрольні test fixtures, не результати реальних вимірювань.

```mermaid
flowchart LR
    A[Estimator rules] --> B[Template validation]
    B --> C[Scenario composition]
    C --> D[Simulation Engine v1]
    D --> E[Result + explanation]
    E --> F[UI walkthrough]
```

## AC-01 — один external source → один Device

```text
BackupSource = 100 Wh
Device = 33 W
```

Очікування:

`availability = floor(100 / 33 × 60) = 181 min`.

Перевіряється округлення вниз до цілої хвилини.

## AC-02 — shared BackupSource

```text
BackupSource = 600 Wh
Router = 20 W
ONT = 10 W
Laptop = 70 W
```

Усі три Device активні та призначені одному source.

Очікування:

```text
totalPowerW = 100 W
sourceRuntime = 360 min
Router availability = 360 min
ONT availability = 360 min
Laptop availability = 360 min
```

## AC-03 — тільки internal battery

```text
Laptop = 60 W
InternalBattery = 120 Wh
External source = none
```

Очікування: `availability = 120 min`.

## AC-04 — external + internal, `ExternalFirst`

```text
Laptop = 60 W
External source = 300 Wh
InternalBattery = 120 Wh
```

Очікування:

```text
external runtime = 300 min
internal runtime = 120 min
Laptop availability = 420 min
```

Internal battery не розряджається паралельно із зовнішнім source.

## AC-05 — Device без backup

Device без external source та internal battery є валідним.

Очікування: `availability = 0 min`.

## AC-06 — validation / warning

Перевірити окремі cases:

- `powerW <= 0` → validation error;
- `usableCapacityWh <= 0` → validation error;
- Device призначений двом external sources → validation error;
- `totalPowerW > maxOutputPowerW` → validation error, simulation не запускається;
- `maxOutputPowerW` відсутній → calculation дозволений + warning.

## AC-07 — mandatory vs additional loads

Target: `Internet / Fiber`.

```text
BackupSource = 600 Wh
Router = 20 W
ONT = 10 W
Provider availability = 2000 min
H = 600 min
```

Required Router і ONT автоматично входять до active load і не можуть бути виключені з target scenario.

Без additional load:

```text
total = 30 W
source runtime = 1200 min
Internet T = 1200 min
status = Available
```

Додати `TV = 70 W` як additional load на той самий source:

```text
total = 100 W
source runtime = 360 min
Internet T = 360 min
status = Limited
```

TV споживає energy, але не стає dependency `Internet`.

## AC-08 — template validation

`Remote Work` з:

```text
Internet = 1
Laptop = 1
Monitor = 2
```

→ valid.

Окремо:

- `Refrigerator` у `Work Devices` → validation error;
- відсутня mandatory role template → validation error;
- role `[1..N]` без жодного binding → validation error.

## AC-09 — predefined catalog smoke

Кожен погоджений variant повинен створювати валідний `ServiceInstance` при коректних bindings:

- Internet / Fiber;
- Internet / Router-only;
- Remote Work;
- Refrigeration;
- Heating / Gas Boiler;
- Heating / Electric;
- Heating / Centralized;
- Water Supply / Centralized;
- Water Supply / Private Well;
- Water Supply / Pumped System.

Довільний custom graph поза templates у MVP не підтримується.

## AC-10 — multiple instances + shared Service

Створити:

```text
Internet — Home
Remote Work — A -> Internet — Home
Remote Work — B -> Internet — Home
```

Очікування:

- конфігурація valid;
- обидва Remote Work використовують той самий Service instance `Internet — Home`;
- shared Service не дублюється як окремі незалежні залежності у simulation model.

## AC-11 — ExternalProvider

Для required `ExternalProvider` availability задається вручну в Scenario.

- значення задане → valid;
- значення відсутнє → validation error;
- Estimator не намагається автоматично прогнозувати provider availability.

## AC-12 — end-to-end `Remote Work`

```text
H = 480 min

Internet / Fiber:
  Router = 10 W
  ONT = 10 W
  Provider availability = 600 min

Remote Work:
  Internet
  Laptop = 60 W
  Laptop internal battery = 120 Wh

BackupSource:
  usableCapacity = 480 Wh
  active devices = Router + ONT + Laptop
```

Очікування Estimator:

```text
total external load = 80 W
source runtime = 360 min
Router = 360 min
ONT = 360 min
Laptop internal runtime = 120 min
Laptop availability = 480 min
```

Очікування `Simulation Engine v1`:

```text
T(Internet) = 360 min
T(Remote Work) = 360 min
status(Remote Work) = Limited
limiting causes = Router + ONT
causal paths:
Remote Work -> Internet -> Router
Remote Work -> Internet -> ONT
```

Engine отримує сформований `Scenario.availability`; його алгоритм не змінюється.

## AC-13 — детерміновані рекомендації

Перевірити:

1. required Device має `0 min` через відсутність backup → дозволена рекомендація додати резервне живлення;
2. limiting cause = `ExternalProvider` → пояснити, що збільшення локальної battery capacity саме цю причину не усуває;
3. твердження, що відключення additional load збільшує runtime, показувати лише після фактичного альтернативного перерахунку без цього load.

Автоматичної оптимізації немає.

## AC-14 — functional UI walkthrough

Користувач повинен пройти flow:

```text
Equipment
→ Backup
→ Services & Scenario
→ Result
```

Acceptance:

- Device вводиться через category + `powerW` + optional internal battery;
- BackupSource — через usable capacity + optional max output;
- для Device користувач не вводить готові `availabilityMinutes`;
- target service визначає mandatory loads;
- additional loads можна додати окремо;
- після run показуються source runtime, Device availability, service availability/status, limiting cause/path та relevant warnings/recommendations;
- повторний run після зміни input не потребує reload сторінки.

## Traceability

```text
Estimator & energy rules  -> AC-01…AC-07
Templates & composition   -> AC-08…AC-11
End-to-end integration    -> AC-12
Recommendations           -> AC-13
User flow                 -> AC-14
```

## Acceptance rule

Цей документ фіксує очікувану поведінку. Фактичні `passed/failed`, час виконання та інші результати вносяться лише після реального запуску тестів.