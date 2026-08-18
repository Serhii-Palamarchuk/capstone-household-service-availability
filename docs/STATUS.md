# Поточний стан проєкту

## Поточний етап

Реалізація `Simulation Engine v1`.

## Активне завдання

`Task 2 — Model index і structural Scenario validation`: незалежний review завершено з verdict `changes requested`.

Наступний крок — повернути `Task 2` агенту в ролі `Developer` для виправлення Major finding.

## Останнє завершене

- затверджено `docs/DOMAIN_MODEL.md`;
- затверджено `docs/SIMULATION.md`;
- сформовано `docs/TEST_SCENARIOS.md`;
- підготовлено й самоперевірено `docs/plans/simulation-engine-v1.md`;
- налаштовано спільний контекст для ChatGPT, Claude Code, Codex і GitHub Copilot;
- синхронізовано `docs/specs/repository-workflow.md`;
- реалізовано й прийнято після незалежного review `Task 1 — Runtime harness і constants` (`apps/web/package.json`, `apps/web/src/simulation/constants.js`, `apps/web/test/simulation/constants.test.js`);
- реалізовано `Task 2 — Model index і structural Scenario validation` (`apps/web/src/simulation/model-index.js`, `apps/web/src/simulation/validation.js`, `apps/web/test/simulation/fixtures.js`, `apps/web/test/simulation/validation.test.js`);
- незалежний review Task 2 завершено з verdict `changes requested`: structural validator пропускає перевірку value, якщо той самий `availability` entry має невалідний key.

## Поточні ролі

- `Developer`: немає (Task 2 повернено на виправлення, очікує призначення);
- `Reviewer`: немає (незалежний review Task 2 завершено);
- координація та рішення: користувач + ChatGPT.

## Відкриті питання

Немає.

## Остання перевірка

Незалежний review Task 1: `accepted`, відкритих findings немає.

Task 2: незалежний review implementation commit `dd4d7eb` — `changes requested`.

- Незалежний targeted run (`cmd.exe /d /c "npm test -- test/simulation/validation.test.js"`): `13 passed, 0 failed`.
- Незалежний full suite (`cmd.exe /d /c npm test`): `15 passed, 0 failed` (включно з regression test Task 1).
- Незалежна runtime-перевірка `createModelIndex`: усі чотири індекси коректні, input model не мутовано.
- Major finding: для `availability: { "missing-node": -1 }` повертається лише `INVALID_AVAILABILITY_NODE`; через `continue` не повертається `INVALID_AVAILABILITY_VALUE`, хоча structural contract вимагає незалежно перевірити кожен key і кожне value. Потрібно перевіряти value навіть для невалідного key та додати regression test для обох помилок одного entry.

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

Передати `Task 2 — Model index і structural Scenario validation` агенту в ролі `Developer`: виправити Major finding, повторити targeted і full tests та повернути на незалежний review. Task 3 не починати до acceptance Task 2.
