# Поточний стан проєкту

## Поточний етап

`Simulation Engine v1` завершено та прийнято після фінального fresh незалежного review.

Погоджено наступну фазу: `React Demo v1` — мінімальний React SPA для наскрізної демонстрації контрольного сценарію `Internet` поверх готового simulation engine.

## Активне завдання

`React Demo v1 / Task 4 — Result presentation and demo acceptance gate` реалізовано й очікує fresh незалежного review.

Канонічна специфікація:

`docs/specs/react-demo-v1.md`

Implementation plan:

`docs/plans/react-demo-v1.md`

## Останнє завершене

- `Simulation Engine v1` повністю реалізовано й прийнято;
- усі acceptance scenarios `TS-01…TS-29` мають explicit test coverage;
- public `simulate(model, scenario)` contract прийнятий;
- final engine review: Critical/Major/Minor findings — немає;
- підготовлено й погоджено `React Demo v1` spec;
- підготовлено `React Demo v1` implementation plan із чотирьох послідовних Developer → fresh Reviewer tasks.
- `React Demo v1 / Task 2` реалізовано: додано fixed `Internet` demo model, string-hours to minutes adapter та integration coverage з `simulate()`;
- Task 2 implementation commit: `c64d6d7` (`feat: add Internet demo scenario adapter`).
- `React Demo v1 / Task 2` прийнято: Critical/Major/Minor findings — немає.
- `React Demo v1 / Task 3` реалізовано: додано контрольовану форму з чотирма string inputs, adapter-gated виклик `simulate()` та доступне відображення conversion errors.
- Task 3 implementation commit: `f408fd1` (`feat: add interactive outage scenario form`).
- `React Demo v1 / Task 3` прийнято: Critical/Major/Minor findings — немає.
- `React Demo v1 / Task 4` реалізовано: додано pure `createResultView(outcome)`, `SimulationResult`, відображення success/failure outcome, Available explanation і plain-CSS result card без зміни simulation engine.
- Task 4 implementation commit: `209b17b` (`feat: present simulation demo results`).

## Поточні ролі

- `Developer`: Task 4 implementation завершено; новий Developer task не розпочинати;
- `Reviewer`: потрібен fresh незалежний review `React Demo v1 / Task 4`;
- координація та рішення: користувач + ChatGPT.

## Відкриті питання

Немає.

## Остання фактична перевірка

Developer для `React Demo v1 / Task 4`, implementation range `ceeedd4..209b17b`:

- RED: `cmd.exe /d /c "npm test -- test/demo/result-view.test.js"` у `apps/web`: exit `1`, очікуваний `ERR_MODULE_NOT_FOUND`, бо `src/demo/result-view.js` ще не існував;
- `cmd.exe /d /c "npm test -- test/demo/result-view.test.js"` у `apps/web`: exit `0`, `4 passed`, `0 failed`, `0 skipped`, `0 todo`;
- `cmd.exe /d /c "npm test -- test/demo/internet-demo.test.js test/demo/result-view.test.js"` у `apps/web`: exit `0`, `10 passed`, `0 failed`, `0 skipped`, `0 todo`;
- `cmd.exe /d /c npm test` у `apps/web`: exit `0`, `53 passed`, `0 failed`, `0 skipped`, `0 todo`;
- `cmd.exe /d /c npm run build` у `apps/web`: exit `0`; Vite production build успішний, `25 modules transformed`;
- deterministic pure adapter + engine probes: default `6/8/2/72 h` → `2 h`, `Limited`, `ONT/ONU`, `Internet → ONT/ONU`; changed ONT `6/8/8/72 h` → `8 h`, `Available`, порожні cause/path; zero ONT `6/8/0/72 h` → `0 h`, `Unavailable`, `ONT/ONU`, `Internet → ONT/ONU`;
- `git diff --check`: exit `0`; усі п’ять Task 4 файлів перевірено на valid UTF-8 і trailing whitespace — порушень немає;
- source/scope audit: `App.jsx` продовжує викликати `simulate()`; presenter лише копіює engine `status`/causes/paths, форматує хвилини та мапить ID через `DEMO_NODE_NAMES`; не додано backend/API/DB/persistence/router/state/UI/testing framework; dependencies залишилися React/ReactDOM та Vite dev tooling;
- visual walkthrough не виконувався в Developer task; за планом він належить browser-capable Reviewer, якщо такий інструмент доступний.

## Актуальна база

- final accepted Simulation Engine commit: `15a07e82263ca3885bd538c15460005f5e3b68c0`;
- React Demo spec commit: `ad80e275e79b6ea380a02ebe129c86a8abee1a6b`;
- React Demo plan commit: `caf17fa69939211667e32474081e38477b3ad94d`;
- React Demo Task 1 accepted implementation commit: `8260417`;
- React Demo Task 2 implementation commit: `c64d6d7`;
- React Demo Task 3 implementation commit: `f408fd1`;
- React Demo Task 4 implementation commit: `209b17b`;
- React Demo spec: `docs/specs/react-demo-v1.md`;
- React Demo plan: `docs/plans/react-demo-v1.md`;
- synchronization rules: `docs/specs/repository-workflow.md`;
- autonomous workflow: `docs/specs/autonomous-agent-workflow.md`;
- reusable prompts: `docs/specs/agent-session-prompts.md`.

## Scope наступної фази

`React Demo v1` включає лише контрольний `Internet` scenario, inputs, запуск `simulate()`, result/status/causes/paths і rerun.

Backend, persistence, DB, external integrations, UI framework і deploy у цей plan не входять.

`Deploy v1` планується окремо після acceptance React Demo та окремого вибору hosting/platform.

## Наступна дія

Запустити fresh незалежний Reviewer для `React Demo v1 / Task 4 — Result presentation and demo acceptance gate` відповідно до `docs/plans/react-demo-v1.md`. Не позначати task або `React Demo v1` прийнятими до цього review.
