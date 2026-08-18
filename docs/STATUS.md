# Поточний стан проєкту

## Поточний етап

Реалізація `Simulation Engine v1`.

## Активне завдання

`Task 2 — Model index і structural Scenario validation` реалізовано Developer (Claude Code) і очікує незалежного review.

Наступний крок — передати `Task 2` окремому агенту в ролі `Reviewer`.

## Останнє завершене

- затверджено `docs/DOMAIN_MODEL.md`;
- затверджено `docs/SIMULATION.md`;
- сформовано `docs/TEST_SCENARIOS.md`;
- підготовлено й самоперевірено `docs/plans/simulation-engine-v1.md`;
- налаштовано спільний контекст для ChatGPT, Claude Code, Codex і GitHub Copilot;
- синхронізовано `docs/specs/repository-workflow.md`;
- реалізовано й прийнято після незалежного review `Task 1 — Runtime harness і constants` (`apps/web/package.json`, `apps/web/src/simulation/constants.js`, `apps/web/test/simulation/constants.test.js`);
- реалізовано `Task 2 — Model index і structural Scenario validation` (`apps/web/src/simulation/model-index.js`, `apps/web/src/simulation/validation.js`, `apps/web/test/simulation/fixtures.js`, `apps/web/test/simulation/validation.test.js`), очікує review.

## Поточні ролі

- `Developer`: немає (Task 2 реалізовано, чекає review);
- `Reviewer`: немає (Task 2 очікує призначення);
- координація та рішення: користувач + ChatGPT.

## Відкриті питання

Немає.

## Остання перевірка

Незалежний review Task 1: `accepted`, відкритих findings немає.

Task 2: red → green цикл виконано фактично.

- Targeted red run (`cmd.exe /d /c "npm test -- test/simulation/validation.test.js"` до реалізації `model-index.js`/`validation.js`): `ERR_MODULE_NOT_FOUND`, 1 failed — очікувана поведінка (модулі ще не існують).
- Targeted green run після реалізації (`npm test -- test/simulation/validation.test.js`): `13 passed, 0 failed`.
- Full suite (`cmd.exe /d /c npm test`): `15 passed, 0 failed` (Task 1 constants test + Task 2 tests).

`node --version` → `v24.18.0`.

Прямий виклик `npm test` у PowerShell не запускає tests через локальну execution policy для `npm.ps1`; використовується workaround `cmd.exe /d /c npm test`.

## Актуальна база

- план: `docs/plans/simulation-engine-v1.md`;
- commit плану: `2f08425e004a5ccfb91533e075c114acf8198e9e`;
- implementation commit Task 1: `c78de11`;
- implementation commit Task 2: `dd4d7eb`;
- рішення про спільний контекст: `D-001` у `docs/DECISIONS.md`;
- правила синхронізації: `docs/specs/repository-workflow.md`.

## Наступна дія

Передати `Task 2 — Model index і structural Scenario validation` окремому `Reviewer`. Task 3 не починати до acceptance Task 2.
