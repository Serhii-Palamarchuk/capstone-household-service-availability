# Поточний стан проєкту

## Поточний етап

`Simulation Engine v1` завершено та прийнято після фінального fresh незалежного review.

Погоджено наступну фазу: `React Demo v1` — мінімальний React SPA для наскрізної демонстрації контрольного сценарію `Internet` поверх готового simulation engine.

## Активне завдання

Наступне погоджене завдання: `React Demo v1 / Task 3 — Interactive scenario form and simulation execution`.

Task 2 прийнято після fresh незалежного review; Task 3 не розпочато.

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

## Поточні ролі

- `Developer`: наступним погодженим кроком є Task 3; не починати його до окремого Developer task;
- `Reviewer`: Task 2 завершено й прийнято; активного review немає;
- координація та рішення: користувач + ChatGPT.

## Відкриті питання

Немає.

## Остання фактична перевірка

Reviewer для `React Demo v1 / Task 2`, implementation range `6d05de3..c64d6d7`:

- `cmd.exe /d /c "npm test -- test/demo/internet-demo.test.js"` у `apps/web`: exit `0`, `6 passed`, `0 failed`, `0 skipped`, `0 todo`;
- `cmd.exe /d /c npm test` у `apps/web`: exit `0`, `49 passed`, `0 failed`, `0 skipped`, `0 todo`;
- `git diff --check 6d05de3..c64d6d7`: exit `0`;
- range містить лише `apps/web/src/demo/internet-demo.js` і `apps/web/test/demo/internet-demo.test.js`; dependencies і код Task 3 не змінювалися;
- recorded Developer RED (`exit 1`, `ERR_MODULE_NOT_FOUND`) узгоджується з тим, що `6d05de3` не містить adapter, а доданий test імпортує його. Точний незафіксований RED output не можна незалежно відтворити після GREEN без зміни checkout; його не перезапускали.

Task 2 accepted.

## Актуальна база

- final accepted Simulation Engine commit: `15a07e82263ca3885bd538c15460005f5e3b68c0`;
- React Demo spec commit: `ad80e275e79b6ea380a02ebe129c86a8abee1a6b`;
- React Demo plan commit: `caf17fa69939211667e32474081e38477b3ad94d`;
- React Demo Task 1 accepted implementation commit: `8260417`;
- React Demo Task 2 implementation commit: `c64d6d7`;
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

Запустити окремий Developer task `React Demo v1 / Task 3 — Interactive scenario form and simulation execution` відповідно до `docs/plans/react-demo-v1.md`. Task 3 у цій Reviewer-сесії не розпочинати.
