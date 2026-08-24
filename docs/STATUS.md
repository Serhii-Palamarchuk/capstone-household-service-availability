# Поточний стан проєкту

Оновлено: 2026-08-24.

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

Архітектура поточного MVP: React SPA + Vite, client-side runtime, GitHub Pages; окремий backend і БД відсутні. `Simulation Engine v1`, Availability Estimator formulas, service-template semantics, status semantics і recommendation logic не змінювати без окремого рішення.

## Reporting checkpoint

- Week 2 report — accepted.
- Week 3 report — accepted у LMS 2026-08-21, без окремого текстового feedback.
- Week 4 report — accepted Тетяною 2026-08-24. Звіт було подано через LMS та продубльовано у Slack DM о 12:22:49 EEST, message ts `1787563369.922679`.
- Відповідь Тетяни в LMS: «Вітаю, дякую за детальний звіт!» о 19:17 2026-08-24. Окремих зауважень або нових вимог у цій відповіді не зафіксовано. Week 4 reporting checkpoint закрито як accepted.

## Second demo / supervisor feedback — 2026-08-24

Під час п’ятої щотижневої зустрічі проведено друге live demo актуального User-facing MVP.

Транскрипт: https://docs.google.com/document/d/1AxMOqf5KXgdL1n7CVNgkIssgTTQKqNSgtjoOiLBE8kQ/edit?tab=t.0

Сегмент користувача починається приблизно з `22:51`; попередня частина стосується іншого студента й не повинна приписуватися цьому проєкту.

Ключовий feedback Тетяни:

- ідею та поточний стан проєкту оцінено позитивно; концепція після demo зрозуміла;
- мінімальний функціональний scope достатній для MVP; нових обов’язкових функцій не вимагалося;
- React SPA без backend допустима для поточного MVP, бо немає user cabinet/auth/history/server persistence; backend додавати лише за конкретної вимоги;
- основний пріоритет — суттєво деталізувати пояснювальну записку, а не ускладнювати реалізацію;
- headings мають бути предметними й прив’язаними до теми, а не копіювати placeholder-назви методички;
- Chapter 1: коротко дати контекст, чітко виділити проблему, явно описати що вмітиме проєкт, розширити практичну цінність;
- Chapter 2: додати теорію, наукові джерела, оцінювання автономності/формули, деталізувати аналоги, скриншоти за доречності, плюси/мінуси та текстову інтерпретацію таблиць; gap залишати лише за достатньої доказовості;
- Chapter 3: пояснювати таблиці вимог у прозі, явно описати межі MVP, деталізувати фактичні ітерації, обґрунтувати client-side architecture/React, суттєво розширити Availability Estimator / Simulation Engine і формули;
- старі 3.3 + 3.4 об’єднати в `Обґрунтування архітектури та технологічного стеку проєкту`;
- Chapter 4: показати фактичний результат — UI screenshots, технічну реалізацію, структуру/фрагменти коду за потреби, validation/calculation details, real test results;
- AI use потрібно явно задекларувати: де і для яких задач використовувався;
- фінально перевірити 12 pt, 1.5 line spacing, прибрати зайві bold/italic;
- для висновків/захисту продумати масштабування та модель підтримки/фінансування; числові оцінки — тільки з джерелами/реальними розрахунками;
- озвучена дата подання — `2026-09-14`;
- до наступної зустрічі підготувати Chapters 1–4; Chapter 5 — якщо дозволить час.

## Прямі коментарі Тетяни в Google Doc

Робоча пояснювальна записка: https://docs.google.com/document/d/1sWA7sMvRp_X0hZUpSc310kh-wJ_fARo6OipjGoFtLB8/edit?usp=drivesdk

Зафіксовано чотири відкриті supervisor comments:

- `додати що буде вміти проєкт` — враховано у Chapter 1 pass 2026-08-24 через явний опис функціональних можливостей MVP; comment не resolve до підтвердження керівника;
- `обʼєднати з 3.4` — виконано структурно: старі 3.3 і 3.4 об’єднано; comment не resolve до підтвердження керівника;
- `розширити` — стосується Availability Estimator / Simulation Engine і формул; ще потребує змістовного розширення Chapter 3;
- `для чого і де?` біля `штучного інтелекту` — ще потребує конкретного опису фактичного AI use у декларації/відповідному місці записки.

Власні технічні коментарі користувача (дати, Student ID, підпис тощо) не змішувати з supervisor feedback.

## Explanatory note checkpoint — Chapter 1 pass

2026-08-24 виконано повний змістовний pass Chapter 1 за трьома джерелами: вимоги Neoversity, усний feedback другого demo та прямі comments Тетяни.

Актуальна структура Chapter 1:

- `1.1. Відключення електроенергії в Україні та потреби побутових користувачів`;
- `1.2. Обґрунтування необхідності оцінювання доступності побутових сервісів`;
- `1.3. Мета, завдання та функціональні можливості вебсистеми`;
- `1.4. Наукова новизна та практична цінність проєкту`;
- `1.5. Структура пояснювальної записки`;
- `Висновки до першого розділу`.

Змістовні зміни:

- додано перевірений контекст енергетичної ситуації в Україні на основі IEA `Energy System Resilience` (2026);
- чіткіше визначено кінцевого побутового користувача та значення терміна «критичний побутовий сервіс» у межах роботи;
- проблема сформульована як розрив між автономністю окремого Device і доступністю Service через обов’язкові залежності;
- 1.3 тепер прямо описує, що вміє MVP: Equipment/Backup, service templates/dependencies, outage scenario, External Provider availability, Device availability estimation, service status/time/bottleneck/causal path, repeat calculation;
- розширено практичну цінність і чітко обмежено твердження: результат є scenario-based estimate, не гарантія фактичної роботи обладнання;
- новизна лишається як адаптація/поєднання відомих dependency/resilience approaches для побутового контексту, без заяви про новий метод;
- висновки Chapter 1 розширено до повноцінного підсумку й переходу до Chapter 2;
- у bibliography додано фактично використане джерело `[13] International Energy Agency, Energy System Resilience, 2026`, accessed 2026-08-24;
- нові зміни в робочому Google Doc позначено помаранчевим за поточною convention.

## UX Polish v1 — verification evidence

Фінальна verification evidence:

- full suite: `140 passed`, `0 failed`, `0 skipped`;
- production build: Vite `8.2.1`, `36 modules transformed`, success;
- `git diff --check` — PASS;
- whole-branch review: initial `2 Major` + `2 Minor` fixed; final verdict `ACCEPTED`, no Critical/Major/Minor;
- browser/manual acceptance — PASS for density, navigation/state retention, stale Result, validation discoverability, quick edit, rerun, UA/EN state retention, keyboard acceptance;
- post-deploy live smoke — PASS for compact Step 1, language state retention, backward navigation, recalculation and stale-result protection.

No external usability study, screen-reader result or performance baseline is currently recorded. Do not invent these results.

Integration/deploy checkpoint: merged to `main`, relevant merge-ready/main commit `0d6e383c0ae71c12b1497efe21f0a47ec80e068c`; GitHub Pages deployment completed successfully.

## Source of truth

- `docs/STATUS.md` — current operational snapshot;
- `docs/DECISIONS.md` — accepted substantive decisions;
- `docs/specs/user-facing-mvp-v1.md`;
- `docs/specs/user-facing-mvp-v1-acceptance.md`;
- `docs/specs/ux-polish-v1.md`;
- `docs/specs/ux-polish-v1-acceptance.md`;
- `docs/plans/ux-polish-v1.md`;
- `docs/specs/repository-workflow.md`.

## Наступна дія

Week 4 reporting checkpoint закрито як accepted.

Chapter 1 content pass завершено. Наступний пріоритет — Chapter 2:

1. суттєво розширити `2.1` теорією оцінювання автономності й перевіреними академічними/офіційними джерелами;
2. деталізувати `2.2` аналіз аналогів, їхні плюси/мінуси, цільову аудиторію та текстову інтерпретацію таблиці; додати screenshots лише де вони реально допомагають аналізу;
3. розширити `2.3`: визначення dependency modelling, реальні підходи/типи моделей, cascading failures, redundancy/resilience;
4. після цього повторно перевірити доказовість `2.4 gap`;
5. далі перейти до Chapter 3 comment `розширити` і явної декларації AI use.

Не розширювати MVP новими функціями без конкретної вимоги.