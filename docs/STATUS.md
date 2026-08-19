# Поточний стан проєкту

## Поточний етап

Реалізація `Simulation Engine v1`.

## Активне завдання

`Task 5 — Limiting leaves і causal paths` прийнято після fresh незалежного review.

Наступний крок — передати `Task 6 — Public simulate() contract` агенту в ролі `Developer`.

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

## Поточні ролі

- `Developer`: потрібно призначити для Task 6;
- `Reviewer`: немає (Task 5 прийнято);
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

Прямий виклик `npm test` у PowerShell не запускає tests через локальну execution policy для `npm.ps1`; використовується workaround `cmd.exe /d /c npm test` (або запуск із git-bash, де такого обмеження немає).

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
- рішення про спільний контекст: `D-001` у `docs/DECISIONS.md`;
- правила синхронізації: `docs/specs/repository-workflow.md`.

## Наступна дія

Передати `Task 6 — Public simulate() contract` агенту в ролі `Developer` відповідно до `docs/plans/simulation-engine-v1.md`.
