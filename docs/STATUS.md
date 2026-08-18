# Поточний стан проєкту

## Поточний етап

Реалізація `Simulation Engine v1`.

## Активне завдання

`Task 2 — Model index і structural Scenario validation` прийнято після повторного незалежного review.

Наступний крок — передати `Task 3 — Reachable-subgraph validation і cycles` агенту в ролі `Developer`.

## Останнє завершене

- затверджено `docs/DOMAIN_MODEL.md`;
- затверджено `docs/SIMULATION.md`;
- сформовано `docs/TEST_SCENARIOS.md`;
- підготовлено й самоперевірено `docs/plans/simulation-engine-v1.md`;
- налаштовано спільний контекст для ChatGPT, Claude Code, Codex і GitHub Copilot;
- синхронізовано `docs/specs/repository-workflow.md`;
- реалізовано й прийнято після незалежного review `Task 1 — Runtime harness і constants` (`apps/web/package.json`, `apps/web/src/simulation/constants.js`, `apps/web/test/simulation/constants.test.js`);
- реалізовано `Task 2 — Model index і structural Scenario validation` (`apps/web/src/simulation/model-index.js`, `apps/web/src/simulation/validation.js`, `apps/web/test/simulation/fixtures.js`, `apps/web/test/simulation/validation.test.js`);
- виправлено Major finding у `validateScenarioStructure()` — key і value validation виконуються незалежно; додано regression test;
- `Task 2 — Model index і structural Scenario validation` прийнято після повторного незалежного review, відкритих findings немає.

## Поточні ролі

- `Developer`: немає (Task 3 готовий до передачі);
- `Reviewer`: немає (Task 2 прийнято);
- координація та рішення: користувач + ChatGPT.

## Відкриті питання

Немає.

## Остання перевірка

Незалежний review Task 1: `accepted`, відкритих findings немає.

Повторний незалежний review Task 2 correction (fix commit `e4cd10b`): `accepted`, відкритих findings немає.

- Незалежний targeted run (`cmd.exe /d /c "npm test -- test/simulation/validation.test.js"`): `14 passed, 0 failed`.
- Незалежний full suite (`cmd.exe /d /c npm test`): `16 passed, 0 failed` (включно з regression test Task 1).
- Незалежна runtime-перевірка `availability['missing-node'] = -1`: повернуто рівно `INVALID_AVAILABILITY_NODE` та `INVALID_AVAILABILITY_VALUE` зі стабільними `nodeId`, `field` і `message`.

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

Передати `Task 3 — Reachable-subgraph validation і cycles` агенту в ролі `Developer` відповідно до `docs/plans/simulation-engine-v1.md`.
