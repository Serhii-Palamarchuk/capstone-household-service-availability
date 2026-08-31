# Поточний стан проєкту

Оновлено: 2026-08-31.

## Поточний етап

Завершено й прийнято як проєктні milestones:

- `Simulation Engine v1`;
- `React Demo v1`;
- `Deploy v1`;
- `User-facing MVP v1`;
- `UX Polish v1`.

Live URL: https://serhii-palamarchuk.github.io/capstone-household-service-availability/

Поточний deployed flow:

```text
Equipment → Backup → Services & Scenario → Result
```

Архітектура MVP: React SPA + Vite, client-side runtime, GitHub Pages; окремий backend і БД відсутні. `Simulation Engine v1`, Availability Estimator formulas, service-template semantics, status semantics і recommendation logic не змінювати без окремого рішення.

## Reporting checkpoint

- Week 2 report — accepted.
- Week 3 report — accepted у LMS 2026-08-21, без окремого текстового feedback.
- Week 4 report — accepted Тетяною 2026-08-24, без нових вимог у відповіді LMS.
- Week 5 report як документ існує, але submission/acceptance у канонічному контексті не підтверджено. Не позначати accepted без фактичного підтвердження.
- Week 6: користувач пропустив понад тиждень і 2026-08-31 надав транскрипт 6-ї щотижневої зустрічі для відновлення роботи.

## Supervisor feedback baseline

Після другого demo 2026-08-24 Тетяна підтвердила:

- функціональний scope MVP достатній; нових обов’язкових функцій не вимагалося;
- React SPA без backend допустима для поточного MVP;
- головний пріоритет — пояснювальна записка, доказовість і тестування вже реалізованого рішення;
- Chapter 3 потрібно деталізувати, особливо Availability Estimator / Simulation Engine і формули;
- Chapter 4 має показати фактичний UI, технічну реалізацію, validation/calculation details та реальні результати тестів;
- AI use потрібно явно задекларувати: де, для чого і в яких межах;
- для захисту продумати масштабування та модель підтримки/фінансування без вигаданих числових оцінок;
- раніше озвучена дата подання — `2026-09-14`.

## Week 6 transcript checkpoint — 2026-08-31

Наданий транскрипт `Транскрипт — 6-та щотижнева зустріч з науковим керівником` не містить персонального сегмента Сергія: спочатку розбирається робота Максима, далі — Романа/інших студентів. Індивідуальні коментарі до їхніх тем не приписувати цьому проєкту.

Загальні рекомендації Тетяни, які варто застосувати під час фіналізації:

- кожний змістовний підрозділ будувати як коротку завершену міні-статтю: вступ → факти/деталі → підсумок і перехід;
- Chapter 4 можна посилити технічними деталями, цікавими фрагментами коду/функцій і описом deployment;
- використання AI описати конкретно: де, для чого і в яких обсягах/межах;
- обов’язково додати Appendix з артефактами проєкту: repository, live deploy та інші фактично наявні посилання;
- діаграми, що займають понад пів сторінки, можна переносити в Appendices;
- рисунки повинні бути читабельними; не відривати caption від рисунка;
- основний текст — міжрядковий інтервал 1,5; у таблицях допустимий одинарний;
- наприкінці роботи доречно описати перспективи розвитку/підтримки/фінансування, але числові прогнози тільки за реальними джерелами або розрахунками.

Репліка `доробити до середи` у транскрипті стосувалася іншого студента й не є дедлайном цього проєкту.

Офіційний фокус Weeks 6–7: фіналізація проєкту, фінальне demo, завершення пояснювальної записки, тестування й якість вже реалізованих компонентів. Нові функції не є пріоритетом.

## Explanatory note — factual state 2026-08-31

Робочий Google Doc: https://docs.google.com/document/d/1sWA7sMvRp_X0hZUpSc310kh-wJ_fARo6OipjGoFtLB8/edit?usp=drivesdk

Перевірено напряму в документі:

- Chapters 1–2 — наповнені й суттєво доопрацьовані за feedback Тетяни;
- Chapter 3 — уже має зміст: вимоги/межі MVP, ітерації, архітектура/stack, Availability Estimator + dependency model, testing strategy, challenges/limitations і conclusions;
- `3.4` залишається відносно стислим порівняно з прямим supervisor comment `розширити`; перед submission потрібен фінальний змістовний audit;
- Chapter 4 — наразі лише headings `4.1–4.4`, без основного тексту;
- Chapter 5 — лише heading;
- Appendices — лише heading;
- конкретної декларації фактичного використання AI ще немає;
- на титульній сторінці зараз стоїть `Дата подання: 04.09.2026`, що суперечить раніше озвученій Тетяною даті `14.09.2026`; перевірити й виправити перед фіналізацією.

## Verification baseline

Остання зафіксована verification evidence UX Polish v1:

- full suite: `140 passed`, `0 failed`, `0 skipped`;
- production build: Vite `8.2.1`, `36 modules transformed`, success;
- `git diff --check` — PASS;
- whole-branch review: initial `2 Major` + `2 Minor` fixed; final verdict `ACCEPTED`;
- browser/manual acceptance — PASS;
- post-deploy live smoke — PASS.

No external usability study, screen-reader result or performance baseline is currently recorded. Do not invent these results.

## Source of truth

- `docs/STATUS.md` — current operational snapshot;
- `docs/DECISIONS.md` — accepted substantive decisions;
- `docs/specs/user-facing-mvp-v1.md`;
- `docs/specs/user-facing-mvp-v1-acceptance.md`;
- `docs/specs/ux-polish-v1.md`;
- `docs/specs/ux-polish-v1-acceptance.md`;
- working explanatory note in Google Drive;
- Capstone Project Context in Google Drive.

## Наступна дія

Recovery sequence:

1. фінальний audit Chapter 3, насамперед `3.4`, підсумки й логічні переходи;
2. написати повний Chapter 4 лише на фактичних screenshots, implementation details і test evidence;
3. провести fresh verification; performance baseline — тільки через реальний вимір;
4. написати Chapter 5: досягнення мети, обмеження, практична цінність, масштабування і модель підтримки;
5. додати конкретну AI declaration;
6. додати Appendices з таблицею артефактів і великими діаграмами за потреби;
7. фінальне форматування й перевірка титульної дати;
8. уточнити фактичний submission status Week 5 та підготувати/закрити Week 6 report;
9. підготувати final demo.

Cosmetic UI work тепер лише за залишкового часу і без зміни функціонального scope.