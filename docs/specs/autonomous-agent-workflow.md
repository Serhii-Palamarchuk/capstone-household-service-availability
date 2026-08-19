# Автономний workflow AI-агентів

## Призначення

Цей документ визначає tool-neutral режим автономної реалізації, у якому один AI-agent працює як `Orchestrator` і послідовно проводить поточний implementation plan через цикл:

**Developer → tests/checks → commit → незалежний Reviewer → correction cycle → acceptance → наступний task**.

Мета — мінімізувати ручне перемикання між Claude Code, Codex, GitHub Copilot або іншими coding agents без послаблення вимог до незалежного review, scope control і фактичної перевірки.

Цей документ не замінює:

- `AGENTS.md` — стабільні project-wide правила;
- `docs/specs/repository-workflow.md` — канонічний synchronization protocol;
- `docs/STATUS.md` — поточний operational state;
- active plan/spec і релевантні canonical docs.

Якщо між документами є суперечність, вищі за пріоритетом project rules і canonical docs не переписуються заради автономності.

## 1. Роль Orchestrator

`Orchestrator` керує послідовністю роботи, але не отримує права змінювати requirements, domain model, simulation behavior, architecture, scope або technology choices.

Orchestrator:

1. синхронізує локальний репозиторій;
2. читає актуальний context із репозиторію;
3. визначає поточний task із `docs/STATUS.md` і active plan;
4. запускає роботу в ролі `Developer` у максимально ізольованому контексті, доступному поточному інструменту;
5. після Developer handoff запускає fresh `Reviewer` context;
6. за `CHANGES REQUESTED` повертає findings у Developer correction cycle;
7. за `ACCEPTED` переходить до наступного task із active plan;
8. продовжує цикл до завершення plan або escalation condition.

Orchestrator не повинен вимагати підтвердження користувача між звичайними task cycles, якщо не спрацювала одна з умов ескалації нижче.

## 2. Source of truth і старт

Перед автономним циклом:

1. виконати `git status --short`;
2. якщо є неочікувані локальні зміни — не перезаписувати їх і зупинитись;
3. виконати `git pull --ff-only`;
4. прочитати в такому порядку:

```text
AGENTS.md
↓
docs/STATUS.md
↓
docs/specs/repository-workflow.md
↓
docs/specs/autonomous-agent-workflow.md
↓
active plan/spec
↓
relevant canonical docs
```

Приватна історія чату, пам’ять попередньої сесії або припущення Orchestrator не є source of truth.

## 3. Автономний цикл одного task

### 3.1. Developer phase

Developer:

- реалізує лише поточний task;
- дотримується active plan/spec;
- використовує red → green, якщо це передбачено task або планом;
- фактично запускає релевантні targeted tests і потрібний regression/full suite;
- не заявляє PASS без фактичного успішного запуску;
- не починає наступний task;
- не додає непогоджені dependencies або technology choices;
- перевіряє `git diff` і `git status`;
- робить implementation commit;
- оновлює `docs/STATUS.md` factual results і relevant implementation commit;
- робить STATUS/documentation commit, якщо це відповідає repository workflow;
- виконує `git push origin main` без force push.

Після цього `Next action` має бути незалежний Reviewer поточного task.

### 3.2. Reviewer phase

Reviewer працює у fresh context і:

- читає актуальний repo context заново;
- перевіряє лише поточний task;
- перевіряє task/spec compliance, correctness, edge cases у межах погодженого contract, tests, regressions, scope creep та непогоджені dependencies/architecture changes;
- фактично запускає релевантні targeted tests і потрібний regression/full suite;
- за замовчуванням не змінює production code або tests;
- повертає findings категорій `Critical`, `Major`, `Minor`;
- виставляє verdict `ACCEPTED` або `CHANGES REQUESTED`.

За `ACCEPTED` Reviewer:

- оновлює operational state у `docs/STATUS.md`;
- фіксує factual verification;
- позначає task accepted;
- встановлює `Next action` на наступний Developer task із active plan;
- commit-ить STATUS і push-ить зміни.

За `CHANGES REQUESTED` Reviewer:

- не виправляє production code/tests;
- фіксує findings у `docs/STATUS.md`;
- повертає `Next action` Developer для того самого task;
- commit-ить STATUS і push-ить зміни.

### 3.3. Correction cycle

Після `CHANGES REQUESTED` Orchestrator запускає Developer correction phase для того самого task.

Developer:

- виправляє тільки зафіксовані findings;
- додає regression test, коли finding виявив непокритий defect і це доречно;
- повторно запускає релевантні tests;
- робить correction implementation commit;
- оновлює STATUS;
- повертає task на fresh Reviewer.

Correction cycle повторюється до `ACCEPTED` або escalation condition.

## 4. Незалежність review

Для одного task Developer і Reviewer мають працювати у різних context windows/agents/sessions, якщо поточний інструмент це підтримує.

Використовується найсильніша доступна ізоляція, наприклад:

- окремий subagent;
- окремий agent/thread;
- окрема fresh session;
- окремий coding agent іншої моделі або продукту.

Reviewer не повинен успадковувати приховане reasoning Developer як основу для acceptance.

Якщо поточний інструмент не може створити fresh review context, Orchestrator **не має права самоприйняти task як незалежно reviewed**. У такому випадку він зупиняється після Developer handoff і просить запустити окрему Reviewer session/agent.

## 5. Перехід між tasks

Після `ACCEPTED` Orchestrator:

1. повторно читає актуальний `docs/STATUS.md`;
2. визначає наступний task тільки з active plan/status;
3. не вигадує task поза планом;
4. запускає новий Developer phase;
5. повторює цикл.

Autonomous mode може продовжуватися через кілька tasks одного погодженого implementation plan без ручного підтвердження між ними.

## 6. Умови ескалації користувачу

Orchestrator зупиняє залежну роботу і звертається до користувача, якщо виникає хоча б одна умова:

- потрібно створити або вирішити `Q-XXX` згідно з repository workflow;
- є суперечність між task/plan і canonical docs;
- потрібна зміна requirement, domain invariant, simulation/public contract, architecture або scope;
- потрібен новий непогоджений framework, DB, ORM, broker, cloud service, testing framework або інший technology choice;
- потрібна destructive git-операція, history rewrite або force push;
- `git pull`/`git push` не може бути виконаний fast-forward через conflict;
- немає доступу/permission/runtime/tooling, без якого task неможливо коректно перевірити;
- correction cycles не дають прогресу і той самий Critical/Major finding повторюється без нового технічного результату;
- active implementation plan завершився або не визначає наступного task.

При ескалації агент повинен коротко описати:

- що заблоковано;
- який task;
- що вже перевірено;
- яке конкретне рішення потрібне від користувача.

## 7. Заборонено в autonomous mode

Autonomous mode не дозволяє:

- самостійно розширювати MVP;
- створювати нові product requirements;
- міняти architecture «для покращення» без погодження;
- додавати нові технології лише через зручність;
- пропускати Reviewer;
- вважати tests успішними без запуску;
- змінювати canonical docs, щоб вони відповідали некоректній реалізації;
- використовувати force push;
- commit-ити secrets або приватні дані;
- починати task, якого немає в active plan/status.

## 8. Завершення автономного run

Autonomous run завершується, коли:

- погоджений implementation plan виконаний і останній task прийнятий Reviewer; або
- виникла escalation condition.

При нормальному завершенні Orchestrator повідомляє тільки factual summary:

- які tasks прийняті;
- relevant implementation/review commits;
- фактичний останній test result;
- стан worktree/push;
- що вказано як наступна дія в `docs/STATUS.md`.

Якщо наступна фаза потребує нового плану, зміни scope або рішення користувача, Orchestrator не починає її самостійно.