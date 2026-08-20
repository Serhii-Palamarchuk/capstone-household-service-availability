# UX Polish v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing four-step User-facing MVP compact, directly revisable, bilingual (EN/UA), and verifiable at the accepted 1920 × 1080 density baseline without changing estimator/engine semantics.

**Architecture:** Keep `App.jsx` as the owner of wizard/form/result state. Extract pure UX helpers for entity fallbacks/display labels, translation, result invalidation, and quick-edit form transforms so the existing Node test runner can verify behavior without adding a UI testing dependency. Replace large cards with compact rows + native `<details>` and keep every calculation on the existing `normalizeUserMvpForm()` → `runUserScenario()` path.

**Tech Stack:** React 19, JavaScript/JSX, CSS, Node built-in `node:test`, Vite 8. No new runtime or test dependency.

**Spec:** `docs/specs/ux-polish-v1.md`  
**Acceptance:** `docs/specs/ux-polish-v1-acceptance.md` (`UX-01…UX-30`)

## Global Constraints

- Preserve `Simulation Engine v1`, Availability Estimator formulas, status semantics, service-template role semantics, recommendation rules, and accepted W/Wh assumptions.
- Do not add backend, database, cloud service, optimizer, dynamic load model, domain entity, third-party i18n package, or test framework.
- English remains the initial language.
- UA/EN switching must preserve form state, assignments, current step, and a current valid result.
- Device/BackupSource/Service custom `Name` is optional to the user, but normalized domain entities keep deterministic non-empty `name` values.
- `ExternalProvider.name` remains required.
- Forward navigation stays on `Continue` / `Run scenario`; stepper buttons navigate backward only.
- Compact `Back` remains on Steps 2–4.
- Upstream form changes invalidate an existing result; navigation and language changes do not.
- Quick edit changes only `usableCapacityWh`, `maxOutputPowerW`, and outage duration.
- Quick edit uses the same normalization/estimator/engine pipeline.
- At CSS viewport `1920 × 1080`, the default/collapsed state of all four steps must fit without vertical page scroll using 5 Devices, 2 BackupSources, 3 ServiceInstances, 2 ExternalProviders; Step 4 uses all 3 services as targets.
- Controlled fixture values remain test fixtures, not real autonomy measurements.

## File Map

**Create**
- `apps/web/src/user-mvp/entity-labels.js` — fallback names, display labels, duplicate disambiguation.
- `apps/web/src/user-mvp/i18n.js` — EN/UA dictionaries and translated UI-message helpers.
- `apps/web/src/user-mvp/result-state.js` — pure result invalidation helper.
- `apps/web/src/user-mvp/quick-edit.js` — pure allow-listed quick-edit transform.
- `apps/web/test/user-mvp/entity-labels.test.js`
- `apps/web/test/user-mvp/i18n.test.js`
- `apps/web/test/user-mvp/result-state.test.js`
- `apps/web/test/user-mvp/quick-edit.test.js`

**Modify**
- `apps/web/src/user-mvp/form-state.js`
- `apps/web/src/App.jsx`
- `apps/web/src/components/user-mvp/EquipmentStep.jsx`
- `apps/web/src/components/user-mvp/BackupStep.jsx`
- `apps/web/src/components/user-mvp/ServicesScenarioStep.jsx`
- `apps/web/src/components/user-mvp/UserScenarioResult.jsx`
- `apps/web/src/styles.css`
- `apps/web/test/user-mvp/form-state.test.js`
- `apps/web/test/user-mvp/integration.test.js`
- `docs/STATUS.md` only after factual verification.

Do not modify `apps/web/src/simulation/**`, estimator formula implementation, service-template role definitions, recommendation rules, `package.json`, or lockfile.

---

### Task 1: Optional custom names + deterministic labels

**Files:**
- Create: `apps/web/src/user-mvp/entity-labels.js`
- Create: `apps/web/test/user-mvp/entity-labels.test.js`
- Modify: `apps/web/src/user-mvp/form-state.js`
- Modify: `apps/web/test/user-mvp/form-state.test.js`

**Interfaces:**
- `fallbackDeviceName(device)`
- `fallbackBackupSourceName(source)`
- `fallbackServiceName(service)`
- `deviceDisplayLabels(devices, t)` → `Map<id,string>`
- `backupSourceDisplayLabels(sources, t)` → `Map<id,string>`
- `serviceDisplayLabels(services, t)` → `Map<id,string>`

- [ ] **Step 1: Write failing label tests**

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  fallbackDeviceName,
  fallbackBackupSourceName,
  fallbackServiceName,
  deviceDisplayLabels,
} from '../../src/user-mvp/entity-labels.js';

const t = (key, params = {}) => ({
  'category.Router': 'Router',
}[key] ?? params.fallback ?? key);

test('device fallback is deterministic', () => {
  assert.equal(fallbackDeviceName({ category: 'Router', powerW: 15 }), 'Router · 15 W');
});

test('duplicate custom category name is suppressed', () => {
  const labels = deviceDisplayLabels([
    { id: 'r1', name: 'Router', category: 'Router', powerW: 15 },
  ], t);
  assert.equal(labels.get('r1'), 'Router · 15 W');
});

test('meaningful custom name is retained', () => {
  const labels = deviceDisplayLabels([
    { id: 'r1', name: 'Bedroom router', category: 'Router', powerW: 15 },
  ], t);
  assert.equal(labels.get('r1'), 'Bedroom router (Router · 15 W)');
});

test('identical unnamed labels get stable ordinals', () => {
  const labels = deviceDisplayLabels([
    { id: 'r1', name: '', category: 'Router', powerW: 15 },
    { id: 'r2', name: '', category: 'Router', powerW: 15 },
  ], t);
  assert.equal(labels.get('r1'), 'Router · 15 W #1');
  assert.equal(labels.get('r2'), 'Router · 15 W #2');
});

test('backup and service fallbacks are deterministic', () => {
  assert.equal(
    fallbackBackupSourceName({ type: 'PowerStation', usableCapacityWh: 1000, maxOutputPowerW: 1200 }),
    'Power station · 1000 Wh · 1200 W max',
  );
  assert.equal(fallbackServiceName({ templateId: 'Internet', variantId: 'Fiber' }), 'Internet · Fiber');
});
```

- [ ] **Step 2: Verify red**

Run from `apps/web`:

```bash
node --test test/user-mvp/entity-labels.test.js
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement fallbacks/display labels**

Start `entity-labels.js` with:

```js
function clean(value) {
  return String(value ?? '').trim();
}

function comparable(value) {
  return clean(value).toLocaleLowerCase();
}

export function fallbackDeviceName(device) {
  return `${clean(device.category) || 'Device'} · ${clean(device.powerW)} W`;
}

export function fallbackBackupSourceName(source) {
  const type = source.type === 'PowerStation' ? 'Power station' : clean(source.type) || 'Backup source';
  const parts = [type, `${clean(source.usableCapacityWh)} Wh`];
  if (clean(source.maxOutputPowerW)) parts.push(`${clean(source.maxOutputPowerW)} W max`);
  return parts.join(' · ');
}

export function fallbackServiceName(service) {
  return [clean(service.templateId) || 'Service', clean(service.variantId)].filter(Boolean).join(' · ');
}
```

Add display-label builders that:
1. build translated technical label from `t`;
2. suppress custom name if it equals raw category/type/template or technical label after trim/case normalization;
3. otherwise render `Custom name (Technical · Label)`;
4. append `#1`, `#2` only when final labels collide.

- [ ] **Step 4: Make custom names optional in normalization**

In `form-state.js`, Device/BackupSource/Service name parsing becomes optional text plus fallback. Example Device path:

```js
const customName = typeof device.name === 'string' ? device.name.trim() : '';
const name = customName || fallbackDeviceName({ ...device, powerW });
```

Apply equivalent fallback after normalized numeric/template fields for BackupSource and Service. Keep `normalizeExternalProvider()` unchanged so provider name stays required.

Add form-state tests proving empty Device/BackupSource/Service names normalize and empty provider name still yields `REQUIRED_FIELD`.

- [ ] **Step 5: Verify green and commit**

```bash
node --test test/user-mvp/entity-labels.test.js test/user-mvp/form-state.test.js
git add apps/web/src/user-mvp/entity-labels.js apps/web/src/user-mvp/form-state.js apps/web/test/user-mvp/entity-labels.test.js apps/web/test/user-mvp/form-state.test.js
git commit -m "feat: add optional entity names and labels"
```

Reviewer gate: UX-03…UX-06, UX-11, UX-12; no simulation/template semantic changes.

---

### Task 2: Local EN/UA translation layer

**Files:**
- Create: `apps/web/src/user-mvp/i18n.js`
- Create: `apps/web/test/user-mvp/i18n.test.js`

**Interfaces:**
- `SUPPORTED_LANGUAGES = ['en', 'uk']`
- `createTranslator(language)`
- `translateStatus(status, t)`
- `translateValidationError(error, t)`
- `translateWarning(warning, t, nameFor)`
- `translateRecommendation(recommendation, t, nameFor)`

- [ ] **Step 1: Write failing translation tests**

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { createTranslator, translateStatus } from '../../src/user-mvp/i18n.js';

test('English and Ukrainian UI strings resolve', () => {
  const en = createTranslator('en');
  const uk = createTranslator('uk');
  assert.equal(en('actions.continue'), 'Continue');
  assert.equal(uk('actions.continue'), 'Продовжити');
  assert.equal(translateStatus('Limited', en), 'Limited');
  assert.equal(translateStatus('Limited', uk), 'Обмежено');
});
```

- [ ] **Step 2: Verify red**

```bash
node --test test/user-mvp/i18n.test.js
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement translator**

```js
export const SUPPORTED_LANGUAGES = ['en', 'uk'];

const messages = {
  en: {
    'actions.continue': 'Continue',
    'actions.back': 'Back',
    'actions.details': 'Details',
    'actions.recalculate': 'Recalculate',
    'status.Available': 'Available',
    'status.Limited': 'Limited',
    'status.Unavailable': 'Unavailable',
  },
  uk: {
    'actions.continue': 'Продовжити',
    'actions.back': 'Назад',
    'actions.details': 'Деталі',
    'actions.recalculate': 'Перерахувати',
    'status.Available': 'Доступно',
    'status.Limited': 'Обмежено',
    'status.Unavailable': 'Недоступно',
  },
};

export function createTranslator(language = 'en') {
  const selected = SUPPORTED_LANGUAGES.includes(language) ? language : 'en';
  return (key, params = {}) => {
    let value = messages[selected][key] ?? messages.en[key] ?? params.fallback ?? key;
    for (const [name, replacement] of Object.entries(params)) {
      if (name !== 'fallback') value = value.replaceAll(`{${name}}`, String(replacement));
    }
    return value;
  };
}
```

Expand dictionaries to all visible header/step/field/helper/action text, category/type/template labels, statuses, existing form/service-builder validation codes, estimator warnings, and recommendation types. Translation helpers map stable code/type → human message; they never mutate identifiers.

- [ ] **Step 4: Add identifier-preservation tests**

For one validation error, warning, status and each recommendation type, call translation helpers and assert original `.code`, `.type`, `.status` values remain unchanged.

- [ ] **Step 5: Verify green and commit**

```bash
node --test test/user-mvp/i18n.test.js test/user-mvp/entity-labels.test.js
git add apps/web/src/user-mvp/i18n.js apps/web/test/user-mvp/i18n.test.js
git commit -m "feat: add English Ukrainian UI copy"
```

Reviewer gate: UX-25…UX-27 foundation; dependency files unchanged.

---

### Task 3: Backward stepper + stale-result state

**Files:**
- Create: `apps/web/src/user-mvp/result-state.js`
- Create: `apps/web/test/user-mvp/result-state.test.js`
- Modify: `apps/web/src/App.jsx`

**Interfaces:**
- `invalidateResultState({ outcome, submittedInput, resultStale })`
- `App` owns `language`, `currentStep`, `formState`, `outcome`, `submittedInput`, `resultStale`.

- [ ] **Step 1: Write failing invalidation test**

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { invalidateResultState } from '../../src/user-mvp/result-state.js';

test('existing result becomes stale', () => {
  assert.deepEqual(
    invalidateResultState({ outcome: { success: true }, submittedInput: { id: 1 }, resultStale: false }),
    { outcome: null, submittedInput: null, resultStale: true },
  );
});

test('no existing result stays non-stale', () => {
  assert.deepEqual(
    invalidateResultState({ outcome: null, submittedInput: null, resultStale: false }),
    { outcome: null, submittedInput: null, resultStale: false },
  );
});
```

- [ ] **Step 2: Verify red, then implement helper**

```bash
node --test test/user-mvp/result-state.test.js
```

Implement:

```js
export function invalidateResultState({ outcome, submittedInput, resultStale }) {
  return {
    outcome: null,
    submittedInput: null,
    resultStale: outcome ? true : resultStale,
  };
}
```

- [ ] **Step 3: Wire result invalidation into App**

Add:

```js
const [language, setLanguage] = useState('en');
const [resultStale, setResultStale] = useState(false);
const t = createTranslator(language);

function invalidateResult() {
  const next = invalidateResultState({ outcome, submittedInput, resultStale });
  setOutcome(next.outcome);
  setSubmittedInput(next.submittedInput);
  setResultStale(next.resultStale);
}
```

Call `invalidateResult()` before every handler that changes Devices, BackupSources, assignments, Services, providers, target/additional loads, or outage duration. Do not call it for `setLanguage()` or pure step navigation. Successful `submitScenario()` sets `resultStale(false)`.

- [ ] **Step 4: Make earlier stepper items real buttons**

For each step index `< currentStep`, render a keyboard-focusable `<button type="button" onClick={() => setCurrentStep(index)}>` inside the stepper item. Current/future steps are non-clickable. Keep existing bottom Back callbacks.

If `resultStale`, show compact translated text near stepper: `Result needs recalculation`; do not show old Result as current.

- [ ] **Step 5: Verify and commit**

```bash
node --test test/user-mvp/result-state.test.js
npm run build
git add apps/web/src/user-mvp/result-state.js apps/web/test/user-mvp/result-state.test.js apps/web/src/App.jsx
git commit -m "feat: add backward navigation and stale result state"
```

Reviewer gate: UX-21…UX-24.

---

### Task 4: Compact Equipment + Backup

**Files:**
- Modify: `apps/web/src/components/user-mvp/EquipmentStep.jsx`
- Modify: `apps/web/src/components/user-mvp/BackupStep.jsx`
- Modify: `apps/web/src/styles.css`
- Modify: `apps/web/src/App.jsx` to pass `t` and display-label maps.

**Interfaces:**
- Existing mutation callbacks remain unchanged.
- Components receive `t`, Device label map, and BackupSource label map.

- [ ] **Step 1: Replace Device cards with compact rows**

Use one collapsed row per device plus native `<details>`:

```jsx
<article className="compact-entity-row" key={device.id}>
  <div className="compact-row-main">
    <strong>{deviceLabels.get(device.id)}</strong>
    <span>{device.internalBatteryWh ? `${device.internalBatteryWh} Wh` : t('battery.none')}</span>
    <details className="row-details">
      <summary>{t('actions.details')}</summary>
      <div className="details-fields">
        {/* existing Name/category/power/battery inputs, with Name last and optional */}
      </div>
    </details>
    <button type="button" className="text-button danger-button" onClick={() => onRemove(device.id)}>
      {t('actions.remove')}
    </button>
  </div>
</article>
```

Keep all four real inputs; Name is visibly optional and secondary.

- [ ] **Step 2: Replace BackupSource cards with compact rows**

Collapsed row shows generated label, capacity/max summary, Details, remove. Details contains optional Name, type, usable capacity, optional max output.

- [ ] **Step 3: Implement exact adaptive assignment behavior**

```js
const sourceCount = backupSources.length;
const assignedSourceId = assignments[device.id] ?? '';
const enabled = Boolean(assignedSourceId);
```

Rules:
- `sourceCount === 0`: no selector/toggle; show translated no-source text.
- `sourceCount === 1`: checkbox/toggle only. On → assign `backupSources[0].id`; Off → assign `''`.
- `sourceCount >= 2`: checkbox/toggle plus selector when On. Enabling from empty assigns first source; selector changes source.

Never change internal battery from this control.

- [ ] **Step 4: Add compact CSS**

Add low vertical padding, one-line desktop summary, expanded Details below the row, visible focus styles, and responsive wrapping. Do not use fixed heights that clip expanded content.

- [ ] **Step 5: Verify and commit**

```bash
npm test
npm run build
git add apps/web/src/App.jsx apps/web/src/components/user-mvp/EquipmentStep.jsx apps/web/src/components/user-mvp/BackupStep.jsx apps/web/src/styles.css
git commit -m "feat: compact equipment and backup steps"
```

Manual reviewer check at 1920 × 1080 with 5 devices/2 sources; actual pass/fail is recorded only in final verification.

Reviewer gate: UX-02, UX-06…UX-09, UX-14.

---

### Task 5: Compact Services & Scenario + discoverable validation

**Files:**
- Modify: `apps/web/src/components/user-mvp/ServicesScenarioStep.jsx`
- Modify: `apps/web/src/styles.css`
- Modify: `apps/web/src/App.jsx` to pass translator/label maps.

- [ ] **Step 1: Replace service cards with collapsed rows**

Each row shows display label, dependency summary, target control, Details, remove.

```jsx
<article className="compact-service-row" key={service.id}>
  <div className="compact-row-main">
    <strong>{serviceLabels.get(service.id)}</strong>
    <span className="dependency-summary">{dependencySummary}</span>
    <label className="target-toggle">
      <input
        type="checkbox"
        checked={formState.scenario.targetServiceIds.includes(service.id)}
        onChange={event => onScenarioListChange(
          'targetServiceIds',
          toggleId(formState.scenario.targetServiceIds, service.id, event.target.checked),
        )}
      />
      {t('scenario.target')}
    </label>
    <details className="row-details">...</details>
  </div>
</article>
```

Details contains optional Name, template, variant and existing dependency-role editors. Role filtering/cardinality rules stay unchanged.

- [ ] **Step 2: Build dependency summary from actual bindings**

Resolve selected IDs through Device/Service/Provider label maps and join with `, `. Missing required binding displays translated `Incomplete`; do not infer or auto-fill dependencies.

- [ ] **Step 3: Compact providers and scenario controls**

Provider row shows required name + availability. Keep outage duration visible. Additional loads use compact checkbox/grid controls. Remove the separate duplicated target-service fieldset because target selection now lives on service rows; underlying `targetServiceIds` stays unchanged.

- [ ] **Step 4: Make collapsed errors discoverable**

Group current errors by field prefix and show a compact error badge/message on affected rows. When an affected entity step is opened, its Details block is visibly marked and expanded. Keep the top scenario error summary for cross-step routing.

- [ ] **Step 5: Verify and commit**

```bash
npm test
npm run build
git add apps/web/src/App.jsx apps/web/src/components/user-mvp/ServicesScenarioStep.jsx apps/web/src/styles.css
git commit -m "feat: compact services and scenario step"
```

Manual negative smoke: `INVALID_POSITIVE_NUMBER`, `BACKUP_SOURCE_MAX_OUTPUT_EXCEEDED`, `MISSING_EXTERNAL_PROVIDER_AVAILABILITY`, `TEMPLATE_ROLE_CARDINALITY`.

Reviewer gate: UX-10, UX-12…UX-15.

---

### Task 6: Result dashboard + allow-listed quick edit

**Files:**
- Create: `apps/web/src/user-mvp/quick-edit.js`
- Create: `apps/web/test/user-mvp/quick-edit.test.js`
- Modify: `apps/web/src/App.jsx`
- Modify: `apps/web/src/components/user-mvp/UserScenarioResult.jsx`
- Modify: `apps/web/src/styles.css`

**Interfaces:**
- `applyQuickEdit(formState, patch)` accepts only `sourceId`, `usableCapacityWh`, `maxOutputPowerW`, `outageDurationMinutes`.
- `App.onQuickRecalculate(patch)` returns `{ success: true }` or `{ success: false, errors }`.

- [ ] **Step 1: Write failing quick-edit tests**

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { applyQuickEdit } from '../../src/user-mvp/quick-edit.js';

test('backup quick edit touches only allowed source fields', () => {
  const state = {
    backupSources: [{ id: 's1', name: 'X', type: 'PowerStation', usableCapacityWh: '480', maxOutputPowerW: '' }],
    scenario: { outageDurationMinutes: '480' },
  };
  const next = applyQuickEdit(state, { sourceId: 's1', usableCapacityWh: '960', maxOutputPowerW: '1000' });
  assert.equal(next.backupSources[0].usableCapacityWh, '960');
  assert.equal(next.backupSources[0].maxOutputPowerW, '1000');
  assert.equal(next.backupSources[0].type, 'PowerStation');
  assert.equal(state.backupSources[0].usableCapacityWh, '480');
});

test('outage quick edit changes outage only', () => {
  const state = { backupSources: [], scenario: { outageDurationMinutes: '480' } };
  assert.equal(applyQuickEdit(state, { outageDurationMinutes: '600' }).scenario.outageDurationMinutes, '600');
});
```

- [ ] **Step 2: Verify red, then implement pure transform**

```bash
node --test test/user-mvp/quick-edit.test.js
```

`applyQuickEdit()` clones only touched containers. Reject unknown patch keys with `TypeError`. A source patch requires an existing `sourceId`; outage-only patch does not.

- [ ] **Step 3: Implement exact App recalculation callback**

```js
function quickRecalculate(patch) {
  const nextState = applyQuickEdit(formState, patch);
  const normalized = normalizeUserMvpForm(nextState);
  if (!normalized.success) return { success: false, errors: normalized.errors };

  const nextOutcome = runUserScenario(normalized);
  if (!nextOutcome.success) return { success: false, errors: nextOutcome.errors };

  setFormState(nextState);
  setErrors([]);
  setSubmittedInput(normalized);
  setOutcome(nextOutcome);
  setResultStale(false);
  setCurrentStep(3);
  return { success: true };
}
```

Invalid quick-edit draft does not mutate global form/result state.

- [ ] **Step 4: Rebuild Result in decision-first order**

Order:
1. target service/status/availability vs outage;
2. limiting dependencies + causal paths;
3. compact used BackupSource summaries + Edit;
4. compact Device availability rows;
5. warnings/recommendations only when present.

Use an in-page conditional panel with `role="dialog"`, `aria-modal="true"`, labelled heading, Cancel and Recalculate. Backup dialog exposes only capacity/max output; outage dialog exposes only outage duration. Keep draft fields in local component state until recalculation succeeds.

- [ ] **Step 5: Verify and commit**

```bash
node --test test/user-mvp/quick-edit.test.js test/user-mvp/integration.test.js
npm test
npm run build
git add apps/web/src/user-mvp/quick-edit.js apps/web/test/user-mvp/quick-edit.test.js apps/web/src/App.jsx apps/web/src/components/user-mvp/UserScenarioResult.jsx apps/web/src/styles.css
git commit -m "feat: add compact result quick editing"
```

Reviewer gate: UX-16…UX-20.

---

### Task 7: Wire EN/UA through all visible UI

**Files:**
- Modify: `apps/web/src/App.jsx`
- Modify: `apps/web/src/components/user-mvp/EquipmentStep.jsx`
- Modify: `apps/web/src/components/user-mvp/BackupStep.jsx`
- Modify: `apps/web/src/components/user-mvp/ServicesScenarioStep.jsx`
- Modify: `apps/web/src/components/user-mvp/UserScenarioResult.jsx`
- Modify: `apps/web/src/styles.css`
- Modify: `apps/web/test/user-mvp/i18n.test.js`

- [ ] **Step 1: Add language switch**

```jsx
<div className="language-switch" aria-label={t('language.label')}>
  <button type="button" aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>EN</button>
  <button type="button" aria-pressed={language === 'uk'} onClick={() => setLanguage('uk')}>UA</button>
</div>
```

This handler changes only language state.

- [ ] **Step 2: Translate every visible literal**

Move header, fixture notice, step names, field labels/options, helper text, buttons, empty states, validation messages, warnings, recommendations and displayed statuses to translation keys. Category/type/template values remain stable identifiers but their visible labels use `t`.

- [ ] **Step 3: Recompute display-label maps from current translator**

In `App`, derive Device/BackupSource/Service label maps on each render using current `t`. Custom names remain unchanged; technical parts switch language immediately.

- [ ] **Step 4: Extend translation tests**

Test both languages for one category/type/template/status, all current recommendation types, missing-max warning and representative validation codes. Assert source identifiers remain unchanged.

- [ ] **Step 5: Verify, browser-smoke state preservation, commit**

```bash
node --test test/user-mvp/i18n.test.js test/user-mvp/entity-labels.test.js
npm test
npm run build
git add apps/web/src/App.jsx apps/web/src/components/user-mvp apps/web/src/styles.css apps/web/src/user-mvp/i18n.js apps/web/test/user-mvp/i18n.test.js
git commit -m "feat: add English Ukrainian interface switch"
```

Browser smoke with edited form + valid Result: EN → UA → EN must preserve current step, data, assignments and current numeric result.

Reviewer gate: UX-25…UX-27.

---

### Task 8: Density/accessibility polish + final verification

**Files:**
- Modify: `apps/web/src/styles.css`
- Modify: `apps/web/test/user-mvp/integration.test.js`
- Modify: `docs/STATUS.md` after verification only.

- [ ] **Step 1: Compress global chrome**

Reduce vertical space in `.hero`, `.fixture-notice`, `.step-navigation`, `.wizard-panel`, section headings and action bars on desktop. Keep visible focus indicators and no fixed heights that clip expanded content.

- [ ] **Step 2: Strengthen AC-12 unchanged-output regression**

Using the existing controlled fixture, assert identical normalized input still produces:

```js
assert.equal(outcome.estimation.sourceResults[0].totalPowerW, 80);
assert.equal(outcome.estimation.sourceResults[0].runtimeMinutes, 360);
assert.equal(outcome.simulation.targetResults[0].availabilityDurationMinutes, 360);
assert.equal(outcome.simulation.targetResults[0].status, 'Limited');
```

Also keep Router/ONT 360 and Laptop 480 checks where the fixture exposes them. Do not treat translated/display labels as simulation semantics.

- [ ] **Step 3: Run full automated verification**

On the user's Windows environment:

```bash
cmd.exe /d /c npm test
cmd.exe /d /c npm run build
```

Record fresh actual test count, failures, Vite version/build outcome. Never reuse prior `100 passed` as the new result.

- [ ] **Step 4: Run exact browser acceptance**

At CSS viewport `1920 × 1080`, configure 5 valid Devices, 2 valid BackupSources, 3 valid ServiceInstances, 2 valid ExternalProviders, and select all 3 services as targets for Result.

For each default/collapsed Step 1–4, verify no vertical page scroll using:

```js
document.documentElement.scrollHeight <= document.documentElement.clientHeight
```

Also verify:
- Step 4 → direct stepper navigation to Steps 1/2/3;
- Back remains usable;
- upstream change invalidates Result and requires new run;
- quick-edit backup rerun without reload;
- quick-edit outage rerun without reload;
- EN/UA switch preserves state/result;
- validation remains discoverable from collapsed UI;
- keyboard can operate stepper, Details, language switch, Back/Continue/Run and dialog actions;
- browser console state if inspected.

Record only actually observed results.

- [ ] **Step 5: Whole-branch review, STATUS evidence, commit**

Reviewer compares branch to merge base and checks:
- no `apps/web/src/simulation/**` changes;
- no estimator formula/template/recommendation semantic changes;
- no package/lockfile dependency changes;
- UX-01…UX-30 coverage;
- no unresolved Critical/Major finding before merge proposal.

Update `docs/STATUS.md` with actual implementation commits/test/build/browser/review evidence. Do not mark deployed/live until later merge + Pages deployment + separate live smoke.

```bash
git add apps/web/src/styles.css apps/web/test/user-mvp/integration.test.js docs/STATUS.md
git commit -m "docs: record UX polish verification"
```

Branch is then eligible for a separate user-approved merge/deploy decision.

---

## Self-review coverage map

- UX-01 → Tasks 4, 5, 8.
- UX-02…UX-06, UX-11/12 → Task 1 + compact UI Tasks 4/5.
- UX-07…UX-09 → Task 4.
- UX-10, UX-13…UX-15 → Task 5.
- UX-16…UX-20 → Task 6.
- UX-21…UX-24 → Task 3.
- UX-25…UX-27 → Tasks 2 and 7.
- UX-28/UX-29 → all tasks, final gate Task 8.
- UX-30 → Task 8.

Placeholder scan: no `TBD`, `TODO`, conditional implementation branch, or unresolved interface choice remains. The plan intentionally introduces no new dependency/backend/domain scope.
