# План реалізації Simulation Engine v1

**Мета:** реалізувати ізольоване, детерміноване ядро симуляції відповідно до `docs/DOMAIN_MODEL.md`, `docs/SIMULATION.md` і `docs/TEST_SCENARIOS.md`, без React UI, backend, persistence та сторонніх бібліотек.

**Архітектура:** simulation engine розміщується в `apps/web/src/simulation/` і не залежить від React. Побудова йде знизу вгору: індексація моделі → validation → DFS calculation → bottleneck/causal paths → публічний `simulate(model, scenario)`. Кожний task має окремий test cycle і після завершення повинен мати зелені тести.

**Технологічна база:** JavaScript ES modules. Для unit tests використовується тільки вбудований `node:test` і `node:assert/strict`; сторонній testing framework не додається. Node використовується лише як локальний runtime для unit tests, не як backend.

**Канонічні джерела:**
- `AGENTS.md`
- `docs/PROJECT.md`
- `docs/DOMAIN_MODEL.md`
- `docs/SIMULATION.md`
- `docs/TEST_SCENARIOS.md`

## Глобальні обмеження

- Не реалізовувати React UI в цьому плані.
- Не додавати backend, API, БД або persistence.
- Не додавати сторонній testing framework або інші dependencies.
- Не розраховувати battery autonomy за W/Wh.
- Не додавати optional/degraded dependencies.
- Не змінювати погоджені правила `T`, статусів, validation errors, bottleneck або causal paths.
- Не повертати часткові results при validation errors.
- Simulation engine не змінює `model` або `scenario`.
- Якщо поточний runtime не підтримує `node:test`, Developer зупиняється й повідомляє користувача; Jest/Vitest або інший framework самостійно не додається.
- Кожне завдання проходить цикл `Developer → tests → Reviewer → corrections → acceptance`.

---

## Файлова структура

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
      ├─ constants.test.js
      ├─ fixtures.js
      ├─ validation.test.js
      ├─ calculation.test.js
      ├─ causes.test.js
      └─ determinism.test.js
```

`apps/web` є майбутнім каталогом React SPA, але в цьому plan package навмисно мінімальний: React/build tooling додаються лише окремим наступним планом.

Відповідальність:

- `constants.js` — `ServiceStatus`, `ValidationCode`.
- `model-index.js` — індекси вузлів за `id` без мутації input.
- `validation.js` — structural validation `Scenario`, reachable-subgraph validation, cycle detection, error deduplication/sorting.
- `calculate.js` — DFS + memoization, `T(Service)`, status, limiting leaf causes, causal paths.
- `simulate.js` — публічний orchestration contract.
- `fixtures.js` — тільки test data builders, без production logic.

Фінальний public contract:

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

## Task 1 — Runtime harness і constants

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/src/simulation/constants.js`
- Create: `apps/web/test/simulation/constants.test.js`

**Produces:** стабільні status/error constants і працюючий test command. Public `simulate()` тут ще не створюється.

### Steps

- [ ] **1. Перевірити runtime без встановлення dependencies**

```bash
node --version
node -e "import('node:test').then(() => console.log('node:test available'))"
```

Очікування: `node:test available`. Інакше зупинитися.

- [ ] **2. Створити `apps/web/package.json`**

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

- [ ] **3. Написати failing constants test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { ServiceStatus, ValidationCode } from '../../src/simulation/constants.js';

test('simulation constants expose the canonical contract', () => {
  assert.deepEqual(ServiceStatus, {
    AVAILABLE: 'Available',
    LIMITED: 'Limited',
    UNAVAILABLE: 'Unavailable',
  });

  assert.deepEqual(Object.values(ValidationCode).sort(), [
    'CYCLE_DETECTED',
    'DEPENDENCY_NOT_FOUND',
    'DUPLICATE_TARGET_SERVICE',
    'EMPTY_TARGET_SERVICES',
    'INVALID_AVAILABILITY_NODE',
    'INVALID_AVAILABILITY_VALUE',
    'INVALID_OUTAGE_DURATION',
    'MISSING_AVAILABILITY',
    'SERVICE_WITHOUT_DEPENDENCIES',
    'TARGET_SERVICE_NOT_FOUND',
  ].sort());
});
```

- [ ] **4. Run і підтвердити FAIL**

```bash
cd apps/web
npm test
```

- [ ] **5. Реалізувати constants**

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

- [ ] **6. Run і підтвердити PASS**

```bash
npm test
```

- [ ] **7. Commit**

```bash
git add apps/web/package.json apps/web/src/simulation/constants.js apps/web/test/simulation/constants.test.js
git commit -m "test: add simulation core test harness"
```

---

## Task 2 — Model index і structural Scenario validation

**Files:**
- Create: `apps/web/src/simulation/model-index.js`
- Create: `apps/web/src/simulation/validation.js`
- Create: `apps/web/test/simulation/fixtures.js`
- Create: `apps/web/test/simulation/validation.test.js`

**Produces:**

```js
createModelIndex(model)
validateScenarioStructure(modelIndex, scenario)
```

`createModelIndex(model)`:

```js
{
  nodesById,
  servicesById,
  devicesById,
  externalProvidersById
}
```

### Steps

- [ ] **1. Створити мінімальні fixtures**

```js
export function createInternetModel() {
  return {
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
}

export function createInternetScenario() {
  return {
    id: 'scenario-1',
    name: '6-hour outage',
    outageDurationMinutes: 360,
    targetServiceIds: ['service-internet'],
    availability: {
      'device-router': 480,
      'device-ont': 120,
      'provider-isp': 4320,
    },
  };
}
```

- [ ] **2. Написати failing structural tests для TS-18…TS-23**

Приклад TS-18:

```js
for (const value of [0, -1, 1.5]) {
  test(`TS-18: rejects outageDurationMinutes=${value}`, () => {
    const index = createModelIndex(createInternetModel());
    const scenario = {
      ...createInternetScenario(),
      outageDurationMinutes: value,
    };

    const errors = validateScenarioStructure(index, scenario);
    assert.ok(errors.some(error =>
      error.code === 'INVALID_OUTAGE_DURATION' &&
      error.field === 'outageDurationMinutes'
    ));
  });
}
```

Приклад TS-22:

```js
test('TS-22: availability key cannot reference Service', () => {
  const index = createModelIndex(createInternetModel());
  const scenario = createInternetScenario();
  scenario.availability['service-internet'] = 10;

  const errors = validateScenarioStructure(index, scenario);
  assert.ok(errors.some(error =>
    error.code === 'INVALID_AVAILABILITY_NODE' &&
    error.nodeId === 'service-internet' &&
    error.field === 'availability'
  ));
});
```

- [ ] **3. Run і підтвердити FAIL**

```bash
npm test -- test/simulation/validation.test.js
```

- [ ] **4. Реалізувати model index**

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

Унікальність `id` тут не перевіряти: це інваріант domain model/editor, а не simulation requirement.

- [ ] **5. Реалізувати `validateScenarioStructure`**

Перевірити весь `Scenario`:
- `outageDurationMinutes` — integer `> 0`;
- `targetServiceIds` — non-empty;
- duplicates у targets;
- target існує і є `Service`;
- кожен `availability` key існує і є `Device | ExternalProvider`;
- кожне availability value — integer `>= 0`.

Кожен error має стабільні `code`, `nodeId?`, `field?`, `message`.

- [ ] **6. Run і підтвердити PASS**

```bash
npm test -- test/simulation/validation.test.js
```

- [ ] **7. Commit**

```bash
git add apps/web/src/simulation apps/web/test/simulation
git commit -m "feat: validate simulation scenario structure"
```

---

## Task 3 — Reachable-subgraph validation і cycles

**Files:**
- Modify: `apps/web/src/simulation/validation.js`
- Modify: `apps/web/test/simulation/validation.test.js`

**Produces:**

```js
validateReachableSubgraph(modelIndex, scenario)
validateSimulationInput(modelIndex, scenario)
```

`validateSimulationInput` об’єднує structural + reachable errors, дедуплікує та сортує їх.

### Steps

- [ ] **1. Написати failing tests для TS-11, TS-12, TS-14, TS-15, TS-16, TS-17, TS-24, TS-25, TS-26 на рівні validator**

TS-11 тут перевіряє не `simulate()`, а саме відсутність errors для недосяжного `Heating`:

```js
test('TS-11: unreachable incomplete Service produces no simulation validation error', () => {
  const model = {
    services: [
      { id: 'service-internet', name: 'Internet', dependencyIds: ['device-router'] },
      { id: 'service-heating', name: 'Heating', dependencyIds: [] },
    ],
    devices: [{ id: 'device-router', name: 'Router' }],
    externalProviders: [],
  };

  const scenario = {
    id: 's1',
    name: 'scenario',
    outageDurationMinutes: 360,
    targetServiceIds: ['service-internet'],
    availability: { 'device-router': 480 },
  };

  const errors = validateSimulationInput(createModelIndex(model), scenario);
  assert.deepEqual(errors, []);
});
```

TS-14:

```js
test('TS-14: missing reachable leaf availability is an error', () => {
  const model = createInternetModel();
  const scenario = createInternetScenario();
  delete scenario.availability['device-ont'];

  const errors = validateSimulationInput(createModelIndex(model), scenario);
  assert.ok(errors.some(error =>
    error.code === 'MISSING_AVAILABILITY' &&
    error.nodeId === 'device-ont' &&
    error.field === 'availability'
  ));
});
```

TS-17:

```js
test('TS-17: reachable cycle has canonical path', () => {
  const model = {
    services: [
      { id: 'service-a', name: 'A', dependencyIds: ['service-b'] },
      { id: 'service-b', name: 'B', dependencyIds: ['service-c'] },
      { id: 'service-c', name: 'C', dependencyIds: ['service-a'] },
    ],
    devices: [],
    externalProviders: [],
  };
  const scenario = {
    id: 's1',
    name: 'cycle',
    outageDurationMinutes: 360,
    targetServiceIds: ['service-a'],
    availability: {},
  };

  const errors = validateSimulationInput(createModelIndex(model), scenario);
  const cycle = errors.find(error => error.code === 'CYCLE_DETECTED');
  assert.deepEqual(cycle.path, ['service-a', 'service-b', 'service-c', 'service-a']);
});
```

- [ ] **2. Run і підтвердити FAIL**

```bash
npm test -- test/simulation/validation.test.js
```

- [ ] **3. Реалізувати reachable DFS validation**

Правила:
- traverse тільки від існуючих target `Service` ids;
- target duplicates обійти один раз;
- reachable `Service` з `dependencyIds=[]` → `SERVICE_WITHOUT_DEPENDENCIES`;
- missing dependency → `DEPENDENCY_NOT_FOUND`, `nodeId=service.id`, `field='dependencyIds'`;
- reachable leaf без ключа в `availability` → `MISSING_AVAILABILITY`;
- invalid, але недосяжні Service/dependency не блокують конкретний run.

Presence перевіряти через `Object.hasOwn(scenario.availability, nodeId)`, щоб `0` не сприймався як missing.

- [ ] **4. Реалізувати cycle detection через DFS stack**

При back-edge:

```js
const startIndex = stack.indexOf(dependencyId);
const rawCycle = [...stack.slice(startIndex), dependencyId];
```

Canonicalization:
- зберігає direction;
- rotate так, щоб перший element був лексикографічно найменшим `serviceId` у циклі;
- той самий id повторюється в кінці.

Не шукати всі possible simple cycles; повертати канонічні шляхи фактично виявлених DFS cycles.

- [ ] **5. Реалізувати deduplication**

Звичайні errors:

```text
code + nodeId + field
```

Cycle errors:

```text
code + canonicalPath
```

- [ ] **6. Реалізувати deterministic error sorting**

Основний ключ:

```js
[
  error.code,
  error.nodeId ?? '',
  error.field ?? '',
  (error.path ?? []).join('\u0000'),
]
```

Порівнювати поелементно детермінованим string comparator.

- [ ] **7. Run і підтвердити PASS**

```bash
npm test -- test/simulation/validation.test.js
```

- [ ] **8. Commit**

```bash
git add apps/web/src/simulation/validation.js apps/web/test/simulation/validation.test.js
git commit -m "feat: validate reachable dependency graph"
```

---

## Task 4 — DFS availability calculation і statuses

**Files:**
- Create: `apps/web/src/simulation/calculate.js`
- Create: `apps/web/test/simulation/calculation.test.js`

**Produces:**

```js
calculateServiceResults(modelIndex, scenario)
```

На цьому task `ServiceResult` уже має фінальну shape, але `limitingDependencyIds`/`causalPaths` ще порожні; Task 5 наповнить їх. Public `simulate()` ще не створюється, тому неповний cause layer не витікає в public API.

### Steps

- [ ] **1. Написати failing internal tests для TS-01, TS-02, TS-03, TS-04, TS-05, TS-06, перевіряючи лише `T`, status і reachable service set**

TS-01:

```js
test('TS-01: T is not clipped to H', () => {
  const model = createInternetModel();
  const scenario = createInternetScenario();
  scenario.availability['device-ont'] = 600;

  const results = calculateServiceResults(createModelIndex(model), scenario);
  const result = results.get('service-internet');

  assert.equal(result.availabilityDurationMinutes, 480);
  assert.equal(result.status, 'Available');
});
```

TS-05 має перевірити `T(Internet)=120`, `T(Remote Work)=120` і наявність обох services у `Map`.

- [ ] **2. Run і підтвердити FAIL**

```bash
npm test -- test/simulation/calculation.test.js
```

- [ ] **3. Реалізувати DFS + memoization**

```js
function calculateService(serviceId, modelIndex, scenario, memo) {
  if (memo.has(serviceId)) {
    return memo.get(serviceId);
  }

  const service = modelIndex.servicesById.get(serviceId);
  const durations = service.dependencyIds.map(dependencyId => {
    if (modelIndex.servicesById.has(dependencyId)) {
      return calculateService(dependencyId, modelIndex, scenario, memo)
        .availabilityDurationMinutes;
    }
    return scenario.availability[dependencyId];
  });

  const availabilityDurationMinutes = Math.min(...durations);
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

`calculateServiceResults` створює новий `Map`/memo для кожного run і викликає `calculateService` у порядку `targetServiceIds`.

- [ ] **4. Run і підтвердити PASS**

```bash
npm test -- test/simulation/calculation.test.js
```

- [ ] **5. Commit**

```bash
git add apps/web/src/simulation/calculate.js apps/web/test/simulation/calculation.test.js
git commit -m "feat: calculate service availability status"
```

---

## Task 5 — Limiting leaves і causal paths

**Files:**
- Modify: `apps/web/src/simulation/calculate.js`
- Create: `apps/web/test/simulation/causes.test.js`

**Acceptance focus:** TS-03, TS-04, TS-05, TS-06, TS-07, TS-08, TS-09.

### Steps

- [ ] **1. Написати failing TS-07 test**

```js
test('TS-07: returns all equal leaf bottlenecks in stable order', () => {
  const model = createInternetModel();
  const scenario = createInternetScenario();
  scenario.availability = {
    'device-router': 120,
    'device-ont': 120,
    'provider-isp': 600,
  };

  const results = calculateServiceResults(createModelIndex(model), scenario);
  const result = results.get('service-internet');

  assert.deepEqual(result.limitingDependencyIds, ['device-ont', 'device-router']);
  assert.deepEqual(result.causalPaths, [
    ['service-internet', 'device-ont'],
    ['service-internet', 'device-router'],
  ]);
});
```

- [ ] **2. Написати failing TS-09 shared-leaf test**

Перевірити один `provider-isp` у `limitingDependencyIds` і два paths:

```js
[
  ['service-remote-work', 'service-internet', 'provider-isp'],
  ['service-remote-work', 'service-vpn', 'provider-isp'],
]
```

- [ ] **3. Run і підтвердити FAIL**

```bash
npm test -- test/simulation/causes.test.js
```

- [ ] **4. Додати cause propagation**

Для `Limited | Unavailable` знайти всі direct dependencies, де:

```js
T(dependency) === T(service)
```

Leaf:

```js
ids.push(dependencyId);
paths.push([serviceId, dependencyId]);
```

Nested `Service`:

```js
const child = memo.get(dependencyId);
ids.push(...child.limitingDependencyIds);
for (const childPath of child.causalPaths) {
  paths.push([serviceId, ...childPath]);
}
```

Для `Available` causes завжди лишаються `[]`.

- [ ] **5. Deduplicate і sort**

```js
const limitingDependencyIds = [...new Set(ids)].sort();

const pathMap = new Map();
for (const path of paths) {
  pathMap.set(path.join('\u0000'), path);
}
const causalPaths = [...pathMap.values()]
  .sort((a, b) => a.join('\u0000').localeCompare(b.join('\u0000')));
```

- [ ] **6. Run causes + calculation regression**

```bash
npm test -- test/simulation/causes.test.js test/simulation/calculation.test.js
```

- [ ] **7. Commit**

```bash
git add apps/web/src/simulation/calculate.js apps/web/test/simulation/causes.test.js
git commit -m "feat: explain limiting service dependencies"
```

---

## Task 6 — Public `simulate()` contract

**Files:**
- Create: `apps/web/src/simulation/simulate.js`
- Modify: `apps/web/test/simulation/calculation.test.js`
- Modify: `apps/web/test/simulation/validation.test.js`

**Produces:** фінальний public API `simulate(model, scenario)`.

### Steps

- [ ] **1. Написати failing Success/Failure contract tests**

Success TS-03:

```js
test('simulate returns full success outcome', () => {
  const scenario = createInternetScenario();
  const outcome = simulate(createInternetModel(), scenario);

  assert.equal(outcome.success, true);
  assert.equal(outcome.targetResults.length, 1);
  assert.equal(outcome.targetResults[0].serviceId, 'service-internet');
  assert.equal(outcome.targetResults[0].availabilityDurationMinutes, 120);
  assert.equal(outcome.serviceResults instanceof Map, true);
  assert.equal('errors' in outcome, false);
});
```

Failure TS-14:

```js
test('simulate returns no partial results on validation failure', () => {
  const scenario = createInternetScenario();
  delete scenario.availability['device-ont'];

  const outcome = simulate(createInternetModel(), scenario);

  assert.equal(outcome.success, false);
  assert.ok(outcome.errors.some(error => error.code === 'MISSING_AVAILABILITY'));
  assert.equal('targetResults' in outcome, false);
  assert.equal('serviceResults' in outcome, false);
});
```

- [ ] **2. Run і підтвердити FAIL**

```bash
npm test
```

- [ ] **3. Реалізувати orchestration**

```js
export function simulate(model, scenario) {
  const modelIndex = createModelIndex(model);
  const errors = validateSimulationInput(modelIndex, scenario);

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const serviceResults = calculateServiceResults(modelIndex, scenario);
  const targetResults = scenario.targetServiceIds.map(id => serviceResults.get(id));

  return {
    success: true,
    targetResults,
    serviceResults,
  };
}
```

- [ ] **4. Run і підтвердити PASS**

```bash
npm test
```

- [ ] **5. Commit**

```bash
git add apps/web/src/simulation/simulate.js apps/web/test/simulation
git commit -m "feat: expose simulation engine outcome"
```

---

## Task 7 — Shared services, determinism, immutability і rerun

**Files:**
- Create: `apps/web/test/simulation/determinism.test.js`
- Modify production files тільки якщо test виявить невідповідність затвердженій spec.

**Acceptance focus:** TS-10, TS-13, TS-27, TS-28, TS-29.

### Steps

- [ ] **1. Написати TS-10 shared Service test**

```js
assert.equal(outcome.serviceResults.has('service-internet'), true);
assert.equal(
  [...outcome.serviceResults.keys()].filter(id => id === 'service-internet').length,
  1,
);
assert.equal(outcome.targetResults[0].serviceId, 'service-remote-work');
assert.equal(outcome.targetResults[1].serviceId, 'service-smart-tv');
```

Перевірити causal path кожного target від самого target.

- [ ] **2. Написати TS-27 dependency-order test**

Дві deep-cloned models відрізняються тільки порядком `dependencyIds`. Порівняти для target:
- `availabilityDurationMinutes`;
- `status`;
- `limitingDependencyIds`;
- `causalPaths`.

- [ ] **3. Написати TS-28 read-only/determinism test**

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

- [ ] **4. Написати TS-29 rerun test**

Run 1: `ONT=120` → `Limited`, `T=120`.

Run 2 з тим самим model object: `ONT=480` → `Available`, `T=480`, empty causes.

- [ ] **5. Run і підтвердити поточний стан**

```bash
npm test -- test/simulation/determinism.test.js
```

Якщо FAIL — виправити тільки відповідну production logic. Memo має бути local per run; module-level result cache заборонений.

- [ ] **6. Run full suite і підтвердити PASS**

```bash
npm test
```

- [ ] **7. Commit**

```bash
git add apps/web
git commit -m "test: verify deterministic simulation reruns"
```

---

## Task 8 — Повне acceptance coverage і Reviewer gate

**Files:**
- Modify: `apps/web/test/simulation/*.test.js`
- Production files змінювати тільки для виправлення реальної невідповідності spec.

### Steps

- [ ] **1. Звірити TS-01…TS-29 з test suite**

Кожен test name має містити `TS-XX`, щоб mapping був searchable.

Мінімальний набір до першої демонстрації повинен бути покритий буквально:

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

Structural variants TS-18/21/22/23 можуть бути parameterized, але кожна передбачена variant має виконуватися.

- [ ] **2. Перевірити validation aggregation**

TS-24 повинен одночасно містити щонайменше:

```text
INVALID_OUTAGE_DURATION
MISSING_AVAILABILITY (device-ont)
```

TS-25 — рівно один `MISSING_AVAILABILITY` для shared `provider-isp`.

TS-26 — errors sorted by `code → nodeId → field → path tie-breaker`.

- [ ] **3. Run full suite**

```bash
cd apps/web
npm test
```

Фактичний PASS/FAIL записати в Developer report. Не переносити очікувані результати з документа як нібито фактичний test result.

- [ ] **4. Перевірити isolation from UI**

```bash
grep -R "from 'react\|from \"react\|window\.\|document\." src/simulation || true
```

Очікування: немає збігів.

- [ ] **5. Перевірити відсутність сторонніх dependencies**

```bash
cat package.json
```

Очікування: simulation-engine plan не додав сторонніх `dependencies` або `devDependencies`.

- [ ] **6. Reviewer gate**

Reviewer читає:
- `AGENTS.md`;
- `docs/DOMAIN_MODEL.md`;
- `docs/SIMULATION.md`;
- `docs/TEST_SCENARIOS.md`;
- цей plan;
- production/tests diff.

Reviewer окремо перевіряє:
- `T = min(mandatory dependencies)`;
- `T` не clip до `H`;
- status boundaries;
- reachable-only graph validation;
- structural validation всього Scenario;
- cycle canonical path і відсутність вимоги enumerate all cycles;
- no partial results;
- equal bottlenecks;
- unique leaf causes + all unique causal paths;
- target order;
- deterministic sorting;
- scenario-specific availability;
- shared Service memoization;
- input immutability;
- відсутність scope creep.

Findings: `Critical / Major / Minor`. Reviewer за замовчуванням код не змінює.

- [ ] **7. Developer виправляє підтверджені findings і повторює full suite**

```bash
npm test
```

- [ ] **8. Завершення task**

Якщо working tree містить виправлення:

```bash
git add apps/web
git commit -m "fix: address simulation engine review findings"
```

Якщо змін немає, порожній commit не створювати.

---

## Acceptance для Simulation Engine v1

Завершення можна заявляти лише після фактичної перевірки:

1. `simulate(model, scenario)` повертає взаємовиключний Success/Failure contract.
2. `T(Service)` рекурсивно дорівнює minimum усіх mandatory dependencies.
3. `T` не обрізається `H`.
4. Status: `Available` при `T >= H`, `Limited` при `0 < T < H`, `Unavailable` при `T = 0`.
5. Розраховуються всі reachable Services; `targetResults` зберігає target order.
6. Leaf nodes не мають окремих result objects.
7. Для Limited/Unavailable повертаються всі рівнозначні кінцеві leaf bottlenecks.
8. Leaf id не дублюється, але всі унікальні causal paths зберігаються.
9. Для Available causes порожні.
10. Structural validation перевіряє весь Scenario; graph validation — reachable subgraph.
11. Validation errors збираються разом, дедуплікуються і стабільно сортуються.
12. Reachable cycle блокує run із canonical path; unreachable cycle не блокує незалежний target.
13. При validation failure часткові results відсутні.
14. Shared Service розраховується через один memoized result на run.
15. Однакові inputs дають детермінований outcome.
16. Зміна `Scenario.availability` змінює outcome без зміни domain entities.
17. Inputs не мутуються.
18. Фактичний `npm test` завершився успішно.
19. Незалежний Reviewer не має відкритих `Critical` або `Major` findings.

## Out of scope після цього плану

Після Simulation Engine v1 ще не реалізовані:

- React UI;
- service/dependency editor;
- scenario form;
- visualization causal paths;
- persistence/local storage;
- Node.js API;
- database;
- external integrations;
- usability testing;
- performance benchmark.

Наступний implementation plan створюється окремо після acceptance цього ядра.