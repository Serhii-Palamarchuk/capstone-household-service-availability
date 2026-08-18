# Поточний стан проєкту

## Поточний етап

Реалізація `Simulation Engine v1`.

## Активне завдання

`Task 3 — Reachable-subgraph validation і cycles`: незалежний review завершено з verdict `changes requested`.

Наступний крок — повернути `Task 3` агенту в ролі `Developer` для виправлення Major finding і test-coverage gap.

## Останнє завершене

- затверджено `docs/DOMAIN_MODEL.md`;
- затверджено `docs/SIMULATION.md`;
- сформовано `docs/TEST_SCENARIOS.md`;
- підготовлено й самоперевірено `docs/plans/simulation-engine-v1.md`;
- налаштовано спільний контекст для ChatGPT, Claude Code, Codex і GitHub Copilot;
- синхронізовано `docs/specs/repository-workflow.md`;
- реалізовано й прийнято після незалежного review `Task 1 — Runtime harness і constants` (`apps/web/package.json`, `apps/web/src/simulation/constants.js`, `apps/web/test/simulation/constants.test.js`);
- реалізовано й прийнято після повторного незалежного review `Task 2 — Model index і structural Scenario validation` (`apps/web/src/simulation/model-index.js`, `apps/web/src/simulation/validation.js`, `apps/web/test/simulation/fixtures.js`, `apps/web/test/simulation/validation.test.js`);
- реалізовано `Task 3 — Reachable-subgraph validation і cycles` (`apps/web/src/simulation/validation.js`, `apps/web/test/simulation/validation.test.js`): додано `validateReachableSubgraph()` і `validateSimulationInput()` — reachable DFS traversal, cycle detection із канонізацією шляху, дедуплікація та детерміноване сортування помилок;
- незалежний review Task 3 завершено з verdict `changes requested`: production-файл містить NUL-байти й визначається Git як binary; tests не доводять rotation канонічного cycle path і path tie-breaker сортування.

## Поточні ролі

- `Developer`: немає (Task 3 повернено на виправлення, очікує призначення);
- `Reviewer`: немає (незалежний review Task 3 завершено);
- координація та рішення: користувач + ChatGPT.

## Відкриті питання

Немає.

## Остання перевірка

Незалежний review Task 1: `accepted`, відкритих findings немає.

Повторний незалежний review Task 2 correction (fix commit `e4cd10b`): `accepted`, відкритих findings немає.

Task 3: незалежний review implementation commit `4e661e8` — `changes requested`.

- Незалежний targeted run (`cmd.exe /d /c npm test -- test/simulation/validation.test.js`): `23 passed, 0 failed`.
- Незалежний full suite (`cmd.exe /d /c npm test`): `25 passed, 0 failed`.
- Додаткові runtime probes: cycle rotation із target `service-c`, self-cycle, два незалежні reachable cycles, duplicate target і read-only input — фактична поведінка коректна.
- Major finding: `apps/web/src/simulation/validation.js` містить 9 literal NUL bytes у separator strings; через це Git показує production-зміну як `Binary files differ` і `--numstat` як `-/-`, що унеможливлює нормальний GitHub review. Потрібно замінити literal NUL на текстові escape-послідовності `\u0000`, не змінюючи runtime-ключі.
- Minor finding: TS-17 починає DFS з уже лексикографічно найменшого `service-a`, а TS-26 не містить cycle errors, тому tests не виявлять поломку rotation канонічного cycle path або четвертого sort key `path`. Потрібно додати вузькі regression assertions для обох правил.

`node --version` → `v24.18.0`.

Прямий виклик `npm test` у PowerShell не запускає tests через локальну execution policy для `npm.ps1`; використовується workaround `cmd.exe /d /c npm test` (або запуск із git-bash, де такого обмеження немає).

## Актуальна база

- план: `docs/plans/simulation-engine-v1.md`;
- commit плану: `2f08425e004a5ccfb91533e075c114acf8198e9e`;
- implementation commit Task 1: `c78de11`;
- implementation commit Task 2: `dd4d7eb`;
- review commit Task 2 (changes requested): `cb89b2e`;
- fix commit Task 2: `e4cd10b`;
- implementation commit Task 3: `4e661e8`;
- рішення про спільний контекст: `D-001` у `docs/DECISIONS.md`;
- правила синхронізації: `docs/specs/repository-workflow.md`.

## Наступна дія

Передати `Task 3 — Reachable-subgraph validation і cycles` агенту в ролі `Developer`: виправити Major і Minor findings, повторити targeted та full tests і повернути task на незалежний review. Task 4 не починати до acceptance Task 3.
