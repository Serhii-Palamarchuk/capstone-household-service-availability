# Контрольні та acceptance-сценарії

## 1. Призначення документа

Цей документ визначає контрольні сценарії для перевірки предметної моделі та simulation engine MVP.

Сценарії використовуються як спільна основа для:

- реалізації simulation engine;
- unit та functional testing;
- незалежного code review;
- трасування `Requirement → Implementation → Test → Result`;
- подальшого опису фактично виконаного тестування в пояснювальній записці.

Усі числові значення нижче є **контрольними тестовими даними**, а очікувані результати логічно виведені із затверджених правил `docs/DOMAIN_MODEL.md` та `docs/SIMULATION.md`. Вони не є результатами реальних вимірювань або експериментів.

## 2. Загальні правила перевірки

Для кожного сценарію потрібно перевіряти не лише статус, а весь релевантний контракт результату:

- `success`;
- `availabilityDurationMinutes`;
- `status`;
- `limitingDependencyIds`;
- `causalPaths`;
- склад `serviceResults`;
- порядок `targetResults`;
- validation errors та їх порядок, якщо сценарій невалідний.

Для успішної симуляції validation errors не повертаються. Для неуспішної симуляції `targetResults` і `serviceResults` не повертаються.

## 3. Базові сценарії статусів

### TS-01 — `Available`, коли `T > H`

Модель:

```text
Internet
├─ Router = 480
├─ ONT/ONU = 600
└─ Internet Provider = 4320
```

Scenario:

```text
H = 360
Target = Internet
```

Очікування:

```text
T(Internet) = 480
status = Available
limitingDependencyIds = []
causalPaths = []
```

Додатково перевірити, що `T` не обрізається до `H`: у результаті залишається `480`, а не `360`.

### TS-02 — `Available`, коли `T = H`

```text
H = 360
Router = 360
ONT/ONU = 600
Internet Provider = 4320
```

Очікування:

```text
T(Internet) = 360
status = Available
limitingDependencyIds = []
causalPaths = []
```

Граничне значення `T = H` належить до `Available`.

### TS-03 — `Limited`

```text
H = 360
Router = 480
ONT/ONU = 120
Internet Provider = 4320
```

Очікування:

```text
T(Internet) = 120
status = Limited
limitingDependencyIds = [device-ont]
causalPaths = [service-internet -> device-ont]
```

### TS-04 — `Unavailable`

```text
H = 360
Router = 480
ONT/ONU = 0
Internet Provider = 4320
```

Очікування:

```text
T(Internet) = 0
status = Unavailable
limitingDependencyIds = [device-ont]
causalPaths = [service-internet -> device-ont]
```

## 4. Вкладені сервіси

### TS-05 — рекурсивний розрахунок вкладеного `Service`

Модель:

```text
Remote Work
├─ Internet
│  ├─ Router = 480
│  ├─ ONT/ONU = 120
│  └─ Internet Provider = 600
└─ Laptop = 360
```

Scenario:

```text
H = 480
Target = Remote Work
```

Очікування:

```text
T(Internet) = 120
T(Remote Work) = 120
```

Для `Internet`:

```text
status = Limited
limitingDependencyIds = [device-ont]
causalPaths = [service-internet -> device-ont]
```

Для `Remote Work`:

```text
status = Limited
limitingDependencyIds = [device-ont]
causalPaths = [service-remote-work -> service-internet -> device-ont]
```

`serviceResults` має містити і `service-internet`, і `service-remote-work`.

### TS-06 — безпосередня залежність обмежує батьківський сервіс раніше за вкладений сервіс

```text
H = 480

Internet = 300
Laptop = 120
Remote Work -> Internet + Laptop
```

Очікування:

```text
T(Remote Work) = 120
status = Limited
limitingDependencyIds = [device-laptop]
causalPaths = [service-remote-work -> device-laptop]
```

Внутрішній bottleneck `Internet` не повинен потрапляти до результату `Remote Work`, якщо `T(Internet) > T(Remote Work)`.

## 5. Рівнозначні bottleneck

### TS-07 — дві безпосередні рівнозначні причини

```text
H = 360
Router = 120
ONT/ONU = 120
Internet Provider = 600
```

Очікування:

```text
T(Internet) = 120
status = Limited
limitingDependencyIds = [device-ont, device-router]
```

Порядок `limitingDependencyIds` визначається лексикографічно за `id`, а не порядком `dependencyIds`.

Очікувані causal paths:

```text
service-internet -> device-ont
service-internet -> device-router
```

### TS-08 — рівнозначні причини на різних рівнях графа

```text
H = 360

Remote Work
├─ Internet = 120
│  ├─ Router = 480
│  └─ ONT/ONU = 120
└─ Laptop = 120
```

Очікування для `Remote Work`:

```text
T = 120
status = Limited
limitingDependencyIds = [device-laptop, device-ont]  // після сортування за id
```

Causal paths мають містити обидві гілки:

```text
Remote Work -> Internet -> ONT/ONU
Remote Work -> Laptop
```

Жоден довільний tie-breaker не використовується.

## 6. Спільні залежності та кілька шляхів

### TS-09 — одна leaf-причина досягається двома шляхами

Модель:

```text
Remote Work
├─ Internet
│  └─ Internet Provider
└─ VPN
   └─ Internet Provider
```

```text
H = 360
Internet Provider = 0
```

Очікування:

```text
T(Remote Work) = 0
status = Unavailable
limitingDependencyIds = [provider-isp]
```

При цьому `causalPaths` містить два унікальні шляхи:

```text
service-remote-work -> service-internet -> provider-isp
service-remote-work -> service-vpn -> provider-isp
```

`provider-isp` у `limitingDependencyIds` не дублюється.

### TS-10 — shared nested `Service` обчислюється один раз логічно та повторно використовується

Модель:

```text
Remote Work -> Internet + Laptop
Smart TV    -> Internet + TV
```

Scenario:

```text
Target = [Remote Work, Smart TV]
```

Очікування:

- `Internet` присутній у `serviceResults` один раз за своїм `serviceId`;
- обидва target-сервіси отримують коректний результат через той самий розрахований `Internet`;
- `targetResults` повертаються у тому самому порядку, що й `targetServiceIds`.

Тест не повинен покладатися на конкретну внутрішню реалізацію кешу; перевіряється зовнішньо спостережуваний результат та відсутність дублювання `Internet` у `serviceResults`.

## 7. Область поточної симуляції

### TS-11 — незавершений недосяжний сервіс не блокує запуск

Модель:

```text
Internet -> Router
Heating  -> []
```

Scenario:

```text
Target = Internet
Router = 480
H = 360
```

Очікування:

- `success = true`;
- `Heating` не входить до `serviceResults`;
- `SERVICE_WITHOUT_DEPENDENCIES` для `Heating` не повертається.

### TS-12 — цикл у недосяжній частині моделі не блокує незалежний target

Модель:

```text
Internet -> Router

Heating -> Water
Water   -> Heating
```

Scenario:

```text
Target = Internet
Router = 480
H = 360
```

Очікування:

- `success = true`;
- цикл `Heating <-> Water` не впливає на результат `Internet`;
- cycle error не повертається для цього запуску.

Наявність такого циклу все одно є некоректною конфігурацією редактора і повинна бути виправлена поза межами цієї конкретної симуляції.

### TS-13 — валідне зайве `availability` дозволене

Scenario для `Internet` додатково містить:

```text
availability[device-refrigerator] = 300
```

`device-refrigerator` існує, але не досягається від `Internet`.

Очікування:

- `success = true`;
- значення ігнорується розрахунком `Internet`;
- результат `Internet` не змінюється.

## 8. Validation errors

### TS-14 — відсутнє `availability`

Модель:

```text
Internet -> Router + ONT/ONU
```

Scenario містить значення лише для `Router`.

Очікування:

```text
success = false
error.code = MISSING_AVAILABILITY
error.nodeId = device-ont
error.field = availability
```

`targetResults` і `serviceResults` не повертаються.

### TS-15 — порожній досяжний `Service`

```text
Internet.dependencyIds = []
Target = Internet
```

Очікування:

```text
success = false
error.code = SERVICE_WITHOUT_DEPENDENCIES
error.nodeId = service-internet
error.field = dependencyIds
```

### TS-16 — залежність посилається на неіснуючий вузол

```text
Internet.dependencyIds = [device-router, missing-node]
```

Очікування:

```text
DEPENDENCY_NOT_FOUND
nodeId = service-internet
field = dependencyIds
```

Симуляція не повертає частковий результат навіть якщо `device-router` валідний.

### TS-17 — цикл у досяжному підграфі

Модель:

```text
Service A -> Service B
Service B -> Service C
Service C -> Service A
```

Target:

```text
Service A
```

Очікування:

```text
success = false
code = CYCLE_DETECTED
field = dependencyIds
```

`path`:

- починається з лексикографічно найменшого `serviceId` у фактично виявленому циклі;
- завершується тим самим `serviceId`;
- описує замкнений спрямований шлях.

Не вимагається перерахування всіх можливих простих циклів графа.

### TS-18 — невалідна тривалість сценарію

Перевірити щонайменше:

```text
H = 0
H = -1
H = 1.5
```

Очікування для кожного випадку:

```text
INVALID_OUTAGE_DURATION
field = outageDurationMinutes
```

### TS-19 — порожній список target-сервісів

```text
targetServiceIds = []
```

Очікування:

```text
EMPTY_TARGET_SERVICES
field = targetServiceIds
```

### TS-20 — дубльований target

```text
targetServiceIds = [service-internet, service-internet]
```

Очікування:

```text
DUPLICATE_TARGET_SERVICE
nodeId = service-internet
field = targetServiceIds
```

### TS-21 — target не існує або не є `Service`

Перевірити два варіанти:

1. `targetServiceIds` містить відсутній `id`;
2. `targetServiceIds` містить `id` існуючого `Device`.

В обох випадках очікується:

```text
TARGET_SERVICE_NOT_FOUND
field = targetServiceIds
```

### TS-22 — невалідний ключ `availability`

Перевірити:

1. ключ посилається на відсутній вузол;
2. ключ посилається на існуючий `Service`.

Очікування:

```text
INVALID_AVAILABILITY_NODE
field = availability
```

Ця помилка повертається навіть якщо некоректний ключ не потрібен поточному target-сервісу.

### TS-23 — невалідне значення `availability`

Перевірити щонайменше:

```text
-1
1.5
```

Очікування:

```text
INVALID_AVAILABILITY_VALUE
field = availability
```

`0` є валідним значенням і означає, що leaf-вузол недоступний від початку сценарію.

## 9. Збір і порядок помилок

### TS-24 — кілька незалежних validation errors повертаються разом

Приклад:

```text
H = 0
Internet -> Router + ONT/ONU
availability задано лише для Router
```

Очікування включає щонайменше:

```text
INVALID_OUTAGE_DURATION
MISSING_AVAILABILITY для ONT/ONU
```

Simulation engine не повинен зупинитися після першої помилки.

### TS-25 — одна shared-проблема не дублюється через кілька шляхів

Модель:

```text
Remote Work
├─ Internet -> Provider
└─ VPN      -> Provider
```

Для `Provider` немає `availability`.

Очікування:

- один `MISSING_AVAILABILITY` для `provider-isp`;
- помилка не дублюється через два шляхи.

### TS-26 — детермінований порядок validation errors

Створити сценарій із кількома помилками різних кодів і вузлів.

Очікування:

`errors` відсортовані лексикографічно:

1. `code`;
2. `nodeId`;
3. `field`.

Повторний запуск з тими самими вхідними даними повертає той самий порядок.

## 10. Детермінізм результату

### TS-27 — порядок `dependencyIds` не змінює семантичний результат

Запустити еквівалентні моделі:

```text
Internet.dependencies = [Router, ONT, Provider]
```

та

```text
Internet.dependencies = [Provider, Router, ONT]
```

за однакових `availability`.

Очікування:

- однакове `T`;
- однаковий `status`;
- однакові відсортовані `limitingDependencyIds`;
- однакові відсортовані `causalPaths`.

### TS-28 — повторний запуск однакових вхідних даних є детермінованим

Для незмінної моделі та незмінного `Scenario` два послідовні запуски повинні повертати семантично однаковий `SimulationOutcome`.

Simulation engine не повинен змінювати вхідну модель, `Scenario`, `availability` або порядок `dependencyIds`.

## 11. Зміна сценарію та повторний запуск

### TS-29 — зміна leaf availability змінює результат без зміни предметної моделі

Модель незмінна:

```text
Internet -> Router + ONT/ONU + Provider
```

Перший запуск:

```text
H = 360
Router = 480
ONT/ONU = 120
Provider = 4320
```

Очікується `Limited`, `T = 120`.

Другий запуск для того самого графа:

```text
Router = 480
ONT/ONU = 480
Provider = 4320
```

Очікується:

```text
T = 480
status = Available
limitingDependencyIds = []
causalPaths = []
```

Цей сценарій перевіряє, що availability належить `Scenario`, а не постійній сутності `Device`.

## 12. Мінімальний acceptance-набір для першої реалізації

До першої демонстрації simulation engine обов’язково повинні проходити щонайменше:

```text
TS-01  Available
TS-03  Limited
TS-04  Unavailable
TS-05  nested Service
TS-07  equal bottlenecks
TS-09  shared leaf + multiple causal paths
TS-11  unreachable incomplete Service
TS-14  missing availability
TS-15  Service without dependencies
TS-17  reachable cycle
TS-24  collect multiple errors
TS-27  deterministic dependency order
TS-29  rerun with changed Scenario
```

Решта сценаріїв також є частиною acceptance-специфікації MVP, але цей набір покриває головний наскрізний ризик першої реалізації: правильний детермінований розрахунок доступності та причин обмеження.

## 13. Фіксація фактичних результатів

Цей документ описує **очікувану поведінку**, а не результати виконання тестів.

Після появи реалізації фактичні результати потрібно отримати запуском тестів. У пояснювальну записку можна переносити лише реально отримані результати з датою/версією реалізації та способом перевірки.
