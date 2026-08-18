# Поточний стан проєкту

## Поточний етап

Реалізація `Simulation Engine v1`.

## Активне завдання

`Task 2 — Model index і structural Scenario validation`: Major finding з попереднього review виправлено Developer (Claude Code). Очікує повторного незалежного review.

Наступний крок — передати `Task 2` окремому агенту в ролі `Reviewer`.

## Останнє завершене

- затверджено `docs/DOMAIN_MODEL.md`;
- затверджено `docs/SIMULATION.md`;
- сформовано `docs/TEST_SCENARIOS.md`;
- підготовлено й самоперевірено `docs/plans/simulation-engine-v1.md`;
- налаштовано спільний контекст для ChatGPT, Claude Code, Codex і GitHub Copilot;
- синхронізовано `docs/specs/repository-workflow.md`;
- реалізовано й прийнято після незалежного review `Task 1 — Runtime harness і constants` (`apps/web/package.json`, `apps/web/src/simulation/constants.js`, `apps/web/test/simulation/constants.test.js`);
- реалізовано `Task 2 — Model index і structural Scenario validation` (`apps/web/src/simulation/model-index.js`, `apps/web/src/simulation/validation.js`, `apps/web/test/simulation/fixtures.js`, `apps/web/test/simulation/validation.test.js`);
- незалежний review Task 2 завершено з verdict `changes requested`: structural validator пропускав перевірку value, якщо той самий `availability` entry мав невалідний key;
- виправлено Major finding у `validateScenarioStructure()` — видалено `continue`, key і value validation тепер незалежні; додано regression test.

## Поточні ролі

- `Developer`: немає (correction завершено, Task 2 очікує review);
- `Reviewer`: немає (Task 2 очікує призначення);
- координація та рішення: користувач + ChatGPT.

## Відкриті питання

Немає.

## Остання перевірка

Незалежний review Task 1: `accepted`, відкритих findings немає.

Task 2 correction (implementation commit `dd4d7eb`, review commit `cb89b2e`):

- Regression test (`availability['missing-node'] = -1`, до fix): FAIL — `AssertionError`, `INVALID_AVAILABILITY_VALUE` не повертався для того самого entry. Очікувана поведінка.
- Targeted run після fix (`cmd.exe /d /c "npm test -- test/simulation/validation.test.js"`): `14 passed, 0 failed`.
- Full suite після fix (`cmd.exe /d /c npm test`): `16 passed, 0 failed`.

`node --version` → `v24.18.0`.

Прямий виклик `npm test` у PowerShell не запускає tests через локальну execution policy для `npm.ps1`; використовується workaround `cmd.exe /d /c npm test`.

## Актуальна база

- план: `docs/plans/simulation-engine-v1.md`;
- commit плану: `2f08425e004a5ccfb91533e075c114acf8198e9e`;
- implementation commit Task 1: `c78de11`;
- implementation commit Task 2: `dd4d7eb`;
- review commit Task 2 (changes requested): `cb89b2e`;
- fix commit Task 2: `e4cd10b`;
- рішення про спільний контекст: `D-001` у `docs/DECISIONS.md`;
- правила синхронізації: `docs/specs/repository-workflow.md`.

## Наступна дія

Передати `Task 2 — Model index і structural Scenario validation` окремому `Reviewer` для повторної перевірки. Task 3 не починати до acceptance Task 2.
