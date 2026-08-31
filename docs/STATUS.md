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

Перевірено поточні Google Docs comments і додаткові supervisor suggestions, надані користувачем скриншотами:

- `назва з прив’язкою до теми` для Chapter 2 — шаблонну назву `ДОСЛІДЖЕННЯ РИНКУ ТА ТЕХНОЛОГІЧНОГО СЕРЕДОВИЩА` замінено 2026-09-01 на `АНАЛІЗ ПІДХОДІВ ДО ОЦІНЮВАННЯ ДОСТУПНОСТІ ПОБУТОВИХ СЕРВІСІВ І МОДЕЛЮВАННЯ ЇХ ФУНКЦІОНАЛЬНИХ ЗАЛЕЖНОСТЕЙ`; зміну внесено і в зміст, і в основний текст та позначено помаранчевим;
- `додати що буде вміти проєкт` — змістовно враховано у Chapter 1; comment залишено відкритим до підтвердження керівником;
- `обʼєднати з 3.4` — структурно виконано в Chapter 3; comment залишено відкритим до підтвердження;
- `розширити` — Chapter 3.4 суттєво розширено; comment resolved 2026-08-31;
- `для чого і де?` — comment прив’язаний до фрази `штучного інтелекту` у Декларації академічної доброчесності. Декларацію уточнено за фактичним використанням: ChatGPT — аналіз вимог/feedback, архітектурні рішення, пошук і перевірка інформації, документація; Codex — основний AI-асистент під час реалізації, доопрацювання, рефакторингу й автоматизованого тестування коду; Claude Code — епізодичний додатковий асистент під час роботи з кодом. Остаточні рішення сформульовано від першої особи: `я ухвалював самостійно`. Comment уже resolved 2026-08-31; disclosure після цього уточнено додатково.

Фразу про необхідність узгодити спосіб бібліографічного цитування AI з тексту самої декларації прибрано як внутрішню робочу примітку. Якщо Neoversity/керівник вимагає окремий формат бібліографічного оформлення AI, його треба уточнити окремо, а не вигадувати.

## Explanatory note checkpoint

Робочий Google Doc: https://docs.google.com/document/d/1sWA7sMvRp_X0hZUpSc310kh-wJ_fARo6OipjGoFtLB8/edit?usp=drivesdk

- Chapters 1–2 — змістовно доопрацьовані;
- Chapter 2 має topic-specific title згідно із supervisor feedback;
- Chapter 3 — актуалізований, включно з розширеним 3.4;
- Chapter 4 — підготовлена перша повна змістовна версія 4.1–4.4 + висновки;
- Декларація академічної доброчесності — конкретизована за фактичним використанням ChatGPT, Codex і Claude Code;
- ще потрібні: фінальні UI screenshots/code evidence, Chapter 5, Appendices, performance baseline, фінальне форматування.

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

1. Перед поданням Week 5 ще раз пройти всі supervisor comments/suggestions як checklist, включно зі скриншотами, а не лише comments API.
2. Перевірити доступ до Week 5 report і подати report + explanatory note.
3. Після submission зафіксувати `submitted`.
4. Далі: Chapter 4 screenshots/code evidence → performance baseline → Chapter 5 → Appendices → final formatting → final demo.

Нові функції не є пріоритетом; cosmetic UI work — лише за залишкового часу й без зміни scope.