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
- Week 5 report — фіналізовано 2026-08-31 і підготовлено до подання разом із робочою пояснювальною запискою; фактичний submission/acceptance ще не підтверджено.
- Week 6: користувач 2026-08-31 надав транскрипт 6-ї щотижневої зустрічі для відновлення роботи.

Офіційний Week 5 report вимагає: фіналізацію функціоналу, результати тестування, подані на перевірку Chapter 3 і першу версію Chapter 4, аналіз проблем, план фінального demo та посилання на артефакти. Поточний звіт приведено до цієї структури.

Week 5 Google Doc: https://docs.google.com/document/d/1hgUQa2pJnniCZo1RaQBkbbh176rfX6p8sgHQ5jn_RAk/edit?usp=drivesdk

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

Наданий транскрипт 6-ї щотижневої зустрічі не містить персонального сегмента Сергія; індивідуальні коментарі іншим студентам не приписувати цьому проєкту.

Загальні рекомендації Тетяни для фіналізації:

- завершувати змістовні підрозділи коротким підсумком/переходом;
- Chapter 4 посилювати технічними деталями, кодом/функціями та deployment;
- AI use описати конкретно;
- додати Appendix з repository, live deploy та іншими фактичними артефактами;
- великі діаграми можна переносити в Appendices;
- рисунки мають бути читабельними, caption не відривати;
- основний текст — інтервал 1,5; у таблицях допустимий одинарний;
- перспективи розвитку/підтримки/фінансування описувати без вигаданих числових прогнозів.

Репліка `доробити до середи` стосувалася іншого студента й не є дедлайном цього проєкту.

## Explanatory note — factual state 2026-08-31

Робочий Google Doc: https://docs.google.com/document/d/1sWA7sMvRp_X0hZUpSc310kh-wJ_fARo6OipjGoFtLB8/edit?usp=drivesdk

Після відновлення роботи виконано:

- Chapters 1–2 залишаються змістовно завершеними за попереднім feedback;
- у Chapter 3 після таблиць вимог додано текстовий підсумок;
- `3.4` розширено: active/required Device, shared BackupSource, maxOutputPowerW, External Provider, передавання availability у незмінений Simulation Engine, cycle validation, рівнозначні limiting dependencies і causal paths;
- Chapter 4 отримав першу повну змістовну версію `4.1–4.4` + висновки: фактичний user flow, технічна реалізація, результати тестування, труднощі/обмеження/Future Work;
- усі нові фрагменти в робочому Google Doc позначені помаранчевим.

Ще не завершено:

- фінальні UI screenshots та, за потреби, короткі code fragments у Chapter 4;
- Chapter 5;
- конкретна декларація фактичного AI use;
- Appendices;
- performance baseline і external usability study;
- фінальне форматування;
- перевірка титульної дати: зараз `04.09.2026`, тоді як раніше Тетяна озвучувала `14.09.2026`.

## Verification baseline

Остання підтверджена evidence:

- full suite: `140 passed`, `0 failed`, `0 skipped`;
- production build: Vite `8.2.1`, `36 modules transformed`, success;
- `git diff --check` — PASS;
- whole-branch review: initial `2 Major` + `2 Minor` fixed; final verdict `ACCEPTED`;
- browser/manual acceptance — PASS;
- post-deploy live smoke — PASS.

External usability study, screen-reader result і performance baseline не зафіксовані. Не вигадувати ці результати.

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

1. Подати Week 5 report разом із посиланням на робочу пояснювальну записку; після фактичного подання зафіксувати `submitted`.
2. Фіналізувати Chapter 4 скриншотами/code evidence.
3. Виконати performance baseline лише через реальний вимір; external usability — якщо є доступні учасники.
4. Написати Chapter 5.
5. Додати конкретну AI declaration.
6. Додати Appendices з артефактами.
7. Фінальне форматування і перевірка титульної дати.
8. Підготувати final demo та закрити Week 6 reporting.

Нові функції не є пріоритетом; cosmetic UI work — лише за залишкового часу і без зміни функціонального scope.