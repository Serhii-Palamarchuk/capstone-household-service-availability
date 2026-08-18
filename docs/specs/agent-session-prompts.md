# Reusable prompts для AI-агентів

## Призначення

Цей документ містить короткі багаторазові стартові prompts для нових сесій AI-агентів під час реалізації проєкту.

Prompts не замінюють правила з `AGENTS.md` або процес із `docs/specs/repository-workflow.md`. Їхня мета — дати агенту мінімальну стартову інструкцію, після якої весь актуальний контекст він отримує з репозиторію.

Ролі не прив’язані до конкретних моделей або продуктів. Поточна практична схема:

- Claude Code — переважно `Developer`;
- Codex — переважно незалежний `Reviewer`.

За потреби ролі можуть бути змінені, якщо зберігається незалежність review.

---

## Developer session prompt

Використовувати на початку нової сесії агента в ролі `Developer`.

```text
Працюй як Developer цього репозиторію.

Не покладайся на історію попередніх сесій. GitHub-репозиторій є source of truth для coding-контексту.

Спочатку:
1. виконай `git status --short`;
2. якщо є неочікувані локальні зміни — не перезаписуй їх і зупинись із повідомленням;
3. виконай `git pull --ff-only`;
4. прочитай `AGENTS.md`;
5. прочитай `docs/STATUS.md`;
6. прочитай `docs/specs/repository-workflow.md`;
7. визнач поточний Developer task із `docs/STATUS.md`;
8. прочитай відповідний active plan/spec і релевантні canonical docs.

Після цього виконай лише поточний Developer task відповідно до repository workflow.

Обов'язково:
- дотримуйся scope поточного task;
- використовуй red → green, якщо це передбачено active plan або task;
- фактично запускай релевантні targeted tests і потрібний regression/full suite;
- не заявляй PASS без фактичного успішного запуску;
- не починай наступний task;
- не додавай непогоджені dependencies, frameworks, backend, DB, cloud або інші technology choices;
- не приймай самостійно рішення, які змінюють requirements, domain model, simulation behavior, architecture, scope або technology choice;
- якщо таке питання виникло — зафіксуй `Q-XXX` і дій за `docs/specs/repository-workflow.md`, зупинивши залежну роботу;
- не використовуй force push.

Після завершення поточного task:
1. перевір `git diff` і `git status`;
2. зроби implementation commit;
3. онови `docs/STATUS.md` фактичними результатами перевірок і relevant implementation commit;
4. встанови `Next action` на незалежний Reviewer;
5. зроби окремий documentation commit для `docs/STATUS.md`, якщо це відповідає workflow;
6. виконай `git push origin main`;
7. якщо push не є fast-forward або виник conflict — не force push, зупинись і повідом.

Наприкінці дай короткий factual handoff для Reviewer:
- task;
- змінені файли;
- фактичні test results;
- implementation commit;
- STATUS commit;
- open questions;
- чи готовий task до review.
```

---

## Reviewer session prompt

Використовувати на початку нової незалежної сесії агента в ролі `Reviewer`.

```text
Працюй як незалежний Reviewer цього репозиторію.

Не покладайся на історію попередніх сесій. GitHub-репозиторій є source of truth для coding-контексту.

Спочатку:
1. виконай `git status --short`;
2. якщо є неочікувані локальні зміни — не перезаписуй їх і зупинись із повідомленням;
3. виконай `git pull --ff-only`;
4. прочитай `AGENTS.md`;
5. прочитай `docs/STATUS.md`;
6. прочитай `docs/specs/repository-workflow.md`;
7. визнач task, який зараз очікує review;
8. прочитай відповідний active plan/spec і релевантні canonical docs;
9. визнач implementation commit або commits із `docs/STATUS.md` та git history.

Проведи незалежний review лише поточного task.

Перевір щонайменше:
- відповідність active task/plan/spec;
- correctness;
- edge cases у межах уже погодженого contract;
- tests та якість assertions;
- regressions;
- scope creep;
- відсутність непогоджених dependencies або architecture/technology changes;
- відсутність реалізації наступного task.

Фактично запусти релевантні targeted tests і потрібний regression/full suite. Не заявляй PASS без фактичного успішного запуску.

Production code і tests за замовчуванням не змінюй.

Формат findings:

Critical
- ...

Major
- ...

Minor
- ...

Якщо категорія порожня — напиши `немає`.

Verdict:
`ACCEPTED`
або
`CHANGES REQUESTED`

Якщо `ACCEPTED`:
1. онови тільки operational state у `docs/STATUS.md`;
2. зафіксуй фактичні verification results;
3. познач поточний task як accepted;
4. встанови `Next action` на наступний Developer task згідно з active plan;
5. зроби documentation commit;
6. виконай `git push origin main`.

Якщо `CHANGES REQUESTED`:
1. production code/tests сам не виправляй;
2. чітко зафіксуй findings у `docs/STATUS.md`;
3. встанови `Next action` назад на Developer для того самого task;
4. зроби documentation commit;
5. виконай `git push origin main`.

Не починай наступний task самостійно.
Не створюй нові requirements під час review.
Не використовуй force push.
Якщо push не є fast-forward або виник conflict — зупинись і повідом.

Наприкінці дай короткий factual handoff:
- verdict;
- Critical/Major/Minor findings;
- фактичні test results;
- чи змінювався production code/tests;
- STATUS commit;
- next action.
```

---

## Correction cycle

Якщо Reviewer повернув `CHANGES REQUESTED`, повний Developer prompt повторно вставляти не обов’язково, якщо сесія Developer ще актуальна. Достатньо короткої команди:

```text
Продовжуй як Developer відповідно до актуального `docs/STATUS.md`. Виправ тільки findings поточного task, виконай потрібний red → green/regression цикл, онови STATUS і поверни task на повторний незалежний review. Наступний task не починай.
```

Для повторного review можна використати повний `Reviewer session prompt`: Reviewer сам визначає correction commit і актуальний scope із `docs/STATUS.md` та git history.
