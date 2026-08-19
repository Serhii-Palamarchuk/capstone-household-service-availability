# Поточний стан проєкту

## Поточний етап

Реалізація `Simulation Engine v1`.

## Активне завдання

`Task 8 — Повне acceptance coverage і Reviewer gate`: готове до передачі агенту в ролі `Developer`.

`Task 7 — Shared services, determinism, immutability і rerun` прийнято після correction round 1 і повторного fresh незалежного review.

## Останнє завершене

- затверджено `docs/DOMAIN_MODEL.md`;
- затверджено `docs/SIMULATION.md`;
- сформовано `docs/TEST_SCENARIOS.md`;
- підготовлено й самоперевірено `docs/plans/simulation-engine-v1.md`;
- налаштовано спільний контекст для ChatGPT, Claude Code, Codex і GitHub Copilot;
- синхронізовано `docs/specs/repository-workflow.md`;
- реалізовано й прийнято після незалежного review `Task 1 — Runtime harness і constants` (`apps/web/package.json`, `apps/web/src/simulation/constants.js`, `apps/web/test/simulation/constants.test.js`);
- реалізовано й прийнято після повторного незалежного review `Task 2 — Model index і structural Scenario validation` (`apps/web/src/simulation/model-index.js`, `apps/web/src/simulation/validation.js`, `apps/web/test/simulation/fixtures.js`, `apps/web/test/simulation/validation.test.js`);
- реалізовано й прийнято після четвертого незалежного review `Task 3 — Reachable-subgraph validation і cycles` (`apps/web/src/simulation/validation.js`, `apps/web/test/simulation/validation.test.js`): reachable DFS validation, cycle detection/canonicalization, error deduplication і deterministic sorting;
- findings Task 3 виправлено: source-файли не містять literal NUL bytes; regression tests доводять cycle rotation і `path` як останній sort tie-breaker;
- реалізовано й прийнято після незалежного review `Task 4 — DFS availability calculation і statuses` (`apps/web/src/simulation/calculate.js`, `apps/web/test/simulation/calculation.test.js`): `calculateServiceResults()` — рекурсивний DFS з memoization, `T(Service) = min(dependencies)` без clip до `H`, статуси `Available`/`Limited`/`Unavailable`; `limitingDependencyIds`/`causalPaths` поки порожні (Task 5).
- реалізовано й прийнято після fresh незалежного review `Task 5 — Limiting leaves і causal paths` (`apps/web/src/simulation/calculate.js`, `apps/web/test/simulation/causes.test.js`): для `Limited`/`Unavailable` поширюються всі рівнозначні leaf-bottlenecks і causal paths, із дедуплікацією та лексикографічним сортуванням.
- реалізовано й прийнято після fresh незалежного review `Task 6 — Public simulate() contract` (`apps/web/src/simulation/simulate.js`, `apps/web/test/simulation/calculation.test.js`, `apps/web/test/simulation/validation.test.js`): публічний `simulate(model, scenario)` повертає взаємовиключні success/failure outcomes без часткових результатів при validation errors.

## Поточні ролі

- `Developer`: потрібно призначити для Task 8;
- `Reviewer`: повторний fresh review Task 7 correction round 1 завершено з `ACCEPTED`;
- координація та рішення: користувач + ChatGPT.

## Відкриті питання

Немає.

## Остання перевірка

Незалежний review Task 1: `accepted`, відкритих findings немає.

Повторний незалежний review Task 2 correction (fix commit `e4cd10b`): `accepted`, відкритих findings немає.

Task 3 correction #3: четвертий незалежний review fix commit `0cbf6b9` — `accepted`, відкритих findings немає.

- `node --version`: `v24.18.0`.
- Незалежний targeted run (`cmd.exe /d /c "npm test -- test/simulation/validation.test.js"`): exit `0`, `25 passed, 0 failed`.
- Незалежний full suite (`cmd.exe /d /c npm test`): exit `0`, `27 passed, 0 failed`.
- Scope: fix commit змінює лише `apps/web/test/simulation/validation.test.js`; production code, dependencies і Task 4 не змінено.
- NUL verification: `apps/web/src/simulation/validation.js` і `apps/web/test/simulation/validation.test.js` містять `0` NUL bytes.
- Counterfactual probe без path tie-breaker повернув reversed paths (`service-d`, `service-b`) і `matchesExpected=false`, тому regression assertion справді захищає останній sort key.

Task 4: незалежний review implementation commit `6d8e99e` — `accepted`, відкритих findings немає.

- `node --version`: `v24.18.0`.
- Незалежний targeted run (`npm test -- test/simulation/calculation.test.js`, git-bash): `6 passed, 0 failed`.
- Незалежний full suite (`npm test`, git-bash): `33 passed, 0 failed`.
- NUL verification: `apps/web/src/simulation/calculate.js` і `apps/web/test/simulation/calculation.test.js` містять `0` NUL bytes.
- Scope: implementation commit змінює лише два файли, перелічені в плані для Task 4; dependencies і UI isolation (`no react/window/document` imports) не порушено.
- Values перевірені проти `docs/TEST_SCENARIOS.md` TS-01…TS-06 (включно з нетривіальними T-розрахунками для TS-05/TS-06) і `docs/SIMULATION.md` §3–5 (T-формула, status boundaries, DFS+memoization contract) — відповідність підтверджено.
- `limitingDependencyIds`/`causalPaths` коректно залишені порожніми на цьому task відповідно до scope Task 5.

Task 5: Developer implementation commit `d22477d` — handoff зафіксовано в `6983cc3`.

- RED run (`cmd.exe /d /c npm test -- test/simulation/causes.test.js`): exit `1`, `0 passed, 2 failed`; обидва tests очікувано зафіксували порожні `limitingDependencyIds` до реалізації.
- GREEN targeted run (`cmd.exe /d /c npm test -- test/simulation/causes.test.js test/simulation/calculation.test.js`): exit `0`, `8 passed, 0 failed`.
- Full suite (`cmd.exe /d /c npm test`): exit `0`, `35 passed, 0 failed`.
- Scope: implementation commit змінює лише `apps/web/src/simulation/calculate.js` і `apps/web/test/simulation/causes.test.js`; dependencies, UI і наступні Task не змінено.
- Self-review: перевірено TS-03…TS-09 і `docs/SIMULATION.md` §6, §10–12; рівні `T` дають усі причини, nested `Service` лишаються у path, leaf `id` не дублюються, а `Available` має порожні cause-поля.

Task 5: fresh незалежний review implementation commit `d22477d` — `accepted`, відкритих findings немає.

- `node --version`: `v24.18.0`.
- Незалежний targeted run (`cmd.exe /d /c npm test -- test/simulation/causes.test.js test/simulation/calculation.test.js`): exit `0`, `8 passed, 0 failed`.
- Незалежний full suite (`cmd.exe /d /c npm test`): exit `0`, `35 passed, 0 failed`.
- Незалежний edge-case probe: exit `0`, `13 assertions passed`; перевірено TS-03…TS-09, `Available` empty causes, TS-08 equal minima на різних рівнях, non-minimum exclusion, self-contained nested paths, sorting/deduplication і input immutability.
- NUL verification: `apps/web/src/simulation/calculate.js`, `apps/web/test/simulation/causes.test.js`, `apps/web/test/simulation/calculation.test.js` і review diff package містять `0` literal NUL bytes.
- Scope: `d22477d` змінює лише два Task 5 files; `6983cc3` змінює лише operational `docs/STATUS.md`; dependencies, React/UI, backend і Task 6 не змінено.
- Contract: реалізація відповідає `docs/SIMULATION.md` §6, §10–12 та `docs/TEST_SCENARIOS.md` TS-03…TS-09: усі equal-minimum branches поширюються до унікальних leaf IDs, усі distinct causal paths зберігаються й сортуються, а `Available` causes порожні.

Task 6: Developer implementation commit `96fe5b8` — очікується fresh незалежний review.

- RED full suite (`cmd.exe /d /c npm test`): exit `1`, `4 passed, 2 failed`; обидві нові contract suites очікувано завершилися `ERR_MODULE_NOT_FOUND` для відсутнього `simulate.js`.
- GREEN targeted run (`cmd.exe /d /c npm test -- test/simulation/calculation.test.js test/simulation/validation.test.js`): exit `0`, `33 passed, 0 failed`.
- GREEN full suite (`cmd.exe /d /c npm test`): exit `0`, `37 passed, 0 failed`.
- Scope: `96fe5b8` змінює лише `apps/web/src/simulation/simulate.js`, `apps/web/test/simulation/calculation.test.js` і `apps/web/test/simulation/validation.test.js`; dependencies, React/UI і наступні tasks не змінено.
- Contract: `simulate(model, scenario)` створює index, виконує повну validation до calculation, повертає лише `{ success: false, errors }` при errors або `{ success: true, targetResults, serviceResults }` при success; `targetResults` зберігає порядок `targetServiceIds`.

Task 6: fresh незалежний review implementation commit `96fe5b8` — `accepted`, відкритих findings немає.

- `node --version`: `v24.18.0`.
- Незалежний targeted run (`cmd.exe /d /c "npm test -- test/simulation/calculation.test.js test/simulation/validation.test.js"`): exit `0`, `33 passed, 0 failed`.
- Незалежний full suite (`cmd.exe /d /c npm test`): exit `0`, `37 passed, 0 failed`.
- Незалежний edge-case probe: exit `0`, `15 assertions passed`; перевірено exact success/failure keys, multi-target order, `serviceResults` як `Map`, validation-before-calculation на reachable cycle, відсутність partial results та input immutability для success/failure.
- Scope: `96fe5b8` змінює лише три Task 6 files; `a9d4055` змінює лише operational `docs/STATUS.md`; dependencies, React/UI, backend і Task 7 не змінено.
- NUL verification: три Task 6 files і review diff package містять `0` literal NUL bytes; у Task 6 production/tests немає React/UI/browser/backend imports.
- Contract: реалізація відповідає `docs/SIMULATION.md` §7–12 і релевантним `docs/TEST_SCENARIOS.md`: failure має лише `success: false` та `errors`, success має лише `success: true`, ordered `targetResults` і `serviceResults: Map`, а inputs не змінюються.

Прямий виклик `npm test` у PowerShell не запускає tests через локальну execution policy для `npm.ps1`; використовується workaround `cmd.exe /d /c npm test` (або запуск із git-bash, де такого обмеження немає).

Task 7: fresh незалежний review implementation commit `e7f9df6` — `changes requested`.

- Initial targeted run (`cmd.exe /d /c "npm test -- test/simulation/determinism.test.js"`): exit `0`, `5 passed, 0 failed`; production невідповідностей `docs/SIMULATION.md` не виявлено.
- Незалежний targeted run (`cmd.exe /d /c "npm test -- test/simulation/determinism.test.js"`): exit `0`, `5 passed, 0 failed`.
- Незалежний full suite (`cmd.exe /d /c npm test`): exit `0`, `42 passed, 0 failed`.
- Незалежні focused probes через public `simulate()`: meaningful TS-27 permutation із переставленими рівнозначними bottleneck — exit `0`, `3 assertions passed`; TS-13 з unreachable valid availability `0` — exit `0`, `3 assertions passed`.
- Scope: `e7f9df6` створює лише `apps/web/test/simulation/determinism.test.js`; production code, dependencies, React/UI, backend і Task 8 не змінено.
- Critical findings: немає.
- Major findings:
  - TS-13 використовує unreachable availability `300` при фактичному bottleneck `120`, тому test не виявить помилкове включення зайвого leaf у глобальний minimum; потрібен нижчий valid value та порівняння повного релевантного результату з baseline.
  - TS-27 в обох моделях зберігає порядок рівнозначних bottleneck `device-router` → `device-ont`; test не виявить залежні від `dependencyIds` несортовані `limitingDependencyIds`/`causalPaths`. Потрібно переставити саме limiting dependencies і зафіксувати canonical expected arrays.
- Minor findings: немає.
- Production behavior для обох ризиків підтверджено focused probes; production code змінювати не потрібно. Production files і tests Reviewer не змінював.

Task 7: Developer correction commit `f417abd` — очікується повторний fresh незалежний review.

- Correction scope: лише `apps/web/test/simulation/determinism.test.js`; production code, dependencies, React/UI, backend і Task 8 не змінено.
- TS-13: valid unreachable `availability[device-refrigerator] = 0` порівнюється з baseline без extra availability за `targetResults` і `serviceResults`.
- TS-27: переставлено самі tied bottlenecks `device-router`/`device-ont`; обидва результати мають literal canonical `limitingDependencyIds` і `causalPaths`.
- Targeted correction run (`cmd.exe /d /c "npm test -- test/simulation/determinism.test.js"`): exit `0`, `5 passed, 0 failed`.
- Full correction suite (`cmd.exe /d /c npm test`): exit `0`, `42 passed, 0 failed`.

Task 7 correction round 1: повторний fresh незалежний review correction commit `f417abd` — `accepted`, відкритих findings немає.

- Попередній Major TS-13: `ADDRESSED` — unreachable valid `availability = 0` нижче за baseline bottleneck `120`; `targetResults` і `serviceResults` збігаються з baseline.
- Попередній Major TS-27: `ADDRESSED` — tied `device-router`/`device-ont` мають протилежний порядок у двох моделях; обидва результати перевіряються проти literal canonical `limitingDependencyIds` і `causalPaths`.
- `node --version`: `v24.18.0`.
- Незалежний targeted run (`cmd.exe /d /c "npm test -- test/simulation/determinism.test.js"`): exit `0`, `5 passed, 0 failed`.
- Незалежний full suite (`cmd.exe /d /c npm test`): exit `0`, `42 passed, 0 failed`.
- Незалежний focused public-API probe: exit `0`, `8 assertions passed`; підтверджено meaningful ordering/value pressure обох regression tests.
- Scope: `f417abd` змінює лише `apps/web/test/simulation/determinism.test.js`; production code, dependencies, React/UI, backend і Task 8 не змінено.
- Critical findings: немає. Major findings: немає. Minor findings: немає.
- Reviewer не змінював production files або tests.

## Актуальна база

- план: `docs/plans/simulation-engine-v1.md`;
- commit плану: `2f08425e004a5ccfb91533e075c114acf8198e9e`;
- implementation commit Task 1: `c78de11`;
- implementation commit Task 2: `dd4d7eb`;
- review commit Task 2 (changes requested): `cb89b2e`;
- fix commit Task 2: `e4cd10b`;
- implementation commit Task 3: `4e661e8`;
- review commit Task 3 (changes requested, 1st round): `067ba8f`;
- fix commit Task 3 (1st correction): `601b6a3`;
- review commit Task 3 (changes requested, 2nd round): `d75a8ed`;
- fix commit Task 3 (2nd correction): `b4efff6`;
- review commit Task 3 (changes requested, 3rd round): `fcf7e46`;
- fix commit Task 3 (3rd correction): `0cbf6b9`;
- implementation commit Task 4: `6d8e99e`;
- implementation commit Task 5: `d22477d`;
- implementation commit Task 6: `96fe5b8`;
- implementation commit Task 7: `e7f9df6`;
- correction commit Task 7: `f417abd`;
- рішення про спільний контекст: `D-001` у `docs/DECISIONS.md`;
- правила синхронізації: `docs/specs/repository-workflow.md`.

## Наступна дія

Передати `Task 8 — Повне acceptance coverage і Reviewer gate` агенту в ролі `Developer`. Task 8 у межах review Task 7 не починався.
