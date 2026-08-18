# План реалізації Simulation Engine v1

**Мета:** реалізувати ізольоване, детерміноване ядро симуляції відповідно до `docs/DOMAIN_MODEL.md`, `docs/SIMULATION.md` і `docs/TEST_SCENARIOS.md`, без React UI, backend, persistence та сторонніх бібліотек.

**Архітектура:** simulation engine розміщується в `apps/web/src/simulation/` і не залежить від React-компонентів. Публічна точка входу — `simulate(model, scenario)`. Перед розрахунком виконується валідація; при помилках повертається лише `Failure`, при валідних даних — повний `Success`. Розрахунок `Service` виконується рекурсивним DFS із memoization.

**Технологічна база:** JavaScript ES modules. Для unit tests використовується тільки вбудований `node:test` і `node:assert/strict`; сторонній testing framework не додається. Це локальний test runner, а не backend.

**Специфікації:**
- `AGENTS.md`
- `docs/PROJECT.md`
- `docs/DOMAIN_MODEL.md`
- `docs/SIMULATION.md`
- `docs/TEST_SCENARIOS.md`

## Глобальні обмеження

- Не реалізовувати React UI в цьому плані.
- Не додавати backend, API, БД або persistence.
- Не додавати сторонній testing framework або інші залежності.
- Не розраховувати battery autonomy за W/Wh.
- Не додавати optional/degraded dependencies.
- Не змінювати погоджені правила `T`, статусів, validation errors, bottleneck або causal paths.
- Не повертати часткові результати при validation errors.
- Simulation engine не має змінювати `model` або `scenario`.
- Якщо поточний Node runtime не підтримує `node:test`, зупинити виконання та повідомити користувача; не встановлювати Jest/Vitest або інший framework без погодження.
- Кожне завдання проходить цикл `Developer → tests → Reviewer → corrections → acceptance`.

---

## Запланована структура файлів

```text
apps/web/
├─ package.json
├─ src/
│  └─ simulation/
│     ├─ constants.js
│     ├─ model-index.js
│     ├─ validation.js
│     ├─ calculate.js
│     └─ simulate.js
└─ test/
   └─ simulation/
      ├─ fixtures.js
      ├─ statuses.test.js
      ├─ validation.test.js
      ├─ nested.test.js
      ├─ causes.test.js
      └─ determinism.test.js
```

Відповідальність:

- `constants.js` — `ServiceStatus`, `ValidationCode`.
- `model-index.js` — read-only індекси вузлів за `id` та визначення типу вузла.
- `validation.js` — структурна validation `Scenario`, reachable-subgraph validation, cycle detection, deduplication і deterministic sorting errors.
- `calculate.js` — DFS + memoization, `T(Service)`, status, limiting leaf causes, causal paths.
- `simulate.js` — orchestration та публічна функція `simulate(model, scenario)`.
- `fixtures.js` — невеликі фабрики контрольних моделей для тестів; не містить production logic.

Публічний контракт першої реалізації:

```js
simulate(model, scenario)
```

Success:

```js
{
  success: true,
  targetResults: ServiceResult[],
  serviceResults: Map<string, ServiceResult>
}
```

Failure:

```js
{
  success: false,
  errors: ValidationError[]
}
```

`ServiceResult`:

```js
{
  serviceId: string,
  availabilityDurationMinutes: number,
  status: 'Available' | 'Limited' | 'Unavailable',
  limitingDependencyIds: string[],
  causalPaths: string[][]
}
```

---

## Task 1 — Test harness, constants і базовий public entry point

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/src/simulation/constants.js`
- Create: `apps/web/src/simulation/simulate.js`
- Create: `apps/web/test/simulation/fixtures.js`
- Create: `apps/web/test/simulation/statuses.test.js`

**Produces:**
- `simulate(model, scenario)` як єдина публічна точка входу;
- константи статусів та validation codes;
- test command `npm test`.

### Steps

- [ ] **1. Перевірити runtime без встановлення dependencies**

```bash
node --version
node -e "import('node:test').then(() => console.log('node:test available'))"
```

Очікування: `node:test available`. Якщо ні — зупинитися.

- [ ] **2. Створити мінімальний `package.json`**

```json
{
  "name": "capstone-household-service-availability-web",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test"
  }
}
```

- [ ] **3. Додати перший failing test для TS-01**

`statuses.test.js` повинен імпортувати тільки `simulate`, `node:test`, `node:assert/strict`.

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { simulate } from '../../src/simulation/simulate.js';

const model = {
  services: [{
    id: 'service-internet',
    name: 'Internet',
    dependencyIds: ['device-router', 'device-ont', 'provider-isp'],
  }],
  devices: [
    { id: 'device-router', name: 'Router' },
    { id: 'device-ont', name: 'ONT/ONU' },
  ],
  externalProviders: [
    { id: 'provider-isp', name: 'Internet Provider' },
  ],
};

const scenario = {
  id: 'scenario-1',
  name: '6-hour outage',
  outageDurationMinutes: 360,
  targetServiceIds: ['service-internet'],
  availability: {
    'device-router': 480,
    'device-ont': 600,
    'provider-isp': 4320,
  },
};

test('TS-01: Available when T > H and T is not clipped to H', () => {
  const outcome = simulate(model, scenario);

  assert.equal(outcome.success, true);
  const result = outcome.serviceResults.get('service-internet');
  assert.equal(result.availabilityDurationMinutes, 480);
  assert.equal(result.status, 'Available');
  assert.deepEqual(result.limitingDependencyIds, []);
  assert.deepEqual(result.causalPaths, []);
});
```

- [ ] **4. Запустити test і підтвердити FAIL**

```bash
cd apps/web
npm test
```

Очікування: FAIL, бо `simulate` ще не реалізований.

- [ ] **5. Додати constants**

```js
export const ServiceStatus = Object.freeze({
  AVAILABLE: 'Available',
  LIMITED: 'Limited',
  UNAVAILABLE: 'Unavailable',
});

export const ValidationCode = Object.freeze({
  INVALID_OUTAGE_DURATION: 'INVALID_OUTAGE_DURATION',
  EMPTY_TARGET_SERVICES: 'EMPTY_TARGET_SERVICES',
  DUPLICATE_TARGET_SERVICE: 'DUPLICATE_TARGET_SERVICE',
  TARGET_SERVICE_NOT_FOUND: 'TARGET_SERVICE_NOT_FOUND',
  INVALID_AVAILABILITY_NODE: 'INVALID_AVAILABILITY_NODE',
  INVALID_AVAILABILITY_VALUE: 'INVALID_AVAILABILITY_VALUE',
  MISSING_AVAILABILITY: 'MISSING_AVAILABILITY',
  SERVICE_WITHOUT_DEPENDENCIES: 'SERVICE_WITHOUT_DEPENDENCIES',
  DEPENDENCY_NOT_FOUND: 'DEPENDENCY_NOT_FOUND',
  CYCLE_DETECTED: 'CYCLE_DETECTED',
});
```

- [ ] **6. Додати лише мінімальний orchestration skeleton**

`simulate.js` на цьому кроці може імпортувати майбутні модулі, але не має містити React/UI logic. Якщо повний TS-01 ще не може пройти без calculation module, перейти до Task 4 після commit test harness; не підміняти production logic hard-coded результатом.

- [ ] **7. Commit test harness**

```bash
git add apps/web/package.json apps/web/src/simulation/constants.js apps/web/src/simulation/simulate.js apps/web/test/simulation

git commit -m "test: add simulation engine test harness"
```

---

## Task 2 — Model index і структурна validation `Scenario`

**Files:**
- Create: `apps/web/src/simulation/model-index.js`
- Create: `apps/web/src/simulation/validation.js`
- Modify: `apps/web/src/simulation/simulate.js`
- Modify: `apps/web/test/simulation/validation.test.js`

**Interfaces:**

```js
createModelIndex(model)
validateSimulationInput(modelIndex, scenario)
```

`createModelIndex(model)` повертає read-only у сенсі використання набір `Map`:

```js
{
  nodesById,
  servicesById,
  devicesById,
  externalProvidersById
}
```

### Steps

- [ ] **1. Написати failing tests для TS-18, TS-19, TS-20, TS-21, TS-22, TS-23**

Приклад для duration:

```js
for (const value of [0, -1, 1.5]) {
  test(`TS-18: rejects outageDurationMinutes=${value}`, () => {
    const outcome = simulate(model, {
      ...validScenario,
      outageDurationMinutes: value,
    });

    assert.equal(outcome.success, false);
    assert.equal(outcome.errors[0].code, 'INVALID_OUTAGE_DURATION');
    assert.equal(outcome.errors[0].field, 'outageDurationMinutes');
    assert.equal('targetResults' in outcome, false);
    assert.equal('serviceResults' in outcome, false);
  });
}
```

Приклад для invalid availability node:

```js
test('TS-22: rejects availability key that points to Service', () => {
  const outcome = simulate(model, {
    ...validScenario,
    availability: {
      ...validScenario.availability,
      'service-internet': 10,
    },
  });

  assert.equal(outcome.success, false);
  assert.ok(outcome.errors.some(error =>
    error.code === 'INVALID_AVAILABILITY_NODE' &&
    error.nodeId === 'service-internet' &&
    error.field === 'availability'
  ));
});
```

- [ ] **2. Run tests and confirm FAIL**

```bash
npm test -- test/simulation/validation.test.js
```

- [ ] **3. Реалізувати model index без мутації input**

Ключова логіка:

```js
export function createModelIndex(model) {
  const servicesById = new Map(model.services.map(node => [node.id, node]));
  const devicesById = new Map(model.devices.map(node => [node.id, node]));
  const externalProvidersById = new Map(
    model.externalProviders.map(node => [node.id, node]),
  );
  const nodesById = new Map([
    ...servicesById,
    ...devicesById,
    ...externalProvidersById,
  ]);

  return {
    nodesById,
    servicesById,
    devicesById,
    externalProvidersById,
  };
}
```

Унікальність `id` тут не перевіряти — це інваріант model editor згідно зі spec.

- [ ] **4. Реалізувати структурну validation**

Перевірки:
- positive integer `outageDurationMinutes`;
- non-empty `targetServiceIds`;
- duplicate target ids;
- target exists and is `Service`;
- кожен `availability` key існує й є leaf node;
- кожне availability value — integer `>= 0`.

Validation error має містити стабільний `message`, але tests повинні спиратися передусім на `code`, `nodeId`, `field`.

- [ ] **5. Підключити validation в `simulate`**

```js
export function simulate(model, scenario) {
  const modelIndex = createModelIndex(model);
  const errors = validateSimulationInput(modelIndex, scenario);

  if (errors.length > 0) {
    return { success: false, errors };
  }

  // calculation додається в наступних tasks
}
```

- [ ] **6. Run validation tests**

```bash
npm test -- test/simulation/validation.test.js
```

Очікування: structural validation tests PASS.

- [ ] **7. Commit**

```bash
git add apps/web/src/simulation apps/web/test/simulation/validation.test.js
git commit -m "feat: validate simulation scenario structure"
```

---

## Task 3 — Reachable-subgraph validation і cycle detection

**Files:**
- Modify: `apps/web/src/simulation/validation.js`
- Modify: `apps/web/test/simulation/validation.test.js`

**Acceptance scenarios:** TS-11, TS-12, TS-14, TS-15, TS-16, TS-17, TS-24, TS-25, TS-26.

### Steps

- [ ] **1. Додати failing tests для reachable-only validation**

TS-11:

```js
test('TS-11: unreachable incomplete Service does not block simulation', () => {
  const model = {
    services: [
      { id: 'service-internet', name: 'Internet', dependencyIds: ['device-router'] },
      { id: 'service-heating', name: 'Heating', dependencyIds: [] },
    ],
    devices: [{ id: 'device-router', name: 'Router' }],
    externalProviders: [],
  };

  const outcome = simulate(model, {
    id: 's1',
    name: 'scenario',
    outageDurationMinutes: 360,
    targetServiceIds: ['service-internet'],
    availability: { 'device-router': 480 },
  });

  assert.equal(outcome.success, true);
  assert.equal(outcome.serviceResults.has('service-heating'), false);
});
```

TS-14:

```js
test('TS-14: missing reachable leaf availability is an error', () => {
  const outcome = simulate(internetModel, {
    ...internetScenario,
    availability: { 'device-router': 480 },
  });

  assert.equal(outcome.success, false);
  assert.ok(outcome.errors.some(error =>
    error.code === 'MISSING_AVAILABILITY' &&
    error.nodeId === 'device-ont' &&
    error.field === 'availability'
  ));
});
```

TS-17:

```js
test('TS-17: reachable cycle returns canonical path', () => {
  const model = {
    services: [
      { id: 'service-a', name: 'A', dependencyIds: ['service-b'] },
      { id: 'service-b', name: 'B', dependencyIds: ['service-c'] },
      { id: 'service-c', name: 'C', dependencyIds: ['service-a'] },
    ],
    devices: [],
    externalProviders: [],
  };

  const outcome = simulate(model, {
    id: 's1',
    name: 'cycle',
    outageDurationMinutes: 360,
    targetServiceIds: ['service-a'],
    availability: {},
  });

  assert.equal(outcome.success, false);
  const cycle = outcome.errors.find(error => error.code === 'CYCLE_DETECTED');
  assert.deepEqual(cycle.path, ['service-a', 'service-b', 'service-c', 'service-a']);
});
```

- [ ] **2. Run tests and confirm FAIL**

```bash
npm test -- test/simulation/validation.test.js
```

- [ ] **3. Реалізувати DFS validation only for valid targets**

Правила обходу:
- traverse тільки від target ids, які вже визначені як існуючі `Service`;
- `Service` з `dependencyIds=[]` → `SERVICE_WITHOUT_DEPENDENCIES`;
- missing dependency → `DEPENDENCY_NOT_FOUND` з `nodeId=service.id`, `field='dependencyIds'`;
- reachable leaf без availability → `MISSING_AVAILABILITY`;
- недосяжні invalid services не перевіряти в simulation phase.

- [ ] **4. Реалізувати cycle detection через `visiting` stack**

При back-edge:

```js
const startIndex = stack.indexOf(dependencyId);
const rawCycle = [...stack.slice(startIndex), dependencyId];
```

Canonicalization зберігає напрямок, але rotate-ить цикл так, щоб першим був лексикографічно найменший `serviceId`. Останній id повторює перший.

Не шукати всі можливі simple cycles; фіксувати цикли, реально знайдені DFS.

- [ ] **5. Реалізувати error deduplication**

Для звичайних errors:

```text
code + nodeId + field
```

Для `CYCLE_DETECTED`:

```text
code + canonical path
```

- [ ] **6. Реалізувати deterministic sorting errors**

Comparator:

```js
const errorKey = error => [
  error.code,
  error.nodeId ?? '',
  error.field ?? '',
];
```

Порівнювати поелементно через `localeCompare` або еквівалентний детермінований string comparator. `path` не використовується як первинне sort key, якщо `code/nodeId/field` уже відрізняють errors; для повної стабільності при однакових трьох полях додати serialized `path ?? []` як останній tie-breaker.

- [ ] **7. Run validation acceptance subset**

```bash
npm test -- test/simulation/validation.test.js
```

Очікування: TS-11/12/14/15/16/17/24/25/26 PASS.

- [ ] **8. Commit**

```bash
git add apps/web/src/simulation/validation.js apps/web/test/simulation/validation.test.js
git commit -m "feat: validate reachable service dependency graph"
```

---

## Task 4 — Base availability calculation і statuses

**Files:**
- Create: `apps/web/src/simulation/calculate.js`
- Modify: `apps/web/src/simulation/simulate.js`
- Modify: `apps/web/test/simulation/statuses.test.js`
- Create/Modify: `apps/web/test/simulation/nested.test.js`

**Acceptance scenarios:** TS-01, TS-02, TS-03, TS-04, TS-05, TS-06.

**Core interface:**

```js
calculateServices(modelIndex, scenario)
```

Returns:

```js
Map<string, ServiceResult>
```

### Steps

- [ ] **1. Додати failing tests для status boundaries**

Покрити:
- `T > H` → Available;
- `T = H` → Available;
- `0 < T < H` → Limited;
- `T = 0` → Unavailable.

- [ ] **2. Додати failing TS-05 nested Service**

Перевірити окремо результат `service-internet` і `service-remote-work` у `serviceResults`.

- [ ] **3. Run tests and confirm FAIL**

```bash
npm test -- test/simulation/statuses.test.js test/simulation/nested.test.js
```

- [ ] **4. Реалізувати DFS + memoization**

Концептуальний код:

```js
function calculateService(serviceId, modelIndex, scenario, memo) {
  if (memo.has(serviceId)) {
    return memo.get(serviceId);
  }

  const service = modelIndex.servicesById.get(serviceId);
  const dependencyDurations = service.dependencyIds.map(dependencyId => {
    if (modelIndex.servicesById.has(dependencyId)) {
      return calculateService(dependencyId, modelIndex, scenario, memo)
        .availabilityDurationMinutes;
    }

    return scenario.availability[dependencyId];
  });

  const availabilityDurationMinutes = Math.min(...dependencyDurations);
  const status = availabilityDurationMinutes >= scenario.outageDurationMinutes
    ? ServiceStatus.AVAILABLE
    : availabilityDurationMinutes === 0
      ? ServiceStatus.UNAVAILABLE
      : ServiceStatus.LIMITED;

  const result = {
    serviceId,
    availabilityDurationMinutes,
    status,
    limitingDependencyIds: [],
    causalPaths: [],
  };

  memo.set(serviceId, result);
  return result;
}
```

Цей snippet покриває лише duration/status. Причини додаються Task 5.

- [ ] **5. `simulate` формує targetResults у target order**

```js
const serviceResults = calculateServices(modelIndex, scenario);
const targetResults = scenario.targetServiceIds.map(id => serviceResults.get(id));

return {
  success: true,
  targetResults,
  serviceResults,
};
```

- [ ] **6. Run tests**

```bash
npm test -- test/simulation/statuses.test.js test/simulation/nested.test.js
```

- [ ] **7. Commit**

```bash
git add apps/web/src/simulation apps/web/test/simulation
git commit -m "feat: calculate service availability and status"
```

---

## Task 5 — Limiting dependencies, equal bottlenecks і causal paths

**Files:**
- Modify: `apps/web/src/simulation/calculate.js`
- Create/Modify: `apps/web/test/simulation/causes.test.js`
- Modify: `apps/web/test/simulation/nested.test.js`

**Acceptance scenarios:** TS-03, TS-04, TS-05, TS-06, TS-07, TS-08, TS-09.

### Steps

- [ ] **1. Додати failing TS-07 test**

```js
test('TS-07: returns all equal leaf bottlenecks in deterministic order', () => {
  const outcome = simulate(model, {
    ...scenario,
    availability: {
      'device-router': 120,
      'device-ont': 120,
      'provider-isp': 600,
    },
  });

  const result = outcome.serviceResults.get('service-internet');
  assert.deepEqual(result.limitingDependencyIds, ['device-ont', 'device-router']);
  assert.deepEqual(result.causalPaths, [
    ['service-internet', 'device-ont'],
    ['service-internet', 'device-router'],
  ]);
});
```

- [ ] **2. Додати failing TS-09 shared-leaf test**

Очікувати один `provider-isp` у `limitingDependencyIds`, але два різні causal paths.

- [ ] **3. Run tests and confirm FAIL**

```bash
npm test -- test/simulation/causes.test.js test/simulation/nested.test.js
```

- [ ] **4. Для `Limited/Unavailable` пройти всі direct dependencies з мінімальним T**

Правило:

```js
T(dependency) === T(service)
```

Для leaf:

```js
limitingDependencyIds.push(dependencyId);
causalPaths.push([serviceId, dependencyId]);
```

Для nested Service:
- взяти child `ServiceResult`;
- додати його `limitingDependencyIds`;
- до кожного child path prepend `serviceId`.

```js
for (const path of childResult.causalPaths) {
  causalPaths.push([serviceId, ...path]);
}
```

- [ ] **5. Для `Available` завжди лишати порожні causes**

Навіть якщо одна dependency математично має minimum.

- [ ] **6. Deduplicate leaf ids і paths**

```js
const limitingDependencyIds = [...new Set(ids)].sort();

const uniquePaths = new Map();
for (const path of paths) {
  uniquePaths.set(path.join('\u0000'), path);
}
const causalPaths = [...uniquePaths.values()]
  .sort((a, b) => a.join('\u0000').localeCompare(b.join('\u0000')));
```

- [ ] **7. Run cause tests**

```bash
npm test -- test/simulation/causes.test.js test/simulation/nested.test.js
```

Очікування: TS-03/04/05/06/07/08/09 PASS.

- [ ] **8. Commit**

```bash
git add apps/web/src/simulation/calculate.js apps/web/test/simulation
git commit -m "feat: explain limiting service dependencies"
```

---

## Task 6 — Shared services, determinism, read-only behavior і rerun

**Files:**
- Modify: `apps/web/src/simulation/calculate.js`
- Modify: `apps/web/src/simulation/simulate.js`
- Create/Modify: `apps/web/test/simulation/determinism.test.js`
- Modify: `apps/web/test/simulation/nested.test.js`

**Acceptance scenarios:** TS-10, TS-13, TS-27, TS-28, TS-29.

### Steps

- [ ] **1. Додати TS-10 shared nested Service test**

Перевірити:

```js
assert.equal(outcome.serviceResults.has('service-internet'), true);
assert.equal(
  [...outcome.serviceResults.keys()].filter(id => id === 'service-internet').length,
  1,
);
assert.equal(outcome.targetResults[0].serviceId, 'service-remote-work');
assert.equal(outcome.targetResults[1].serviceId, 'service-smart-tv');
```

- [ ] **2. Додати TS-27 dependency-order test**

Створити дві deep-cloned моделі, які відрізняються лише порядком `dependencyIds`, та перевірити однакові semantic result fields.

- [ ] **3. Додати TS-28 immutability/determinism test**

```js
const modelBefore = JSON.parse(JSON.stringify(model));
const scenarioBefore = JSON.parse(JSON.stringify(scenario));

const first = simulate(model, scenario);
const second = simulate(model, scenario);

assert.deepEqual(model, modelBefore);
assert.deepEqual(scenario, scenarioBefore);
assert.deepEqual(first.targetResults, second.targetResults);
assert.deepEqual(
  [...first.serviceResults.entries()],
  [...second.serviceResults.entries()],
);
```

- [ ] **4. Додати TS-29 rerun test**

Перший scenario: ONT=120 → `Limited`, T=120.
Другий scenario: ONT=480 → `Available`, T=480.
Model object не змінюється між запусками.

- [ ] **5. Run tests and confirm FAIL where behavior is incomplete**

```bash
npm test -- test/simulation/determinism.test.js test/simulation/nested.test.js
```

- [ ] **6. Виправити тільки необхідну production logic**

Переконатися, що memoization map створюється на один `simulate` run і не зберігається глобально між сценаріями.

Не кешувати `availability` у `Service` entity або module-level state.

- [ ] **7. Run tests**

```bash
npm test -- test/simulation/determinism.test.js test/simulation/nested.test.js
```

- [ ] **8. Commit**

```bash
git add apps/web/src/simulation apps/web/test/simulation
git commit -m "test: verify deterministic simulation reruns"
```

---

## Task 7 — Повне acceptance coverage першої версії

**Files:**
- Modify: `apps/web/test/simulation/*.test.js`
- Modify production files тільки якщо test виявляє невідповідність затвердженій spec.

### Steps

- [ ] **1. Звірити кожен TS-01…TS-29 з test case**

У test name використовувати prefix `TS-XX`, щоб mapping був searchable:

```js
test('TS-24: collects multiple independent validation errors', () => {
  // exact controlled input from docs/TEST_SCENARIOS.md
});
```

Не створювати “результат тестування” в документації вручну — test outcome має походити з фактичного запуску.

- [ ] **2. Переконатися, що мінімальний demo acceptance set повністю присутній**

Обов’язкові:

```text
TS-01
TS-03
TS-04
TS-05
TS-07
TS-09
TS-11
TS-14
TS-15
TS-17
TS-24
TS-27
TS-29
```

- [ ] **3. Run full suite**

```bash
cd apps/web
npm test
```

Фактичний PASS/FAIL зафіксувати в Developer report. Не писати PASS, якщо command не запускався.

- [ ] **4. Перевірити, що production code не імпортує React або browser APIs**

```bash
grep -R "from 'react\|from \"react\|window\.\|document\." src/simulation || true
```

Очікування: немає збігів.

- [ ] **5. Перевірити відсутність сторонніх dependencies**

```bash
cat package.json
```

Очікування: немає `dependencies` / `devDependencies`, доданих лише для simulation engine.

- [ ] **6. Reviewer gate**

Reviewer читає:
- `AGENTS.md`;
- `docs/DOMAIN_MODEL.md`;
- `docs/SIMULATION.md`;
- `docs/TEST_SCENARIOS.md`;
- цей plan;
- production/tests diff.

Reviewer перевіряє findings у форматі `Critical / Major / Minor`, окремо:
- формулу `T`;
- status boundaries;
- reachable-only validation;
- cycles;
- no partial results;
- equal bottlenecks;
- unique leaf causes + all unique causal paths;
- deterministic ordering;
- scenario-specific availability;
- input immutability;
- відсутність scope creep.

- [ ] **7. Developer виправляє тільки підтверджені findings**

Після corrections повторити:

```bash
npm test
```

- [ ] **8. Final implementation commit**

```bash
git add apps/web
git commit -m "feat: complete simulation engine v1"
```

Якщо попередні task commits уже містять усі зміни й working tree clean, окремий порожній commit не створювати.

---

## Acceptance для завершення плану

Simulation Engine v1 можна вважати реалізованим лише якщо фактично підтверджено:

1. `simulate(model, scenario)` повертає взаємовиключний Success/Failure contract.
2. `T(Service)` обчислюється рекурсивно як minimum усіх mandatory dependencies.
3. `T` не обрізається `H`.
4. Status boundaries відповідають `Available / Limited / Unavailable`.
5. Усі reachable `Service` обчислюються, targets зберігають `targetServiceIds` order.
6. `Device`/`ExternalProvider` не мають окремих result objects.
7. Для Limited/Unavailable повертаються всі рівнозначні final leaf bottlenecks.
8. Один leaf не дублюється у `limitingDependencyIds`, але всі унікальні causal paths зберігаються.
9. Для Available causes порожні.
10. Structural validation перевіряє весь `Scenario`; graph validation — тільки reachable subgraph.
11. Усі validation errors збираються, дедуплікуються та стабільно сортуються.
12. Reachable cycle блокує run і має canonical path; unreachable cycle не блокує незалежний target.
13. При validation failure часткові results відсутні.
14. Повторний run з тими самими inputs детермінований.
15. Зміна `Scenario.availability` змінює result без зміни domain entities.
16. Inputs не мутуються.
17. Фактичний `npm test` завершився успішно.
18. Незалежний Reviewer не має відкритих `Critical` або `Major` findings.

## Out of scope після завершення цього плану

Після Simulation Engine v1 ще **не** вважаються реалізованими:

- React UI;
- service/dependency editor;
- scenario form;
- visualization causal path;
- persistence/local storage;
- Node.js API;
- database;
- external integrations;
- usability testing;
- performance benchmark.

Наступний implementation plan має створюватися окремо після review та acceptance цього ядра.