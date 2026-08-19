# React Demo v1 Implementation Plan

> **For agentic workers:** виконуй цей план task-by-task через чинний `docs/specs/autonomous-agent-workflow.md`; кожен Task проходить окремий Developer → fresh Reviewer gate.

**Goal:** Побудувати мінімальний React SPA для контрольного сценарію `Internet`, який використовує прийнятий `Simulation Engine v1`, дозволяє змінювати outage/availability inputs і показує duration, status, limiting dependencies та causal paths.

**Architecture:** React залишається тонким UI-шаром. Окремий `src/demo/internet-demo.js` перетворює введені години у canonical model/scenario inputs, а всі правила calculation/status/bottleneck залишаються в `src/simulation/`. UI викликає публічний `simulate(model, scenario)` і лише відображає його outcome.

**Tech Stack:** React, ReactDOM, Vite, plain CSS, existing `node:test` + `node:assert/strict`. Новий UI testing framework не додається.

**Spec:** `docs/specs/react-demo-v1.md`

## Global Constraints

- Не змінювати public contract `Simulation Engine v1`, якщо не виявлена канонічна суперечність; у такому випадку ескалювати, а не виправляти мовчки.
- Backend, API, DB, persistence, accounts, external integrations, UI framework і deploy не входять у цей plan.
- Не дублювати в React алгоритм `min`, status classification або bottleneck traversal.
- Усі durations передаються engine як цілі хвилини.
- `outageDurationMinutes > 0`; leaf availability `>= 0`.
- Поточний simulation regression suite має залишатися green.
- Для Windows PowerShell, якщо `npm.ps1` блокується execution policy, використовувати відомий workaround `cmd.exe /d /c ...` без зміни package scripts.

---

### Task 1: React/Vite application shell

**Files:**
- Modify: `apps/web/package.json`
- Create: `apps/web/package-lock.json`
- Create: `apps/web/index.html`
- Create: `apps/web/src/main.jsx`
- Create: `apps/web/src/App.jsx`
- Create: `apps/web/src/styles.css`

**Interfaces:**
- Consumes: existing `apps/web/src/simulation/` only indirectly; Task 1 does not integrate engine yet.
- Produces: runnable React/Vite shell and scripts `dev`, `build`, `preview`, while preserving `test`.

- [ ] **Step 1: Verify clean baseline**

```bash
git status --short
cd apps/web
cmd.exe /d /c npm test
```

Expected: worktree has no unexpected changes; existing suite PASS.

- [ ] **Step 2: Install only the approved UI/build dependencies**

Run from `apps/web`:

```bash
npm install react react-dom
npm install --save-dev vite
```

Do not add router, state library, UI kit, testing framework or Vite React plugin in this task.

- [ ] **Step 3: Update package scripts**

`apps/web/package.json` must contain at least:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "node --test"
  }
}
```

Keep `name`, `private` and `type: "module"`.

- [ ] **Step 4: Create minimal Vite entry document**

`apps/web/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Household service availability demo" />
    <title>Household Service Availability</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Create React entry point**

`apps/web/src/main.jsx`:

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 6: Create initial App shell**

`apps/web/src/App.jsx`:

```jsx
import React from 'react';

export function App() {
  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">Power outage scenario</p>
        <h1>Household Service Availability</h1>
        <p>
          Estimate whether Internet remains available by evaluating all of
          its required dependencies.
        </p>
      </header>
    </main>
  );
}
```

- [ ] **Step 7: Add only base styles needed for a readable shell**

`apps/web/src/styles.css` must define readable defaults for `body`, `.app-shell`, `.hero`, `.eyebrow`; do not add a CSS framework or elaborate design system.

- [ ] **Step 8: Verify regression suite and production build**

```bash
cmd.exe /d /c npm test
cmd.exe /d /c npm run build
```

Expected: tests PASS; Vite production build exits `0` and creates `dist/`.

- [ ] **Step 9: Commit**

```bash
git add apps/web/package.json apps/web/package-lock.json apps/web/index.html apps/web/src/main.jsx apps/web/src/App.jsx apps/web/src/styles.css
git commit -m "feat: scaffold React demo application"
```

Update `docs/STATUS.md`, hand off Task 1 to fresh Reviewer, and do not start Task 2 until accepted.

---

### Task 2: Internet demo input adapter and engine integration tests

**Files:**
- Create: `apps/web/src/demo/internet-demo.js`
- Create: `apps/web/test/demo/internet-demo.test.js`

**Interfaces:**
- Consumes: `simulate(model, scenario)` from `apps/web/src/simulation/simulate.js` in tests only.
- Produces:
  - `INTERNET_DEMO_MODEL`
  - `DEFAULT_INTERNET_DEMO_INPUTS`
  - `DEMO_NODE_NAMES`
  - `createInternetScenarioFromHours(inputs)`

Use this input shape:

```js
{
  outageHours,
  routerHours,
  ontHours,
  providerHours,
}
```

Values come from HTML inputs as strings.

Return contract:

```js
// valid conversion
{
  success: true,
  scenario: {
    id: 'scenario-internet-demo',
    name: 'Internet outage demo',
    outageDurationMinutes: 360,
    targetServiceIds: ['service-internet'],
    availability: {
      'device-router': 480,
      'device-ont': 120,
      'provider-isp': 4320,
    },
  },
}

// invalid conversion
{
  success: false,
  errors: [
    { field: 'outageHours', message: 'Outage duration must be greater than 0 hours.' }
  ],
}
```

- [ ] **Step 1: Write failing adapter/integration tests**

`apps/web/test/demo/internet-demo.test.js` must use `node:test` and `node:assert/strict` and cover at least:

```js
test('default Internet demo converts hours to canonical minutes', ...)
test('default Internet demo produces Limited 2 h with ONT/ONU as cause', ...)
test('changing ONT/ONU to 8 h produces Available 8 h with empty causes', ...)
test('zero leaf availability is valid and can produce Unavailable', ...)
test('zero outage is rejected before simulate()', ...)
test('fractional hours that do not map to whole minutes are rejected', ...)
```

For the default outcome assert exactly:

```js
result.success === true
result.targetResults[0].availabilityDurationMinutes === 120
result.targetResults[0].status === 'Limited'
result.targetResults[0].limitingDependencyIds === ['device-ont']
result.targetResults[0].causalPaths === [['service-internet', 'device-ont']]
```

For ONT/ONU `8 h` assert:

```js
availabilityDurationMinutes === 480
status === 'Available'
limitingDependencyIds === []
causalPaths === []
```

For zero leaf availability set `ontHours: '0'` and assert `Unavailable`, `T=0`.

Use `outageHours: '0.001'` as a conversion failure because `0.001 * 60` is not an integer number of minutes.

- [ ] **Step 2: Run tests and confirm RED**

```bash
cmd.exe /d /c "npm test -- test/demo/internet-demo.test.js"
```

Expected: FAIL because `src/demo/internet-demo.js` does not exist yet.

- [ ] **Step 3: Implement fixed demo model and display names**

`INTERNET_DEMO_MODEL` must use exactly:

```js
{
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
}
```

`DEMO_NODE_NAMES` must map all four node IDs to the names above.

`DEFAULT_INTERNET_DEMO_INPUTS`:

```js
{
  outageHours: '6',
  routerHours: '8',
  ontHours: '2',
  providerHours: '72',
}
```

- [ ] **Step 4: Implement hour-to-minute conversion without simulation rules**

For each field:

1. reject empty strings;
2. convert with `Number(value)`;
3. require `Number.isFinite(hours)`;
4. require outage `> 0` and leaves `>= 0`;
5. calculate `minutes = hours * 60`;
6. require `Number.isInteger(minutes)`;
7. return field-level human-readable conversion errors if invalid.

Do not classify service status or calculate dependency minima here.

- [ ] **Step 5: Run targeted and full tests**

```bash
cmd.exe /d /c "npm test -- test/demo/internet-demo.test.js"
cmd.exe /d /c npm test
```

Expected: adapter tests PASS and full suite remains green.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/demo/internet-demo.js apps/web/test/demo/internet-demo.test.js
git commit -m "feat: add Internet demo scenario adapter"
```

Update `docs/STATUS.md`, hand off Task 2 to fresh Reviewer, and do not start Task 3 until accepted.

---

### Task 3: Interactive scenario form and simulation execution

**Files:**
- Create: `apps/web/src/components/ScenarioForm.jsx`
- Modify: `apps/web/src/App.jsx`
- Modify: `apps/web/src/styles.css`

**Interfaces:**
- Consumes:
  - `simulate(model, scenario)`
  - `INTERNET_DEMO_MODEL`
  - `DEFAULT_INTERNET_DEMO_INPUTS`
  - `createInternetScenarioFromHours(inputs)`
- Produces: interactive form that runs the engine repeatedly without reload and stores the latest outcome in React state.

- [ ] **Step 1: Implement `ScenarioForm` as a controlled form**

Props:

```js
ScenarioForm({ values, onChange, onSubmit })
```

Render exactly four numeric inputs with labels:

```text
Outage duration (hours)
Router availability (hours)
ONT/ONU availability (hours)
Internet Provider availability (hours)
```

Input attributes:

```jsx
type="number"
min="0"
step="any"
```

The outage input may still momentarily contain `0`; final validity is handled by the adapter on submit.

Render submit button text:

```text
Run simulation
```

- [ ] **Step 2: Integrate form state into `App`**

`App` must initialize state from `DEFAULT_INTERNET_DEMO_INPUTS` and keep input values as strings.

On submit:

1. call `createInternetScenarioFromHours(values)`;
2. if adapter failure, store conversion errors and do not call `simulate()`;
3. if adapter success, call `simulate(INTERNET_DEMO_MODEL, scenario)`;
4. store engine outcome;
5. clear previous conversion errors on successful conversion.

Do not implement `min`, status comparisons or causal traversal in React.

- [ ] **Step 3: Show input-conversion errors near the form**

Render an accessible error block when conversion errors exist:

```jsx
<div role="alert" className="input-errors">
  <h2>Check scenario values</h2>
  <ul>...</ul>
</div>
```

Each message comes from the adapter result.

- [ ] **Step 4: Add layout styles only**

Extend `styles.css` for `.scenario-card`, `.scenario-grid`, labels, inputs, button, `.input-errors`. Keep responsive single-column behavior on narrow screens. Do not add third-party styles.

- [ ] **Step 5: Verify integration by regression tests and build**

```bash
cmd.exe /d /c npm test
cmd.exe /d /c npm run build
```

Expected: full suite PASS; build exit `0`.

Reviewer must additionally inspect that `App.jsx` calls the adapter + `simulate()` and contains no copied simulation algorithm.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/components/ScenarioForm.jsx apps/web/src/App.jsx apps/web/src/styles.css
git commit -m "feat: add interactive outage scenario form"
```

Update `docs/STATUS.md`, hand off Task 3 to fresh Reviewer, and do not start Task 4 until accepted.

---

### Task 4: Result presentation and demo acceptance gate

**Files:**
- Create: `apps/web/src/demo/result-view.js`
- Create: `apps/web/test/demo/result-view.test.js`
- Create: `apps/web/src/components/SimulationResult.jsx`
- Modify: `apps/web/src/App.jsx`
- Modify: `apps/web/src/styles.css`

**Interfaces:**
- Consumes:
  - engine `SimulationOutcome`
  - `DEMO_NODE_NAMES`
- Produces:
  - `createResultView(outcome)` — UI-only transformation, no simulation decisions;
  - `SimulationResult({ outcome })`.

`createResultView()` success shape:

```js
{
  kind: 'success',
  serviceName: 'Internet',
  availabilityText: '2 h',
  status: 'Limited',
  limitingDependencyNames: ['ONT/ONU'],
  causalPathTexts: ['Internet → ONT/ONU'],
}
```

Available result has empty cause arrays.

Failure shape:

```js
{
  kind: 'failure',
  errors: [
    { code: '...', message: '...' }
  ],
}
```

- [ ] **Step 1: Write failing presenter tests**

Cover at least:

```js
test('Limited outcome is mapped to 2 h, ONT/ONU and its causal path', ...)
test('Available outcome keeps cause lists empty', ...)
test('engine failure preserves validation code and message', ...)
test('duration formatter displays exact whole and fractional hours from integer minutes', ...)
```

Formatting rule:

```text
120 min -> "2 h"
90 min -> "1.5 h"
0 min -> "0 h"
```

Presenter may format/match IDs to names; it must not recalculate status or choose bottlenecks.

- [ ] **Step 2: Run presenter tests and confirm RED**

```bash
cmd.exe /d /c "npm test -- test/demo/result-view.test.js"
```

Expected: FAIL because `result-view.js` does not exist.

- [ ] **Step 3: Implement `createResultView(outcome)`**

For success:

- use `outcome.targetResults[0]`;
- format `availabilityDurationMinutes / 60` only for display;
- copy `status` from engine result unchanged;
- map `limitingDependencyIds` through `DEMO_NODE_NAMES`;
- map every `causalPaths` ID sequence through names and join with ` → `.

For failure copy `code` and `message` from engine errors.

- [ ] **Step 4: Implement `SimulationResult`**

Before first run, `App` does not render a result card.

For success render:

```text
Service
Availability
Status
```

When causes exist render `Limiting dependency`/`Limiting dependencies` and `Causal path`/`Causal paths`.

For `Available`, render explanatory text:

```text
Internet remains available for the full outage scenario.
```

Do not render an invented bottleneck for `Available`.

For engine failure render an alert containing every `code` and `message`.

- [ ] **Step 5: Complete result styling**

Add `.result-card`, status badge styles, cause/path list styles and responsive spacing. Keep plain CSS and readable contrast; do not add animation or design-system complexity.

- [ ] **Step 6: Run targeted tests, full regression suite and build**

```bash
cmd.exe /d /c "npm test -- test/demo/internet-demo.test.js test/demo/result-view.test.js"
cmd.exe /d /c npm test
cmd.exe /d /c npm run build
```

Expected: all exit `0`.

- [ ] **Step 7: Perform the final deterministic demo probes through pure adapters + engine**

The automated demo tests must establish all three behaviors:

```text
Default: 6/8/2/72 h -> T=2 h, Limited, ONT/ONU, Internet → ONT/ONU
Changed ONT: 6/8/8/72 h -> T=8 h, Available, no causes
Zero ONT: 6/8/0/72 h -> T=0 h, Unavailable, ONT/ONU
```

Do not describe these as empirical household measurements; they are controlled test fixtures.

- [ ] **Step 8: Reviewer final source/scope audit**

Reviewer verifies:

```text
- React UI imports/uses simulate();
- no min/status/bottleneck algorithm duplicated in App/components/demo adapter;
- no backend/API/DB/persistence;
- no router/state/UI/testing framework added;
- existing simulation tests remain green;
- production build succeeds;
- package dependencies are limited to React/ReactDOM plus Vite dev tooling;
- git diff --check passes.
```

If Reviewer environment can open/interact with the browser, additionally perform the two-run visual walkthrough from `docs/specs/react-demo-v1.md`. If no browser-capable tool exists, do not fabricate a visual result; record that automated behavior/build checks passed and leave visual confirmation for the user before deploy.

- [ ] **Step 9: Commit**

```bash
git add apps/web/src/demo/result-view.js apps/web/test/demo/result-view.test.js apps/web/src/components/SimulationResult.jsx apps/web/src/App.jsx apps/web/src/styles.css
git commit -m "feat: present simulation demo results"
```

After fresh Reviewer acceptance, update `docs/STATUS.md` to mark `React Demo v1` complete and stop autonomous execution. The next phase is `Deploy v1`, which requires a separate hosting/platform decision and plan.

---

## Plan self-review

- Spec coverage: scenario inputs, minute conversion, engine invocation, success/failure result, Limited→Available rerun, zero→Unavailable, build/regression gate and no-backend scope are all mapped to Tasks 1–4.
- No new simulation rules are introduced outside `src/simulation/`.
- No new UI testing framework is introduced.
- Deploy is deliberately excluded because hosting/platform selection requires a separate decision.
- All reusable interfaces introduced by one Task are named before later Tasks consume them.
- Final behavioral assertions are based on controlled fixture values already defined in project docs, not claimed empirical measurements.