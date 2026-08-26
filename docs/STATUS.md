# Поточний стан проєкту

Оновлено: 2026-08-27.

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
- Week 4 report — accepted Тетяною 2026-08-24. Звіт подано через LMS і продубльовано у Slack DM о 12:22:49 EEST, message ts `1787563369.922679`.
- Відповідь Тетяни в LMS: «Вітаю, дякую за детальний звіт!» о 19:17 2026-08-24. Окремих зауважень або нових вимог у цій відповіді не зафіксовано.

## Second demo / supervisor feedback — 2026-08-24

Транскрипт: https://docs.google.com/document/d/1AxMOqf5KXgdL1n7CVNgkIssgTTQKqNSgtjoOiLBE8kQ/edit?tab=t.0

Сегмент користувача починається приблизно з `22:51`; попередня частина стосується іншого студента й не повинна приписуватися цьому проєкту.

Ключовий feedback Тетяни:

- мінімальний функціональний scope достатній для MVP; нових обов’язкових функцій не вимагалося;
- React SPA без backend допустима для поточного MVP; backend додавати лише за конкретної вимоги;
- головний пріоритет — суттєво деталізувати пояснювальну записку, а не ускладнювати реалізацію;
- Chapter 2: додати теорію, наукові джерела, формули автономності, детальніший аналіз аналогів і текстову інтерпретацію таблиць; gap залишати лише за достатньої доказовості;
- Chapter 3: пояснити вимоги в прозі, явно описати межі MVP та фактичні ітерації, обґрунтувати архітектуру/React, суттєво розширити Availability Estimator / Simulation Engine і формули;
- Chapter 4: показати фактичний результат — UI screenshots, технічну реалізацію, validation/calculation details та реальні результати тестування;
- AI use потрібно явно задекларувати: де і для яких задач використовувався;
- для захисту продумати масштабування та модель підтримки/фінансування; числові оцінки — тільки з джерелами/реальними розрахунками;
- озвучена дата подання — `2026-09-14`;
- до наступної зустрічі ціль — готові Chapters 1–4; Chapter 5 — якщо дозволить час.

## Прямі коментарі Тетяни в Google Doc

Робоча пояснювальна записка: https://docs.google.com/document/d/1sWA7sMvRp_X0hZUpSc310kh-wJ_fARo6OipjGoFtLB8/edit?usp=drivesdk

- `додати що буде вміти проєкт` — змістовно враховано у Chapter 1; comment не resolve до підтвердження керівника;
- `обʼєднати з 3.4` — виконано структурно; comment не resolve до підтвердження керівника;
- `розширити` — стосується Availability Estimator / Simulation Engine і формул; наступний пріоритет Chapter 3;
- `для чого і де?` біля згадки ШІ — ще потребує конкретного опису фактичного AI use.

Власні технічні коментарі користувача не змішувати з supervisor feedback.

## Explanatory note checkpoint — Chapters 1–2

### Chapter 1

Content pass завершено 2026-08-24: уточнено енергетичний контекст, кінцевого користувача, проблему Device runtime → Service availability, функціональні можливості MVP, новизну та практичну цінність. Додано фактично використане джерело IEA `Energy System Resilience` (2026) як `[13]`.

### Chapter 2 — content pass 2026-08-27

Розділ 2 суттєво розширено за feedback Тетяни:

- `2.1` тепер пояснює W vs Wh, сумарне активне навантаження, формули `PΣ = ΣPi`, `t = Eusable / PΣ`, `tmin = floor(Eusable / PΣ × 60)`, різницю між енергоємністю та максимальною вихідною потужністю, ExternalFirst та межі спрощеної W/Wh-моделі;
- додано перевірені джерела про вплив режиму розряду, температури, старіння та змінного навантаження на фактичну доступну ємність/оцінку автономності: `[14]` Vennam et al. (2022), `[15]` Yang et al. (2021), `[16]` Victron Energy manual;
- `2.2` розширено аналізом Energo.ua, Wattlix, NuWatt, Offgridly, Continuity Lab, TRN Lite та REopt: цільова аудиторія, сильні сторони, обмеження й текстова інтерпретація таблиці. Твердження про відсутні функції обмежені лише перевіреною публічною документацією;
- `2.3` розширено теорією функціональних залежностей і каскадних порушень на основі Hasselqvist et al., Karan & Mohammadpour, DISruptionMap і TRN Lite; порівняно довільний граф, probabilistic dependency model та детермінований DAG із mandatory dependencies; обґрунтовано спрощений підхід MVP;
- `2.4` переформульовано обережніше: gap не заявляється як глобальна відсутність подібних продуктів, а як невиявлене в проаналізованій вибірці побутових рішень поєднання простого W/Wh input, багаторівневих Service dependencies, часової симуляції та пояснення causal path;
- висновки Chapter 2 оновлено і прямо пов’язано з вимогами MVP;
- усі нові/змінені фрагменти в Google Doc позначено помаранчевим.

Наступний змістовний checkpoint пояснювальної записки — Chapter 3. Коментар Тетяни `розширити` ще не закрито.

## UX Polish v1 — verification evidence

- full suite: `140 passed`, `0 failed`, `0 skipped`;
- production build: Vite `8.2.1`, `36 modules transformed`, success;
- `git diff --check` — PASS;
- whole-branch review: initial `2 Major` + `2 Minor` fixed; final verdict `ACCEPTED`;
- browser/manual acceptance — PASS;
- post-deploy live smoke — PASS.

No external usability study, screen-reader result or performance baseline is currently recorded. Do not invent these results.

## Week 5 reporting target

Week 5 вести з прямим трасуванням у weekly report. Функціональний scope уже достатній за feedback Тетяни, тому `фіналізація MVP` означає стабілізацію, обмежений cosmetic polish, розширене тестування й документування, а не додавання нових функцій.

Користувач хоче внести невеликі косметичні UI/UX правки в MVP. Точний перелік ще не погоджено. Перед реалізацією зафіксувати короткий список; не змінювати предметну модель, Availability Estimator, Simulation Engine v1, service templates, status/recommendation semantics або MVP scope. Після змін повторити релевантні tests/build/browser smoke і включити лише фактичні результати до Week 5 report.

План Week 5 evidence:

- Chapter 2 content pass — виконано;
- повністю допрацювати Chapter 3;
- погодити й виконати обмежений cosmetic MVP polish;
- провести fresh extended verification: automated suite/build, integration/functional browser scenarios і performance baseline без вигаданого порогу; за можливості — коротку зовнішню usability перевірку з фактично доступними учасниками;
- написати першу повну версію Chapter 4 лише на основі фактичних screenshots, implementation details та test evidence;
- подати Chapters 3–4 Тетяні та зафіксувати submission/feedback;
- підготувати Week 5 report і короткий план final demo Week 6.

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

Chapter 2 content pass завершено. Далі: Chapter 3 → погодження косметичних MVP правок → cosmetic polish → fresh extended testing → Chapter 4 → submission Chapters 3–4 → Week 5 report → підготовка final demo.

Не розширювати MVP новими функціями без конкретної вимоги.