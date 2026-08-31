# Поточний стан проєкту

Оновлено: 2026-09-01.

## Поточний етап

Завершені milestones: `Simulation Engine v1`, `React Demo v1`, `Deploy v1`, `User-facing MVP v1`, `UX Polish v1`.

Live URL: https://serhii-palamarchuk.github.io/capstone-household-service-availability/

Архітектура MVP: React SPA + Vite, client-side runtime, GitHub Pages; backend і БД відсутні. Без окремого рішення не змінювати Simulation Engine v1, Availability Estimator formulas, service-template semantics, status semantics і recommendation logic.

## Reporting checkpoint

- Week 2 — accepted.
- Week 3 — accepted 2026-08-21.
- Week 4 — accepted Тетяною 2026-08-24.
- Week 5 report — фіналізовано та підготовлено до подання; submission/acceptance ще не підтверджено.
- Week 5 Google Doc: https://docs.google.com/document/d/1hgUQa2pJnniCZo1RaQBkbbh176rfX6p8sgHQ5jn_RAk/edit?usp=drivesdk

## Supervisor comments in explanatory note

Перевірено всі поточні коментарі Tetiana Tarasovych у Google Doc, а не лише усний feedback:

- `додати що буде вміти проєкт` — змістовно враховано у Chapter 1; comment залишено відкритим до підтвердження керівником;
- `обʼєднати з 3.4` — структурно виконано в Chapter 3; comment залишено відкритим до підтвердження;
- `розширити` — Chapter 3.4 суттєво розширено; comment наразі resolved 2026-08-31;
- `для чого і де?` — comment прив’язаний безпосередньо до фрази `штучного інтелекту` у Декларації академічної доброчесності. 2026-09-01 до декларації додано окремий робочий абзац із конкретним описом використання генеративного ШІ: аналіз вимог і feedback, проєктування, підготовка/редагування документації, допомога в реалізації та перевірці коду, формування тестових сценаріїв. Остаточні рішення, перевірка джерел і фактичні результати залишаються відповідальністю автора. Comment не resolve до підтвердження Тетяною.

Офіційний шаблон Neoversity містить формулювання, що внесок AI має бути належно підтверджено шляхом цитування. Формат бібліографічного цитування AI у доступних матеріалах окремо не визначено; його не вигадувати, а узгодити з керівником.

## Explanatory note checkpoint

Робочий Google Doc: https://docs.google.com/document/d/1sWA7sMvRp_X0hZUpSc310kh-wJ_fARo6OipjGoFtLB8/edit?usp=drivesdk

- Chapters 1–2 — змістовно доопрацьовані;
- Chapter 3 — актуалізований, включно з розширеним 3.4;
- Chapter 4 — підготовлена перша повна змістовна версія 4.1–4.4 + висновки;
- Декларація академічної доброчесності — доповнена робочим описом конкретного використання AI;
- ще потрібні: фінальні UI screenshots/code evidence, Chapter 5, Appendices, performance baseline, фінальне форматування, перевірка титульної дати.

## Verification baseline

- automated suite: `140 passed`, `0 failed`, `0 skipped`;
- Vite `8.2.1` production build: success, `36 modules transformed`;
- `git diff --check` — PASS;
- whole-branch review: initial `2 Major` + `2 Minor` fixed; final `ACCEPTED`;
- browser/manual acceptance — PASS;
- post-deploy live smoke — PASS.

External usability study, screen-reader result і performance baseline не зафіксовані. Не вигадувати результати.

## Source of truth

- `docs/STATUS.md`;
- `docs/DECISIONS.md`;
- `docs/specs/user-facing-mvp-v1.md`;
- `docs/specs/user-facing-mvp-v1-acceptance.md`;
- `docs/specs/ux-polish-v1.md`;
- `docs/specs/ux-polish-v1-acceptance.md`;
- working explanatory note in Google Drive;
- Capstone Project Context in Google Drive.

## Наступна дія

1. Перед поданням Week 5 ще раз пройти всі supervisor comments як checklist, а не лише sections 3–4.
2. Перевірити доступ до Week 5 report і подати report + explanatory note.
3. Після submission зафіксувати `submitted`.
4. Далі: Chapter 4 screenshots/code evidence → performance baseline → Chapter 5 → Appendices → final formatting → final demo.

Нові функції не є пріоритетом; cosmetic UI work — лише за залишкового часу й без зміни scope.