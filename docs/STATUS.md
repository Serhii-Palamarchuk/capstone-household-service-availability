# Поточний стан проєкту

## Поточний етап

`Simulation Engine v1` завершено та прийнято після фінального fresh незалежного review.

Погоджено наступну фазу: `React Demo v1` — мінімальний React SPA для наскрізної демонстрації контрольного сценарію `Internet` поверх готового simulation engine.

## Активне завдання

`React Demo v1 / Task 2 — Internet demo input adapter and engine integration tests` реалізовано; очікується fresh незалежний review.

Task 3 не розпочато.

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

## Поточні ролі

- `Developer`: Task 2 передано на fresh незалежний review; не починати Task 3;
- `Reviewer`: потрібно перевірити лише Task 2 відносно `docs/specs/react-demo-v1.md` і `docs/plans/react-demo-v1.md`;
- координація та рішення: користувач + ChatGPT.

## Відкриті питання

Немає.

## Остання фактична перевірка

Developer для `React Demo v1 / Task 2`, implementation commit `c64d6d7`:

- RED: `cmd.exe /d /c "npm test -- test/demo/internet-demo.test.js"` у `apps/web`: exit `1`; очікувано `ERR_MODULE_NOT_FOUND` для ще відсутнього `src/demo/internet-demo.js`;
- GREEN targeted: та сама команда: exit `0`, `6 passed`, `0 failed`, `0 skipped`, `0 todo`;
- GREEN full: `cmd.exe /d /c npm test` у `apps/web`: exit `0`, `49 passed`, `0 failed`, `0 skipped`, `0 todo`;
- перед implementation commit: `git diff --cached --check`: exit `0`;
- implementation range містить лише `apps/web/src/demo/internet-demo.js` і `apps/web/test/demo/internet-demo.test.js`.

Task 2 implementation complete; review ще не виконано.

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

Виконати fresh незалежний review лише `React Demo v1 / Task 2 — Internet demo input adapter and engine integration tests`. Не починати Task 3 до verdict Task 2.
