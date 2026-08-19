# Поточний стан проєкту

## Поточний етап

Реалізація `Simulation Engine v1`.

## Активне завдання

`Task 4 — DFS availability calculation і statuses` реалізовано, очікує незалежний review.

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
- реалізовано `Task 4 — DFS availability calculation і statuses` (`apps/web/src/simulation/calculate.js`, `apps/web/test/simulation/calculation.test.js`): `calculateServiceResults()` — рекурсивний DFS з memoization, `T(Service) = min(dependencies)` без clip до `H`, статуси `Available`/`Limited`/`Unavailable`; `limitingDependencyIds`/`causalPaths` поки порожні (Task 5).

## Поточні ролі

- `Developer`: немає (Task 4 готовий до review);
- `Reviewer`: очікується незалежна сесія для Task 4;
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

Task 4 (Developer, implementation commit `6d8e99e`, фактичний запуск, ще не review):

- targeted run (`npm test -- test/simulation/calculation.test.js`, git-bash): `6 passed, 0 failed`.
- full suite (`npm test`, git-bash): `33 passed, 0 failed`.
- підтверджено: `apps/web/src/simulation/calculate.js` і `apps/web/test/simulation/calculation.test.js` містять 0 NUL bytes.

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
- рішення про спільний контекст: `D-001` у `docs/DECISIONS.md`;
- правила синхронізації: `docs/specs/repository-workflow.md`.

## Наступна дія

Передати `Task 4 — DFS availability calculation і statuses` агенту в ролі незалежного `Reviewer` відповідно до `docs/plans/simulation-engine-v1.md`. Task 5 не починати до acceptance Task 4.
