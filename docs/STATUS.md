# Поточний стан проєкту

## Поточний етап

Реалізація `Simulation Engine v1`.

## Активне завдання

`Task 3 — Reachable-subgraph validation і cycles`: findings повторного review виправлено, очікує черговий незалежний review.

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
- незалежний review Task 3 завершено з verdict `changes requested`: production-файл містить NUL-байти й визначається Git як binary; tests не доводять rotation канонічного cycle path і path tie-breaker сортування;
- виправлено Major finding — 9 literal NUL bytes у separator strings замінено на текстову escape-послідовність (runtime-ключі не змінилися); підтверджено, що новий commit blob не містить NUL bytes і майбутні diffs рендеряться як текст;
- додано regression test канонізації cycle path при старті DFS з нелексикографічно-мінімального вузла (`service-c`);
- повторний незалежний review Task 3 завершено з verdict `changes requested`: literal NUL перенесено в test source, а новий sort test має різні `nodeId` і не перевіряє `path` tie-breaker;
- виправлено Major finding — literal NUL byte у test source (`error.path.join(...)`) замінено на текстову escape-послідовність;
- виправлено Minor finding — regression test для path tie-breaker переписано на модель з одним вузлом (`service-a`), що має дві окремі залежності (`service-b`, `service-d`), кожна з яких замикає окремий цикл назад на `service-a`; обидва cycle errors мають однакові `code`/`nodeId`/`field`, але різні `path`, що дійсно вимагає path tie-breaker для детермінованого порядку.

## Поточні ролі

- `Developer`: немає (Task 3 correction готова до повторного review);
- `Reviewer`: очікується незалежна сесія для Task 3 correction;
- координація та рішення: користувач + ChatGPT.

## Відкриті питання

Немає.

## Остання перевірка

Незалежний review Task 1: `accepted`, відкритих findings немає.

Повторний незалежний review Task 2 correction (fix commit `e4cd10b`): `accepted`, відкритих findings немає.

Task 3 correction: повторний незалежний review fix commit `601b6a3` — `changes requested`.

- Незалежний targeted run (`cmd.exe /d /c npm test -- test/simulation/validation.test.js`): `25 passed, 0 failed`.
- Незалежний full suite (`cmd.exe /d /c npm test`): `27 passed, 0 failed`.
- Runtime probe із двома циклами зі спільними `code`/`nodeId`/`field`: implementation коректно сортує paths.
- Major finding: `apps/web/test/simulation/validation.test.js` містить 1 literal NUL byte у `error.path.join(...)` (line 338). Потрібно використати текстову escape-послідовність `\u0000`, щоб source залишався звичайним текстом.
- Minor finding: regression test для останнього sort key створює цикли з різними `nodeId` (`service-a`, `service-x`), тому порядок визначається `nodeId` раніше за `path`; test пройде навіть без path tie-breaker. Потрібен сценарій із двома виявленими циклами, що мають однакові `code`, `nodeId` і `field`, але різні `path`.

Task 3 correction #2 (Developer, fix commit `b4efff6`, фактичний запуск, ще не review):

- targeted run (`npm test -- test/simulation/validation.test.js`, git-bash): `25 passed, 0 failed`.
- full suite (`npm test`, git-bash): `27 passed, 0 failed`.
- підтверджено: `apps/web/src/simulation/validation.js` і `apps/web/test/simulation/validation.test.js` містять 0 NUL bytes.
- підтверджено runtime probe: модель `service-a -> [service-b, service-d]`, `service-b -> service-a`, `service-d -> service-a` дає рівно два `CYCLE_DETECTED` з однаковими `nodeId='service-a'`, `field='dependencyIds'`, але різними `path` (`service-a,service-b,service-a` і `service-a,service-d,service-a`) — новий test дійсно виявив би поломку path tie-breaker.

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
- review commit Task 3 (changes requested, 1st round): `067ba8f`;
- fix commit Task 3 (1st correction): `601b6a3`;
- review commit Task 3 (changes requested, 2nd round): `d75a8ed`;
- fix commit Task 3 (2nd correction): `b4efff6`;
- рішення про спільний контекст: `D-001` у `docs/DECISIONS.md`;
- правила синхронізації: `docs/specs/repository-workflow.md`.

## Наступна дія

Передати `Task 3 — Reachable-subgraph validation і cycles` агенту в ролі незалежного `Reviewer`: перевірити fix commit `b4efff6` (усунення literal NUL у test source, новий path-tie-breaker сценарій через спільний вузол), фактично запустити targeted та full tests. Task 4 не починати до acceptance Task 3.
