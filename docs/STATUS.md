# Поточний стан проєкту

## Поточний етап

`Simulation Engine v1` завершено та прийнято після фінального fresh незалежного review.

Погоджено наступну фазу: `React Demo v1` — мінімальний React SPA для наскрізної демонстрації контрольного сценарію `Internet` поверх готового simulation engine.

## Активне завдання

`React Demo v1 / Task 3 — Interactive scenario form and simulation execution` прийнято після fresh незалежного review.

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
- `React Demo v1 / Task 3` реалізовано: додано контрольовану форму з чотирма string inputs, adapter-gated виклик `simulate()` та доступне відображення conversion errors; presentation outcome належить Task 4 і не реалізовувалась.
- Task 3 implementation commit: `f408fd1` (`feat: add interactive outage scenario form`).
- `React Demo v1 / Task 3` прийнято: Critical/Major/Minor findings — немає.

## Поточні ролі

- `Developer`: Task 4 може бути розпочато лише окремим Developer task;
- `Reviewer`: Task 3 прийнято;
- координація та рішення: користувач + ChatGPT.

## Відкриті питання

Немає.

## Остання фактична перевірка

Fresh незалежний Reviewer для `React Demo v1 / Task 3`, implementation range `94af0c5..f408fd1`:

- `cmd.exe /d /c "npm test -- test/demo/internet-demo.test.js"` у `apps/web`: exit `0`, `6 passed`, `0 failed`, `0 skipped`, `0 todo`;
- `cmd.exe /d /c npm test` у `apps/web`: exit `0`, `49 passed`, `0 failed`, `0 skipped`, `0 todo`;
- `cmd.exe /d /c npm run build` у `apps/web`: exit `0`; Vite production build успішний, `23 modules transformed`;
- `git diff --check 94af0c5..f408fd1`: exit `0`;
- перевірено exact Task 3 contract: `ScenarioForm` має чотири контрольовані numeric inputs з погодженими labels/attributes/props; `App.jsx` тримає string state, викликає adapter до `simulate()`, зупиняє engine за conversion failure, очищує conversion errors і зберігає outcome за success;
- range містить лише `apps/web/src/components/ScenarioForm.jsx`, `apps/web/src/App.jsx` і `apps/web/src/styles.css`; dependencies, simulation engine, дубльовані правила `min`/status/bottleneck і Task 4 result presentation не змінювалися;
- локальний browser для visual walkthrough у reviewer environment недоступний; responsive plain CSS перевірено статично.

## Актуальна база

- final accepted Simulation Engine commit: `15a07e82263ca3885bd538c15460005f5e3b68c0`;
- React Demo spec commit: `ad80e275e79b6ea380a02ebe129c86a8abee1a6b`;
- React Demo plan commit: `caf17fa69939211667e32474081e38477b3ad94d`;
- React Demo Task 1 accepted implementation commit: `8260417`;
- React Demo Task 2 implementation commit: `c64d6d7`;
- React Demo Task 3 implementation commit: `f408fd1`;
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

Запустити окремий Developer task для `React Demo v1 / Task 4 — Result presentation and demo acceptance gate` відповідно до `docs/plans/react-demo-v1.md`.
