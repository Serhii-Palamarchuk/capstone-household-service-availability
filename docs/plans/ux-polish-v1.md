# UX Polish v1 — план реалізації

> **Для агентних виконавців:** ОБОВ’ЯЗКОВИЙ SUB-SKILL: використовуйте `superpowers:subagent-driven-development` (рекомендовано) або `superpowers:executing-plans`, щоб реалізовувати цей план task-by-task. Для відстеження кроків використовується синтаксис checkbox (`- [ ]`).

**Мета:** зробити чинний чотирикроковий User-facing MVP компактним, придатним до швидкого коригування, двомовним (EN/UA) та таким, що можна перевірити за погодженим density baseline `1920 × 1080`, без зміни семантики estimator/engine.

**Архітектура:** залишити `App.jsx` власником стану wizard/form/result. Винести pure UX helpers для fallback/display labels сутностей, перекладу, invalidation result і quick-edit form transforms, щоб чинний Node test runner міг перевіряти поведінку без додавання UI testing dependency. Замінити великі cards на compact rows + native `<details>` і залишити всі розрахунки на чинному `normalizeUserMvpForm()` → `runUserScenario()` path.

**Технологічний стек:** React 19, JavaScript/JSX, CSS, вбудований Node `node:test`, Vite 8. Нові runtime або test dependencies не додаються.

**Специфікація:** `docs/specs/ux-polish-v1.md`  
**Acceptance:** `docs/specs/ux-polish-v1-acceptance.md` (`UX-01…UX-30`)

## Глобальні обмеження

- Зберегти без змін `Simulation Engine v1`, формули Availability Estimator, семантику статусів, service-template role semantics, recommendation rules і погоджені W/Wh assumptions.
- Не додавати backend, database, cloud service, optimizer, dynamic load model, нову domain entity, third-party i18n package або test framework.
- English залишається початковою мовою.
- Перемикання UA/EN має зберігати form state, assignments, current step і поточний валідний result.
- Custom `Name` для Device/BackupSource/Service є optional для користувача, але normalized domain entities зберігають deterministic non-empty `name` values.
- `ExternalProvider.name` залишається required.
- Forward navigation залишається через `Continue` / `Run scenario`; stepper buttons навігують лише назад.
- На Steps 2–4 зберігається компактна дія `Back`.
- Upstream form changes invalidate наявний result; navigation і language changes цього не роблять.
- Quick edit змінює лише `usableCapacityWh`, `maxOutputPowerW` і outage duration.
- Quick edit використовує той самий normalization/estimator/engine pipeline.
- У CSS viewport `1920 × 1080` default/collapsed state усіх чотирьох кроків має вміщуватися без vertical page scroll для 5 Devices, 2 BackupSources, 3 ServiceInstances, 2 ExternalProviders; на Step 4 усі 3 services є targets.
- Controlled fixture values залишаються test fixtures, а не реальними вимірюваннями автономності.

## Карта файлів

**Створити**
- `apps/web/src/user-mvp/entity-labels.js` — fallback names, display labels, duplicate disambiguation.
- `apps/web/src/user-mvp/i18n.js` — EN/UA dictionaries і helpers для translated UI messages.
- `apps/web/src/user-mvp/result-state.js` — pure helper для invalidation result.
- `apps/web/src/user-mvp/quick-edit.js` — pure allow-listed quick-edit transform.
- `apps/web/test/user-mvp/entity-labels.test.js`
- `apps/web/test/user-mvp/i18n.test.js`
- `apps/web/test/user-mvp/result-state.test.js`
- `apps/web/test/user-mvp/quick-edit.test.js`

**Змінити**
- `apps/web/src/user-mvp/form-state.js`
- `apps/web/src/App.jsx`
- `apps/web/src/components/user-mvp/EquipmentStep.jsx`
- `apps/web/src/components/user-mvp/BackupStep.jsx`
- `apps/web/src/components/user-mvp/ServicesScenarioStep.jsx`
- `apps/web/src/components/user-mvp/UserScenarioResult.jsx`
- `apps/web/src/styles.css`
- `apps/web/test/user-mvp/form-state.test.js`
- `apps/web/test/user-mvp/integration.test.js`
- `docs/STATUS.md` — лише після фактичної verification.

Не змінювати `apps/web/src/simulation/**`, implementation формул estimator, service-template role definitions, recommendation rules, `package.json` або lockfile.

---

### Task 1: Optional custom names + deterministic labels

**Файли:**
- Створити: `apps/web/src/user-mvp/entity-labels.js`
- Створити: `apps/web/test/user-mvp/entity-labels.test.js`
- Змінити: `apps/web/src/user-mvp/form-state.js`
- Змінити: `apps/web/test/user-mvp/form-state.test.js`

**Інтерфейси:**
- `fallbackDeviceName(device)`
- `fallbackBackupSourceName(source)`
- `fallbackServiceName(service)`
- `deviceDisplayLabels(devices, t)` → `Map<id,string>`
- `backupSourceDisplayLabels(sources, t)` → `Map<id,string>`
- `serviceDisplayLabels(services, t)` → `Map<id,string>`

- [ ] **Step 1: Написати failing tests для labels**

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

- [ ] **Step 2: Підтвердити red**

Запускати з `apps/web`:

```bash
node --test test/user-mvp/entity-labels.test.js
```

Очікування: FAIL, оскільки module ще не існує.

- [ ] **Step 3: Реалізувати fallbacks/display labels**

Почати `entity-labels.js` з:

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

Додати display-label builders, які:
1. будують translated technical label через `t`;
2. пригнічують custom name, якщо після trim/case normalization він дорівнює raw category/type/template або technical label;
3. інакше рендерять `Custom name (Technical · Label)`;
4. додають `#1`, `#2` лише коли final labels конфліктують.

- [ ] **Step 4: Зробити custom names optional у normalization**

У `form-state.js` parsing name для Device/BackupSource/Service має стати optional text + fallback. Приклад Device path:

```js
const customName = typeof device.name === 'string' ? device.name.trim() : '';
const name = customName || fallbackDeviceName({ ...device, powerW });
```

Застосувати equivalent fallback після normalized numeric/template fields для BackupSource і Service. `normalizeExternalProvider()` залишити без змін, щоб provider name залишався required.

Додати form-state tests, які підтверджують, що empty Device/BackupSource/Service names normalize успішно, а empty provider name усе ще повертає `REQUIRED_FIELD`.

- [ ] **Step 5: Підтвердити green і зробити commit**

```bash
node --test test/user-mvp/entity-labels.test.js test/user-mvp/form-state.test.js
git add apps/web/src/user-mvp/entity-labels.js apps/web/src/user-mvp/form-state.js apps/web/test/user-mvp/entity-labels.test.js apps/web/test/user-mvp/form-state.test.js
git commit -m "feat: add optional entity names and labels"
```

Reviewer gate: UX-03…UX-06, UX-11, UX-12; без змін simulation/template semantics.

---

### Task 2: Локальний EN/UA translation layer

**Файли:**
- Створити: `apps/web/src/user-mvp/i18n.js`
- Створити: `apps/web/test/user-mvp/i18n.test.js`

**Інтерфейси:**
- `SUPPORTED_LANGUAGES = ['en', 'uk']`
- `createTranslator(language)`
- `translateStatus(status, t)`
- `translateValidationError(error, t)`
- `translateWarning(warning, t, nameFor)`
- `translateRecommendation(recommendation, t, nameFor)`

- [ ] **Step 1: Написати failing translation tests**

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

- [ ] **Step 2: Підтвердити red**

```bash
node --test test/user-mvp/i18n.test.js
```

Очікування: FAIL, оскільки module ще не існує.

- [ ] **Step 3: Реалізувати translator**

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

Розширити dictionaries на весь visible header/step/field/helper/action text, category/type/template labels, statuses, existing form/service-builder validation codes, estimator warnings і recommendation types. Translation helpers маплять stable code/type → human message; identifiers вони ніколи не mutate.

- [ ] **Step 4: Додати tests на збереження identifiers**

Для одного validation error, warning, status і кожного recommendation type викликати translation helpers і assert, що original `.code`, `.type`, `.status` values не змінилися.

- [ ] **Step 5: Підтвердити green і зробити commit**

```bash
node --test test/user-mvp/i18n.test.js test/user-mvp/entity-labels.test.js
git add apps/web/src/user-mvp/i18n.js apps/web/test/user-mvp/i18n.test.js
git commit -m "feat: add English Ukrainian UI copy"
```

Reviewer gate: foundation для UX-25…UX-27; dependency files без змін.

---

### Task 3: Backward stepper + stale-result state

**Файли:**
- Створити: `apps/web/src/user-mvp/result-state.js`
- Створити: `apps/web/test/user-mvp/result-state.test.js`
- Змінити: `apps/web/src/App.jsx`

**Інтерфейси:**
- `invalidateResultState({ outcome, submittedInput, resultStale })`
- `App` володіє `language`, `currentStep`, `formState`, `outcome`, `submittedInput`, `resultStale`.

- [ ] **Step 1: Написати failing invalidation test**

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

- [ ] **Step 2: Підтвердити red, потім реалізувати helper**

```bash
node --test test/user-mvp/result-state.test.js
```

Реалізувати:

```js
export function invalidateResultState({ outcome, submittedInput, resultStale }) {
  return {
    outcome: null,
    submittedInput: null,
    resultStale: outcome ? true : resultStale,
  };
}
```

- [ ] **Step 3: Підключити invalidation result в App**

Додати:

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

Викликати `invalidateResult()` перед кожним handler, який змінює Devices, BackupSources, assignments, Services, providers, target/additional loads або outage duration. Не викликати його для `setLanguage()` чи pure step navigation. Успішний `submitScenario()` встановлює `resultStale(false)`.

- [ ] **Step 4: Зробити попередні stepper items справжніми buttons**

Для кожного step index `< currentStep` рендерити keyboard-focusable `<button type="button" onClick={() => setCurrentStep(index)}>` всередині stepper item. Current/future steps не клікабельні. Existing bottom Back callbacks зберегти.

Якщо `resultStale`, показувати компактний translated text біля stepper: `Result needs recalculation`; старий Result не показувати як поточний.

- [ ] **Step 5: Перевірити і зробити commit**

```bash
node --test test/user-mvp/result-state.test.js
npm run build
git add apps/web/src/user-mvp/result-state.js apps/web/test/user-mvp/result-state.test.js apps/web/src/App.jsx
git commit -m "feat: add backward navigation and stale result state"
```

Reviewer gate: UX-21…UX-24.

---

### Task 4: Compact Equipment + Backup

**Файли:**
- Змінити: `apps/web/src/components/user-mvp/EquipmentStep.jsx`
- Змінити: `apps/web/src/components/user-mvp/BackupStep.jsx`
- Змінити: `apps/web/src/styles.css`
- Змінити: `apps/web/src/App.jsx`, щоб передавати `t` і display-label maps.

**Інтерфейси:**
- Existing mutation callbacks залишаються без змін.
- Components отримують `t`, Device label map і BackupSource label map.

- [ ] **Step 1: Замінити Device cards на compact rows**

Використовувати один collapsed row на device + native `<details>`:

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

Зберегти всі чотири реальні inputs; Name має бути visibly optional і secondary.

- [ ] **Step 2: Замінити BackupSource cards на compact rows**

Collapsed row показує generated label, capacity/max summary, Details, remove. Details містить optional Name, type, usable capacity, optional max output.

- [ ] **Step 3: Реалізувати точну adaptive assignment behavior**

```js
const sourceCount = backupSources.length;
const assignedSourceId = assignments[device.id] ?? '';
const enabled = Boolean(assignedSourceId);
```

Правила:
- `sourceCount === 0`: без selector/toggle; показати translated no-source text.
- `sourceCount === 1`: лише checkbox/toggle. On → assign `backupSources[0].id`; Off → assign `''`.
- `sourceCount >= 2`: checkbox/toggle + selector, коли On. Увімкнення з empty призначає first source; selector змінює source.

Цей control ніколи не змінює internal battery.

- [ ] **Step 4: Додати compact CSS**

Додати малий vertical padding, one-line desktop summary, expanded Details під row, visible focus styles і responsive wrapping. Не використовувати fixed heights, які clip expanded content.

- [ ] **Step 5: Перевірити і зробити commit**

```bash
npm test
npm run build
git add apps/web/src/App.jsx apps/web/src/components/user-mvp/EquipmentStep.jsx apps/web/src/components/user-mvp/BackupStep.jsx apps/web/src/styles.css
git commit -m "feat: compact equipment and backup steps"
```

Manual reviewer check при `1920 × 1080` з 5 devices/2 sources; actual pass/fail записується лише у final verification.

Reviewer gate: UX-02, UX-06…UX-09, UX-14.

---

### Task 5: Compact Services & Scenario + discoverable validation

**Файли:**
- Змінити: `apps/web/src/components/user-mvp/ServicesScenarioStep.jsx`
- Змінити: `apps/web/src/styles.css`
- Змінити: `apps/web/src/App.jsx`, щоб передавати translator/label maps.

- [ ] **Step 1: Замінити service cards на collapsed rows**

Кожен row показує display label, dependency summary, target control, Details, remove.

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

Details містить optional Name, template, variant і existing dependency-role editors. Role filtering/cardinality rules залишаються без змін.

- [ ] **Step 2: Побудувати dependency summary з actual bindings**

Resolve selected IDs через Device/Service/Provider label maps і join через `, `. Missing required binding показує translated `Incomplete`; не infer і не auto-fill dependencies.

- [ ] **Step 3: Ущільнити providers і scenario controls**

Provider row показує required name + availability. Outage duration лишається visible. Additional loads використовують compact checkbox/grid controls. Прибрати окремий duplicated target-service fieldset, бо target selection тепер знаходиться на service rows; underlying `targetServiceIds` залишається без змін.

- [ ] **Step 4: Зробити collapsed errors discoverable**

Групувати current errors за field prefix і показувати compact error badge/message на affected rows. Коли affected entity step відкривається, його Details block має бути visibly marked і expanded. Top scenario error summary зберегти для cross-step routing.

- [ ] **Step 5: Перевірити і зробити commit**

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

**Файли:**
- Створити: `apps/web/src/user-mvp/quick-edit.js`
- Створити: `apps/web/test/user-mvp/quick-edit.test.js`
- Змінити: `apps/web/src/App.jsx`
- Змінити: `apps/web/src/components/user-mvp/UserScenarioResult.jsx`
- Змінити: `apps/web/src/styles.css`

**Інтерфейси:**
- `applyQuickEdit(formState, patch)` приймає лише `sourceId`, `usableCapacityWh`, `maxOutputPowerW`, `outageDurationMinutes`.
- `App.onQuickRecalculate(patch)` повертає `{ success: true }` або `{ success: false, errors }`.

- [ ] **Step 1: Написати failing quick-edit tests**

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

- [ ] **Step 2: Підтвердити red, потім реалізувати pure transform**

```bash
node --test test/user-mvp/quick-edit.test.js
```

`applyQuickEdit()` clone лише touched containers. Unknown patch keys відхиляти через `TypeError`. Source patch вимагає existing `sourceId`; outage-only patch — ні.

- [ ] **Step 3: Реалізувати точний App recalculation callback**

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

Invalid quick-edit draft не mutate global form/result state.

- [ ] **Step 4: Перебудувати Result у decision-first order**

Порядок:
1. target service/status/availability vs outage;
2. limiting dependencies + causal paths;
3. compact used BackupSource summaries + Edit;
4. compact Device availability rows;
5. warnings/recommendations лише коли вони є.

Використати in-page conditional panel з `role="dialog"`, `aria-modal="true"`, labelled heading, Cancel і Recalculate. Backup dialog показує лише capacity/max output; outage dialog — лише outage duration. Draft fields тримати у local component state до успішного recalculation.

- [ ] **Step 5: Перевірити і зробити commit**

```bash
node --test test/user-mvp/quick-edit.test.js test/user-mvp/integration.test.js
npm test
npm run build
git add apps/web/src/user-mvp/quick-edit.js apps/web/test/user-mvp/quick-edit.test.js apps/web/src/App.jsx apps/web/src/components/user-mvp/UserScenarioResult.jsx apps/web/src/styles.css
git commit -m "feat: add compact result quick editing"
```

Reviewer gate: UX-16…UX-20.

---

### Task 7: Провести EN/UA через увесь visible UI

**Файли:**
- Змінити: `apps/web/src/App.jsx`
- Змінити: `apps/web/src/components/user-mvp/EquipmentStep.jsx`
- Змінити: `apps/web/src/components/user-mvp/BackupStep.jsx`
- Змінити: `apps/web/src/components/user-mvp/ServicesScenarioStep.jsx`
- Змінити: `apps/web/src/components/user-mvp/UserScenarioResult.jsx`
- Змінити: `apps/web/src/styles.css`
- Змінити: `apps/web/test/user-mvp/i18n.test.js`

- [ ] **Step 1: Додати language switch**

```jsx
<div className="language-switch" aria-label={t('language.label')}>
  <button type="button" aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>EN</button>
  <button type="button" aria-pressed={language === 'uk'} onClick={() => setLanguage('uk')}>UA</button>
</div>
```

Цей handler змінює лише language state.

- [ ] **Step 2: Перекласти кожен visible literal**

Перенести header, fixture notice, step names, field labels/options, helper text, buttons, empty states, validation messages, warnings, recommendations і displayed statuses у translation keys. Category/type/template values залишаються stable identifiers, але їхні visible labels використовують `t`.

- [ ] **Step 3: Перераховувати display-label maps із current translator**

В `App` derive Device/BackupSource/Service label maps на кожному render через current `t`. Custom names не змінюються; technical parts перемикають мову одразу.

- [ ] **Step 4: Розширити translation tests**

Тестувати обидві мови для одного category/type/template/status, усіх current recommendation types, missing-max warning і representative validation codes. Assert, що source identifiers не змінюються.

- [ ] **Step 5: Перевірити, виконати browser smoke для state preservation і зробити commit**

```bash
node --test test/user-mvp/i18n.test.js test/user-mvp/entity-labels.test.js
npm test
npm run build
git add apps/web/src/App.jsx apps/web/src/components/user-mvp apps/web/src/styles.css apps/web/src/user-mvp/i18n.js apps/web/test/user-mvp/i18n.test.js
git commit -m "feat: add English Ukrainian interface switch"
```

Browser smoke з edited form + valid Result: EN → UA → EN має зберегти current step, data, assignments і current numeric result.

Reviewer gate: UX-25…UX-27.

---

### Task 8: Density/accessibility polish + final verification

**Файли:**
- Змінити: `apps/web/src/styles.css`
- Змінити: `apps/web/test/user-mvp/integration.test.js`
- Змінити: `docs/STATUS.md` лише після verification.

- [ ] **Step 1: Ущільнити global chrome**

Зменшити vertical space у `.hero`, `.fixture-notice`, `.step-navigation`, `.wizard-panel`, section headings і action bars на desktop. Зберегти visible focus indicators і не використовувати fixed heights, які clip expanded content.

- [ ] **Step 2: Посилити AC-12 unchanged-output regression**

Використовуючи existing controlled fixture, assert, що identical normalized input усе ще дає:

```js
assert.equal(outcome.estimation.sourceResults[0].totalPowerW, 80);
assert.equal(outcome.estimation.sourceResults[0].runtimeMinutes, 360);
assert.equal(outcome.simulation.targetResults[0].availabilityDurationMinutes, 360);
assert.equal(outcome.simulation.targetResults[0].status, 'Limited');
```

Також зберегти checks Router/ONT 360 і Laptop 480 там, де fixture їх expose. Не трактувати translated/display labels як simulation semantics.

- [ ] **Step 3: Запустити full automated verification**

У Windows-середовищі користувача:

```bash
cmd.exe /d /c npm test
cmd.exe /d /c npm run build
```

Зафіксувати свіжі actual test count, failures, Vite version/build outcome. Ніколи не повторно використовувати попередні `100 passed` як новий результат.

- [ ] **Step 4: Провести exact browser acceptance**

При CSS viewport `1920 × 1080` налаштувати 5 valid Devices, 2 valid BackupSources, 3 valid ServiceInstances, 2 valid ExternalProviders і вибрати всі 3 services як targets для Result.

Для кожного default/collapsed Step 1–4 перевірити відсутність vertical page scroll через:

```js
document.documentElement.scrollHeight <= document.documentElement.clientHeight
```

Також перевірити:
- Step 4 → direct stepper navigation до Steps 1/2/3;
- `Back` залишається usable;
- upstream change invalidate Result і вимагає new run;
- quick-edit backup rerun без reload;
- quick-edit outage rerun без reload;
- EN/UA switch зберігає state/result;
- validation залишається discoverable з collapsed UI;
- keyboard може керувати stepper, Details, language switch, Back/Continue/Run і dialog actions;
- browser console state, якщо він перевірявся.

Фіксувати лише фактично observed results.

- [ ] **Step 5: Whole-branch review, STATUS evidence і commit**

Reviewer порівнює branch з merge base і перевіряє:
- немає `apps/web/src/simulation/**` changes;
- немає змін estimator formula/template/recommendation semantics;
- немає package/lockfile dependency changes;
- coverage UX-01…UX-30;
- немає unresolved Critical/Major finding перед merge proposal.

Оновити `docs/STATUS.md` фактичними implementation commits/test/build/browser/review evidence. Не позначати deployed/live до подальших merge + Pages deployment + окремого live smoke.

```bash
git add apps/web/src/styles.css apps/web/test/user-mvp/integration.test.js docs/STATUS.md
git commit -m "docs: record UX polish verification"
```

Після цього branch може бути винесена на окреме user-approved рішення щодо merge/deploy.

---

## Self-review: карта покриття

- UX-01 → Tasks 4, 5, 8.
- UX-02…UX-06, UX-11/12 → Task 1 + compact UI Tasks 4/5.
- UX-07…UX-09 → Task 4.
- UX-10, UX-13…UX-15 → Task 5.
- UX-16…UX-20 → Task 6.
- UX-21…UX-24 → Task 3.
- UX-25…UX-27 → Tasks 2 і 7.
- UX-28/UX-29 → усі tasks, final gate Task 8.
- UX-30 → Task 8.

Placeholder scan: немає `TBD`, `TODO`, conditional implementation branch або unresolved interface choice. План навмисно не додає нових dependency/backend/domain scope.
