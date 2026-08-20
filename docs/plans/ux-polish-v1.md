# UX Polish v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing four-step User-facing MVP compact, directly revisable, bilingual (EN/UA), and usable at the accepted 1920 × 1080 density baseline without changing estimator/engine semantics.

**Architecture:** Keep `App.jsx` as the owner of wizard/form/result state, but extract presentation-only helpers for entity names/labels, translation, and quick-edit state transforms so they can be covered by the existing Node test runner. Replace card-heavy step markup with compact rows and native progressive details; keep all simulation execution through `normalizeUserMvpForm()` → `runUserScenario()`.

**Tech Stack:** React 19, plain JavaScript/JSX, CSS, Node built-in `node:test`, Vite 8. No new runtime or test dependency.

**Spec:** `docs/specs/ux-polish-v1.md`; acceptance: `docs/specs/ux-polish-v1-acceptance.md` (`UX-01…UX-30`).

## Global Constraints

- Preserve `Simulation Engine v1`, Availability Estimator formulas, status semantics, service-template role semantics, recommendation rules, and accepted W/Wh assumptions.
- Do not add backend, database, cloud service, optimizer, dynamic load model, domain entity, or third-party i18n/testing dependency.
- English remains the initial language; UA/EN switching must preserve form state, assignments, current step, and a current valid result.
- `Device`, `BackupSource`, and `ServiceInstance` custom `Name` are optional for the user, but normalized domain entities must still receive a deterministic non-empty `name`.
- `ExternalProvider.name` stays required.
- Forward wizard progression stays explicit through `Continue` / `Run scenario`; the stepper only adds direct backward navigation.
- A compact `Back` action remains on Steps 2–4.
- If upstream scenario/configuration data changes after a successful run, that result becomes stale and must not be presented as current.
- Quick edit may change only `BackupSource.usableCapacityWh`, `BackupSource.maxOutputPowerW`, and `Scenario.outageDurationMinutes`, and must recalculate through the normal normalization → estimator → simulation path.
- At CSS viewport `1920 × 1080`, the default/collapsed state of all four steps must have no vertical page scroll with 5 Devices, 2 BackupSources, 3 ServiceInstances, 2 ExternalProviders; Step 4 uses all 3 services as targets.
- Existing controlled values are test fixtures, not real autonomy measurements.

---

## File structure and responsibilities

**Create**

- `apps/web/src/user-mvp/entity-labels.js` — deterministic domain fallbacks plus translated display-label composition and duplicate disambiguation.
- `apps/web/src/user-mvp/i18n.js` — EN/UA dictionaries, translator, status/error/warning/recommendation UI copy helpers; identifiers remain unchanged.
- `apps/web/src/user-mvp/quick-edit.js` — pure, allow-listed quick-edit form-state transform.
- `apps/web/test/user-mvp/entity-labels.test.js` — UX-03…UX-06 and UX-11 label/name coverage.
- `apps/web/test/user-mvp/i18n.test.js` — UX-25…UX-27 copy/identifier coverage.
- `apps/web/test/user-mvp/quick-edit.test.js` — UX-18…UX-20 allow-list and immutability coverage.
- `apps/web/test/user-mvp/ux-regression.test.js` — cross-cutting AC-12 regression plus stale/quick-edit state-independent checks.

**Modify**

- `apps/web/src/user-mvp/form-state.js` — accept empty custom names for Device/BackupSource/Service and generate non-empty fallbacks.
- `apps/web/src/App.jsx` — language state, compact clickable backward stepper, stale-result invalidation, quick-recalculate callback, localized shared chrome.
- `apps/web/src/components/user-mvp/EquipmentStep.jsx` — compact rows + progressive details.
- `apps/web/src/components/user-mvp/BackupStep.jsx` — compact source rows + adaptive 0/1/2+ source assignment controls.
- `apps/web/src/components/user-mvp/ServicesScenarioStep.jsx` — compact service/provider/scenario rows, integrated target control, discoverable errors.
- `apps/web/src/components/user-mvp/UserScenarioResult.jsx` — compact decision-first dashboard + quick edit UI.
- `apps/web/src/styles.css` — dense desktop layout, compact app chrome, row/details/result/dialog styles, responsive fallback.
- `apps/web/test/user-mvp/form-state.test.js` — optional-name/fallback normalization regressions.
- `apps/web/test/user-mvp/integration.test.js` — prove unchanged estimator/engine outputs for identical normalized input.
- `docs/STATUS.md` — only after factual verification, record implementation/test/build/browser results.

Do **not** modify `apps/web/src/simulation/**`, estimator formulas, service-template role definitions, recommendation rules, `package.json`, or lockfile unless an actual blocker is raised as a separate user decision.

---

### Task 1: Optional names and deterministic entity labels

**Files:**
- Create: `apps/web/src/user-mvp/entity-labels.js`
- Create: `apps/web/test/user-mvp/entity-labels.test.js`
- Modify: `apps/web/src/user-mvp/form-state.js`
- Modify: `apps/web/test/user-mvp/form-state.test.js`

**Interfaces:**
- Produces `fallbackDeviceName(device)`, `fallbackBackupSourceName(source)`, `fallbackServiceName(service)` for normalization.
- Produces `deviceDisplayLabels(devices, t)`, `backupSourceDisplayLabels(sources, t)`, `serviceDisplayLabels(services, t)` returning `Map<id, string>` for later UI tasks.
- The `t` argument is a function `(key, params?) => string`; Task 2 supplies the production translator. Tests may use an identity/simple fixture translator.

- [ ] **Step 1: Write failing label tests**

Create `entity-labels.test.js` with explicit expectations:

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

test('Device fallback remains non-empty when custom name is empty', () => {
  assert.equal(
    fallbackDeviceName({ category: 'Router', powerW: 15 }),
    'Router · 15 W',
  );
});

test('Device display label suppresses duplicate custom category name', () => {
  const labels = deviceDisplayLabels([
    { id: 'r1', name: 'Router', category: 'Router', powerW: 15 },
  ], t);
  assert.equal(labels.get('r1'), 'Router · 15 W');
});

test('Device display label keeps meaningful custom name', () => {
  const labels = deviceDisplayLabels([
    { id: 'r1', name: 'Bedroom router', category: 'Router', powerW: 15 },
  ], t);
  assert.equal(labels.get('r1'), 'Bedroom router (Router · 15 W)');
});

test('duplicate unnamed labels receive deterministic ordinals', () => {
  const labels = deviceDisplayLabels([
    { id: 'r1', name: '', category: 'Router', powerW: 15 },
    { id: 'r2', name: '', category: 'Router', powerW: 15 },
  ], t);
  assert.equal(labels.get('r1'), 'Router · 15 W #1');
  assert.equal(labels.get('r2'), 'Router · 15 W #2');
});

test('fallbacks exist for backup source and service', () => {
  assert.equal(
    fallbackBackupSourceName({ type: 'PowerStation', usableCapacityWh: 1000, maxOutputPowerW: 1200 }),
    'Power station · 1000 Wh · 1200 W max',
  );
  assert.equal(
    fallbackServiceName({ templateId: 'Internet', variantId: 'Fiber' }),
    'Internet · Fiber',
  );
});
```

- [ ] **Step 2: Run focused tests and verify failure**

Run from `apps/web`:

```bash
node --test test/user-mvp/entity-labels.test.js
```

Expected: FAIL because `entity-labels.js` does not exist yet.

- [ ] **Step 3: Implement label/fallback helpers and optional-name normalization**

Implement helpers with these exact rules:

```js
function clean(value) {
  return String(value ?? '').trim();
}

function normalized(value) {
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
  return [clean(service.templateId) || 'Service', clean(service.variantId)]
    .filter(Boolean)
    .join(' · ');
}
```

Add specific technical/display builders that translate category/type/template/variant labels through `t`, suppress custom names equal to translated category/technical label/raw category after trim/case normalization, then add `#1`, `#2` only to duplicate final labels.

In `form-state.js`, replace required custom-name parsing for Device/BackupSource/Service with trimmed optional text plus fallback. Keep IDs/category/type/template requirements unchanged. Example Device normalization:

```js
const customName = typeof device.name === 'string' ? device.name.trim() : '';
const name = customName || fallbackDeviceName({ ...device, powerW });
```

Do the same for BackupSource after numeric normalization and Service after template/variant parsing. Do **not** change `normalizeExternalProvider`: provider name remains required.

- [ ] **Step 4: Add normalization regressions and run tests**

Add tests to `form-state.test.js` proving empty Device/BackupSource/Service names normalize successfully while ExternalProvider empty name still returns `REQUIRED_FIELD`.

Run:

```bash
node --test test/user-mvp/entity-labels.test.js test/user-mvp/form-state.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit and reviewer gate**

```bash
git add apps/web/src/user-mvp/entity-labels.js apps/web/src/user-mvp/form-state.js apps/web/test/user-mvp/entity-labels.test.js apps/web/test/user-mvp/form-state.test.js
git commit -m "feat: add optional entity names and display labels"
```

Reviewer checks UX-03…UX-06, UX-11, UX-12 and no simulation/template change.

---

### Task 2: Local EN/UA translation layer

**Files:**
- Create: `apps/web/src/user-mvp/i18n.js`
- Create: `apps/web/test/user-mvp/i18n.test.js`

**Interfaces:**
- Produces `SUPPORTED_LANGUAGES = ['en', 'uk']`.
- Produces `createTranslator(language)`.
- Produces `translateValidationError(error, t)`, `translateWarning(warning, t, nameFor)`, `translateRecommendation(recommendation, t, nameFor)`, `translateStatus(status, t)`.
- Underlying status/error/recommendation identifiers are never mutated.

- [ ] **Step 1: Write failing translation tests**

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { createTranslator, translateStatus } from '../../src/user-mvp/i18n.js';

test('English is available and Ukrainian translates visible status', () => {
  const en = createTranslator('en');
  const uk = createTranslator('uk');
  assert.equal(en('actions.continue'), 'Continue');
  assert.equal(uk('actions.continue'), 'Продовжити');
  assert.equal(translateStatus('Limited', uk), 'Обмежено');
  assert.equal(translateStatus('Limited', en), 'Limited');
});

test('unknown diagnostic identifier stays identifier-safe', () => {
  const uk = createTranslator('uk');
  assert.equal(uk('diagnostic.UNKNOWN_CODE', { fallback: 'UNKNOWN_CODE' }), 'UNKNOWN_CODE');
});
```

- [ ] **Step 2: Run and verify failure**

```bash
node --test test/user-mvp/i18n.test.js
```

Expected: FAIL because `i18n.js` does not exist.

- [ ] **Step 3: Implement dictionaries and translator**

Use plain local objects only:

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
  const dictionary = messages[SUPPORTED_LANGUAGES.includes(language) ? language : 'en'];
  return (key, params = {}) => {
    let text = dictionary[key] ?? messages.en[key] ?? params.fallback ?? key;
    for (const [name, value] of Object.entries(params)) {
      if (name !== 'fallback') text = text.replaceAll(`{${name}}`, String(value));
    }
    return text;
  };
}
```

Expand dictionaries to cover all visible header/step/field/helper/action text, category/type/template labels, statuses, current validation codes from `form-state.js`/service builder, estimator warnings and recommendation types. UI text helpers should translate by stable code/type and accept dynamic entity names as parameters.

- [ ] **Step 4: Run focused tests**

```bash
node --test test/user-mvp/i18n.test.js test/user-mvp/entity-labels.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit and reviewer gate**

```bash
git add apps/web/src/user-mvp/i18n.js apps/web/test/user-mvp/i18n.test.js
git commit -m "feat: add local English Ukrainian UI copy"
```

Reviewer checks no dependency changes and identifiers remain stable.

---

### Task 3: Wizard backward navigation and stale-result protection

**Files:**
- Modify: `apps/web/src/App.jsx`
- Create: `apps/web/test/user-mvp/ux-regression.test.js`

**Interfaces:**
- `App` owns `language`, `currentStep`, `formState`, `outcome`, `submittedInput`, `resultStale`.
- All domain/scenario mutation handlers call one invalidation helper before applying changes.
- Language changes and pure navigation do not invalidate a valid result.

- [ ] **Step 1: Add pure regression checks for state-independent rule**

In `ux-regression.test.js`, test a tiny exported helper from `App`-adjacent logic only if necessary; prefer extracting this pure function in `App.jsx` only if Node can import it without DOM side effects. If JSX import is undesirable, create `apps/web/src/user-mvp/result-state.js` with:

```js
export function invalidateResultState(state) {
  return state.outcome
    ? { outcome: null, submittedInput: null, resultStale: true }
    : { outcome: null, submittedInput: null, resultStale: state.resultStale };
}
```

Test that a valid result becomes stale, while navigation/language events do not call this helper.

- [ ] **Step 2: Run focused test and verify failure**

```bash
node --test test/user-mvp/ux-regression.test.js
```

Expected: FAIL until result-state helper/state wiring exists.

- [ ] **Step 3: Implement App state/navigation wiring**

Add:

```js
const [language, setLanguage] = useState('en');
const [resultStale, setResultStale] = useState(false);
const t = createTranslator(language);

function invalidateResult() {
  if (outcome) setResultStale(true);
  setOutcome(null);
  setSubmittedInput(null);
}
```

Call `invalidateResult()` at the start of every handler that changes Devices, BackupSources, assignments, Services, providers, outage, target services or additional loads. Do **not** call it for `setLanguage` or `setCurrentStep`.

On successful `submitScenario()`, set `resultStale(false)`.

Render earlier stepper items as real `<button type="button">` controls, current/future items as non-forward controls. From Step N, only indices `< currentStep` call `setCurrentStep(index)`. Keep bottom Back callbacks.

If `resultStale` is true, show a compact non-result indicator near the stepper, e.g. translated `Result needs recalculation`; do not render the old result as current.

- [ ] **Step 4: Run tests and build**

```bash
node --test test/user-mvp/ux-regression.test.js
npm run build
```

Expected: tests PASS; Vite build exit 0.

- [ ] **Step 5: Commit and reviewer gate**

```bash
git add apps/web/src/App.jsx apps/web/src/user-mvp/result-state.js apps/web/test/user-mvp/ux-regression.test.js
git commit -m "feat: add wizard navigation and stale result state"
```

Reviewer checks UX-21…UX-24 and confirms forward jumps are not introduced.

---

### Task 4: Compact Equipment and Backup steps

**Files:**
- Modify: `apps/web/src/components/user-mvp/EquipmentStep.jsx`
- Modify: `apps/web/src/components/user-mvp/BackupStep.jsx`
- Modify: `apps/web/src/styles.css`

**Interfaces:**
- Components receive `t` and precomputed label maps from `App` or compute them via Task 1 helpers.
- Existing callbacks/field names stay unchanged.
- Backup assignment callback remains `(deviceId, sourceId)`; the UI adapts around it.

- [ ] **Step 1: Establish compact row markup in Equipment**

Replace per-device large `<article className="entity-card">` blocks with row markup using native `<details>`:

```jsx
<article className="compact-entity-row" key={device.id}>
  <div className="compact-row-main">
    <strong>{deviceLabels.get(device.id)}</strong>
    <span>{device.powerW ? `${device.powerW} W` : t('common.notSet')}</span>
    <span>{device.internalBatteryWh ? `${device.internalBatteryWh} Wh` : t('battery.none')}</span>
    <details className="row-details">
      <summary>{t('actions.details')}</summary>
      <div className="details-fields">
        {/* optional name, category, power, internal battery inputs */}
      </div>
    </details>
    <button type="button" className="text-button danger-button" onClick={() => onRemove(device.id)}>
      {t('actions.remove')}
    </button>
  </div>
</article>
```

All actual inputs remain programmatically labelled; optional Name is last/secondary inside Details.

- [ ] **Step 2: Implement compact BackupSource rows**

Use the same row pattern. Keep type, usable capacity, optional max output editable in Details. Show the generated label and core capacity/max summary collapsed.

- [ ] **Step 3: Implement adaptive assignments**

Use source count:

```jsx
const sourceCount = backupSources.length;
const assignedSourceId = assignments[device.id] ?? '';
const enabled = Boolean(assignedSourceId);
```

Behavior:
- `0`: render compact `No external backup configured` state, no dropdown.
- `1`: checkbox/switch `checked={enabled}`; on true call `onAssignmentChange(device.id, backupSources[0].id)`, on false call `onAssignmentChange(device.id, '')`.
- `2+`: same on/off control; when enabled render selector. If turning on from empty, assign first source deterministically; selector changes the specific source.

Never modify internal battery fields from assignment controls.

- [ ] **Step 4: Add compact CSS and run regression suite**

Add row styles with low vertical padding, single-line summary where space permits, and Details expansion below the row. Preserve responsive wrapping for narrow screens.

Run:

```bash
npm test
npm run build
```

Expected: existing and new tests PASS; build exit 0.

- [ ] **Step 5: Browser smoke and commit**

Manually verify Step 1/2 with 5 devices and 2 sources at 1920 × 1080 collapsed; record actual scroll observation for final Task 9, not yet as a project result.

```bash
git add apps/web/src/components/user-mvp/EquipmentStep.jsx apps/web/src/components/user-mvp/BackupStep.jsx apps/web/src/styles.css
git commit -m "feat: compact equipment and backup steps"
```

Reviewer checks UX-02, UX-06…UX-09, UX-14.

---

### Task 5: Compact Services & Scenario with discoverable validation

**Files:**
- Modify: `apps/web/src/components/user-mvp/ServicesScenarioStep.jsx`
- Modify: `apps/web/src/styles.css`

**Interfaces:**
- Existing service/provider/scenario callbacks remain unchanged.
- Component receives `t`, `deviceLabels`, `serviceLabels`, `providerLabels` as needed.
- Target toggle continues to write only `scenario.targetServiceIds`.

- [ ] **Step 1: Replace service cards with collapsed rows**

For each service render technical/display label, dependency summary, target checkbox, Details, remove. Example structure:

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

Put optional Name, template, variant and role editors inside Details. Keep role filtering/cardinality behavior unchanged.

- [ ] **Step 2: Build dependency summary from selected bindings**

Resolve bound IDs through shared label maps; join compactly with `, `. Do not infer new dependencies. If a required binding is absent, show translated `Incomplete` summary and keep existing validation authoritative.

- [ ] **Step 3: Compact providers/scenario and surface errors**

Render provider as one compact row (`name · availability`). Keep provider name required. Keep outage duration visible. Keep additional loads in a compact checkbox row/grid.

For errors, group by field prefix (`devices.`, `backupSources.`, `services.`, `externalProviders.`, `scenario.`). Add a small error badge to affected entity rows and ensure the relevant Details region is opened or clearly marked when the user navigates to that step. Never hide the top summary error list if it is the only cross-step route to an error.

- [ ] **Step 4: Run full tests/build and browser smoke**

```bash
npm test
npm run build
```

Then manually verify 3 services + 2 providers collapsed at 1920 × 1080 and run existing negative cases: `INVALID_POSITIVE_NUMBER`, `BACKUP_SOURCE_MAX_OUTPUT_EXCEEDED`, `MISSING_EXTERNAL_PROVIDER_AVAILABILITY`, `TEMPLATE_ROLE_CARDINALITY`.

- [ ] **Step 5: Commit and reviewer gate**

```bash
git add apps/web/src/components/user-mvp/ServicesScenarioStep.jsx apps/web/src/styles.css
git commit -m "feat: compact services and scenario step"
```

Reviewer checks UX-10…UX-15 and no service-template semantic change.

---

### Task 6: Result dashboard and allow-listed quick edit

**Files:**
- Create: `apps/web/src/user-mvp/quick-edit.js`
- Create: `apps/web/test/user-mvp/quick-edit.test.js`
- Modify: `apps/web/src/App.jsx`
- Modify: `apps/web/src/components/user-mvp/UserScenarioResult.jsx`
- Modify: `apps/web/src/styles.css`

**Interfaces:**
- `applyQuickEdit(formState, patch)` returns a new form state and only supports `{ sourceId?, usableCapacityWh?, maxOutputPowerW?, outageDurationMinutes? }`.
- `App` passes `onQuickRecalculate(patch)` to Result; callback returns `{ success: true }` or `{ success: false, errors }`.

- [ ] **Step 1: Write failing quick-edit tests**

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { applyQuickEdit } from '../../src/user-mvp/quick-edit.js';

test('quick edit changes only allowed backup fields', () => {
  const state = {
    backupSources: [{ id: 's1', type: 'PowerStation', name: 'X', usableCapacityWh: '480', maxOutputPowerW: '' }],
    scenario: { outageDurationMinutes: '480' },
  };
  const next = applyQuickEdit(state, { sourceId: 's1', usableCapacityWh: '960', maxOutputPowerW: '1000' });
  assert.equal(next.backupSources[0].usableCapacityWh, '960');
  assert.equal(next.backupSources[0].maxOutputPowerW, '1000');
  assert.equal(next.backupSources[0].type, 'PowerStation');
  assert.equal(state.backupSources[0].usableCapacityWh, '480');
});

test('quick edit changes outage duration only when requested', () => {
  const state = { backupSources: [], scenario: { outageDurationMinutes: '480' } };
  const next = applyQuickEdit(state, { outageDurationMinutes: '600' });
  assert.equal(next.scenario.outageDurationMinutes, '600');
});
```

- [ ] **Step 2: Run and verify failure**

```bash
node --test test/user-mvp/quick-edit.test.js
```

Expected: FAIL until helper exists.

- [ ] **Step 3: Implement pure transform and App recalculation callback**

`quick-edit.js` must clone only touched arrays/objects and ignore/reject unsupported patch keys. In `App`:

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

Invalid quick-edit drafts do not mutate global form state and do not replace the last valid result.

- [ ] **Step 4: Rebuild Result markup as decision-first dashboard**

Order:
1. Target service summary/status/availability versus outage.
2. Limiting dependencies + causal paths.
3. Backup summaries with Edit action.
4. Compact Device availability rows.
5. Compact warnings/recommendations only when present.

Implement a small accessible `<dialog>` if supported by the existing browser target, otherwise a simple in-page modal panel with `role="dialog"`, labelled title, Cancel and Recalculate. The quick backup editor exposes only capacity/max output; outage editor exposes only duration. Keep draft values local until `onQuickRecalculate()` succeeds.

- [ ] **Step 5: Run tests/build, browser rerun, commit**

```bash
node --test test/user-mvp/quick-edit.test.js test/user-mvp/integration.test.js
npm test
npm run build
```

Manual smoke: start from accepted AC-12, edit backup capacity or outage, Recalculate without reload, confirm changed result and standard warnings/errors.

```bash
git add apps/web/src/user-mvp/quick-edit.js apps/web/test/user-mvp/quick-edit.test.js apps/web/src/App.jsx apps/web/src/components/user-mvp/UserScenarioResult.jsx apps/web/src/styles.css
git commit -m "feat: add compact result quick editing"
```

Reviewer checks UX-16…UX-20 and standard pipeline reuse.

---

### Task 7: Wire EN/UA through all visible UX without resetting state

**Files:**
- Modify: `apps/web/src/App.jsx`
- Modify: all four `apps/web/src/components/user-mvp/*.jsx`
- Modify: `apps/web/src/styles.css`
- Modify: `apps/web/test/user-mvp/i18n.test.js`

**Interfaces:**
- `App` owns `language`; components receive `t` and label maps built with `t`.
- Language switch changes presentation only; it never calls result invalidation.

- [ ] **Step 1: Expand translation tests for accepted visible domains**

Add assertions for category/type/template/status, one validation error, one warning and each recommendation type in both languages. Assert source `error.code`, `warning.code`, `recommendation.type`, and `target.status` values are unchanged after translation helper calls.

- [ ] **Step 2: Add compact language switch in App header**

```jsx
<div className="language-switch" aria-label={t('language.label')}>
  <button type="button" aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>EN</button>
  <button type="button" aria-pressed={language === 'uk'} onClick={() => setLanguage('uk')}>UA</button>
</div>
```

Changing language must not call `setFormState`, `setOutcome`, `setSubmittedInput`, `setCurrentStep`, or `invalidateResult`.

- [ ] **Step 3: Replace visible literal copy with translation keys**

Translate header, fixture notice, step labels, field labels/options, helper text, actions, empty states, validation messages, warnings, recommendations and displayed status. Preserve raw IDs/codes for diagnostics only; if codes are shown, display them secondary to translated human text.

Build entity label maps using the current translator so category/type/template labels update immediately on language change while custom user-entered names stay unchanged.

- [ ] **Step 4: Run focused/full tests and build**

```bash
node --test test/user-mvp/i18n.test.js test/user-mvp/entity-labels.test.js
npm test
npm run build
```

Expected: PASS; no package changes.

- [ ] **Step 5: Browser state-preservation smoke and commit**

With non-default edited data and a valid Result, toggle EN → UA → EN. Confirm same step, same form values, same assignments, and same numeric/current result.

```bash
git add apps/web/src/App.jsx apps/web/src/components/user-mvp apps/web/src/styles.css apps/web/src/user-mvp/i18n.js apps/web/test/user-mvp/i18n.test.js
git commit -m "feat: add English Ukrainian interface switch"
```

Reviewer checks UX-25…UX-27.

---

### Task 8: Complete density/accessibility styling and controlled UX fixture

**Files:**
- Modify: `apps/web/src/styles.css`
- Modify: `apps/web/test/user-mvp/fixtures.js` only if a reusable controlled fixture is useful for non-browser tests; do not change the production initial fixture merely to satisfy density.

**Interfaces:**
- CSS classes introduced in Tasks 3–7 are finalized here.
- No JavaScript/domain behavior changes unless a layout defect exposes a real requirement; such a defect gets a separate reviewer/user decision if it changes semantics.

- [ ] **Step 1: Compress global chrome**

Reduce vertical cost of `.hero`, `.fixture-notice`, `.step-navigation`, `.wizard-panel`, section headings and action bars at desktop widths. Keep readable spacing and visible focus states. Avoid fixed heights that clip content.

- [ ] **Step 2: Finalize compact-row/details/dashboard CSS**

Use grid/flex layouts that keep collapsed rows one visual line where practical at 1920 px and wrap gracefully at smaller widths. Expanded Details may grow vertically. Ensure status remains textual, focus outlines remain visible, and destructive actions remain distinguishable by text/iconography rather than color alone.

- [ ] **Step 3: Build exact UX-01 manual fixture**

Configure in browser:
- 5 valid Devices;
- 2 valid BackupSources;
- 3 valid ServiceInstances;
- 2 valid ExternalProviders;
- all 3 services selected as targets on Result.

Do not invent measured device characteristics; use controlled fixture values explicitly labelled/test-only where recorded.

- [ ] **Step 4: Verify 1920 × 1080 no-scroll criterion**

Set CSS viewport exactly `1920 × 1080`. On each default/collapsed step verify `document.documentElement.scrollHeight <= document.documentElement.clientHeight` (or equivalent browser observation). Record actual pass/fail for Step 1–4. Expanded Details/dialogs are excluded.

- [ ] **Step 5: Accessibility/manual interaction check and commit**

Keyboard-check earlier stepper buttons, Details summary, language switch, form inputs, Back/Continue/Run, and quick-edit dialog/panel. Confirm no keyboard trap.

```bash
git add apps/web/src/styles.css apps/web/test/user-mvp/fixtures.js
git commit -m "style: finalize UX polish density and accessibility"
```

Reviewer checks UX-01, UX-14, UX-23 and spec Section 14.

---

### Task 9: Regression verification, evidence, status update

**Files:**
- Modify: `apps/web/test/user-mvp/integration.test.js`
- Modify: `apps/web/test/user-mvp/ux-regression.test.js`
- Modify: `docs/STATUS.md`

**Interfaces:**
- No production behavior should be introduced in this task except a fix required by a failing accepted test/review; fixes must rerun the relevant gate.

- [ ] **Step 1: Strengthen AC-12 unchanged-output regression**

Use the existing controlled AC-12 fixture and assert the accepted numerical contract for identical normalized input:

```js
assert.equal(outcome.estimation.sourceResults[0].totalPowerW, 80);
assert.equal(outcome.estimation.sourceResults[0].runtimeMinutes, 360);
assert.equal(outcome.simulation.targetResults[0].availabilityDurationMinutes, 360);
assert.equal(outcome.simulation.targetResults[0].status, 'Limited');
```

Also assert Router/ONT 360 and Laptop 480 where the existing fixture exposes them. Do not assert that UX-translated labels are simulation semantics.

- [ ] **Step 2: Run full automated verification**

From `apps/web`:

```bash
cmd.exe /d /c npm test
cmd.exe /d /c npm run build
```

If not on Windows, equivalent `npm test` and `npm run build` are acceptable. Record actual counts/version/build result; do not copy prior `100 passed` as the new result.

- [ ] **Step 3: Run final browser acceptance**

Record factual results for:
- UX-01 exact 1920 × 1080 density fixture, Steps 1–4;
- backward stepper from Step 4 to Steps 1/2/3;
- retained Back button;
- upstream edit causing stale result and requiring new run;
- quick edit backup + quick edit outage reruns without reload;
- EN/UA switch preserving state/result;
- negative validation cases and collapsed-detail discoverability;
- browser console warnings/errors if inspected.

- [ ] **Step 4: Whole-branch review**

Reviewer compares the UX branch against its merge base and explicitly checks:
- no `apps/web/src/simulation/**` changes;
- no estimator formula/template/recommendation semantic changes;
- no `package.json`/lockfile dependency changes;
- UX-01…UX-30 coverage;
- no Critical/Major findings before merge proposal.

- [ ] **Step 5: Update STATUS only with observed evidence and commit**

Update `docs/STATUS.md` with actual commit/test/build/browser/review facts. Keep controlled fixture values labelled as test fixtures. Do not mark deployed/live until merge + Pages deployment + separate live smoke actually occur.

```bash
git add apps/web/test/user-mvp/integration.test.js apps/web/test/user-mvp/ux-regression.test.js docs/STATUS.md
git commit -m "docs: record UX polish verification"
```

At this point the branch is eligible for a separate user-approved merge/deploy decision under the existing repository workflow.

---

## Plan self-review

Spec coverage mapping:
- UX-01, density/accessibility → Tasks 4, 5, 8, 9.
- UX-02…UX-06, UX-11/12 naming → Task 1 plus compact UI Tasks 4/5.
- UX-07…UX-09 assignments/backup semantics → Task 4.
- UX-10, UX-13…UX-15 services/details/errors → Task 5.
- UX-16…UX-20 Result/quick edit → Task 6.
- UX-21…UX-24 navigation/stale result → Task 3.
- UX-25…UX-27 EN/UA → Tasks 2 and 7.
- UX-28/29 regression/scope protection → Tasks 1–9, final gate Task 9.
- UX-30 evidence → Task 9.

No new dependency, backend, simulation-engine change, estimator formula change, template semantic change, or recommendation semantic change is planned.
