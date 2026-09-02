# Поточний стан проєкту

Оновлено: 2026-09-03 (після financial viability / support-cost update пояснювальної записки).

## Поточний етап

Завершені milestones: `Simulation Engine v1`, `React Demo v1`, `Deploy v1`, `User-facing MVP v1`, `UX Polish v1`.

Live URL: https://serhii-palamarchuk.github.io/capstone-household-service-availability/

Архітектура MVP: React SPA + Vite, client-side runtime, GitHub Pages; backend і БД відсутні. Без окремого рішення не змінювати Simulation Engine v1, Availability Estimator formulas, service-template semantics, status semantics і recommendation logic.

## Reporting checkpoint

- Week 2 — accepted.
- Week 3 — accepted 2026-08-21.
- Week 4 — accepted Тетяною 2026-08-24.
- Week 5 report — accepted Тетяною; коментар: для тижня 5 добре, у Week 6 потрібно відправити готову пояснювальну записку.
- Week 5 Google Doc: https://docs.google.com/document/d/1hgUQa2pJnniCZo1RaQBkbbh176rfX6p8sgHQ5jn_RAk/edit?usp=drivesdk

## Supervisor comments in explanatory note

Перевірено поточні Google Docs comments і додаткові supervisor suggestions, надані користувачем скриншотами:

- `назва з прив’язкою до теми` для Chapter 2 — шаблонну назву `ДОСЛІДЖЕННЯ РИНКУ ТА ТЕХНОЛОГІЧНОГО СЕРЕДОВИЩА` замінено 2026-09-01 на `АНАЛІЗ ПІДХОДІВ ДО ОЦІНЮВАННЯ ДОСТУПНОСТІ ПОБУТОВИХ СЕРВІСІВ І МОДЕЛЮВАННЯ ЇХ ФУНКЦІОНАЛЬНИХ ЗАЛЕЖНОСТЕЙ`; зміну внесено і в зміст, і в основний текст та позначено помаранчевим;
- `додати що буде вміти проєкт` — змістовно враховано у Chapter 1; comment залишено відкритим до підтвердження керівником;
- `обʼєднати з 3.4` — структурно виконано в Chapter 3; comment більше не є відкритим за актуальним audit Google Docs comments;
- `розширити` — Chapter 3.4 суттєво розширено; comment resolved 2026-08-31;
- `для чого і де?` — comment прив’язаний до фрази `штучного інтелекту` у Декларації академічної доброчесності. Декларацію уточнено за фактичним використанням: ChatGPT — аналіз вимог/feedback, архітектурні рішення, пошук і перевірка інформації, документація; Codex — основний AI-асистент під час реалізації, доопрацювання, рефакторингу й автоматизованого тестування коду; Claude Code — епізодичний додатковий асистент під час роботи з кодом. Остаточні рішення сформульовано від першої особи: `я ухвалював самостійно`. Comment уже resolved 2026-08-31; disclosure після цього уточнено додатково.

Фразу про необхідність узгодити спосіб бібліографічного цитування AI з тексту самої декларації прибрано як внутрішню робочу примітку. Якщо Neoversity/керівник вимагає окремий формат бібліографічного оформлення AI, його треба уточнити окремо, а не вигадувати.

## Explanatory note checkpoint

Робочий Google Doc: https://docs.google.com/document/d/1sWA7sMvRp_X0hZUpSc310kh-wJ_fARo6OipjGoFtLB8/edit?usp=drivesdk

- Chapters 1–4 — змістовно готові після повторної перевірки 2026-09-01;
- Chapter 2 має topic-specific title згідно із supervisor feedback;
- у Chapter 2 вставлено три фактичні ілюстрації інтерфейсів: NuWatt (рис. 2.1), Wattlix (рис. 2.2), TRN Lite (рис. 2.3), а також додано текстові посилання на них;
- у Chapter 2 формули автономності пронумеровано як (2.1) і (2.2), термінологію й формулювання gap уточнено;
- у Chapter 3 додано прямі текстові посилання на таблиці 3.1 і 3.2, пояснення після архітектурної схеми, уточнено назву 3.4, перекладено статуси й прибрано зайві англомовні робочі терміни;
- додано список скорочень для AC, DC, MVP, ONT, ONU, SPA, UI та xPON;
- усі нові текстові фрагменти, внесені ChatGPT у робочий Google Doc, позначено помаранчевим;
- Chapter 4 — підготовлена повна змістовна версія 4.1–4.4 + висновки;
- у Chapter 4 вставлено чотири фактичні UI screenshots: `Equipment`, `Backup`, `Services & Scenario`, `Result`, а в 4.3 додано рис. 4.5 з результатом автоматизованих тестів і рис. 4.6 з успішним GitHub Actions build/deploy;
- Декларація академічної доброчесності — конкретизована за фактичним використанням ChatGPT, Codex і Claude Code;
- додано анотацію з ключовими словами;
- Chapter 5 — повна версія висновків і рекомендацій; 2026-09-03 додано компактну сценарну оцінку витрат на супровід відповідно до персонального feedback Тетяни на 5-й зустрічі;
- financial viability checkpoint: для поточного public MVP GitHub Free, GitHub Pages і стандартні GitHub-hosted runners для GitHub Actions використовуються безкоштовно в межах чинних умов GitHub для публічного репозиторію; це не означає нульову загальну вартість супроводу; GitHub Pages не позиціонується як безкоштовний hosting комерційного SaaS;
- labor planning scenario: DOU median developer salary June 2026 = 3500 дол. США/місяць net, sample 4541 developers; planning assumptions 160 h/month and 8 h support/month → 21.9 дол. США/h → 175 дол. США/month → 2100 дол. США/year. Це не виміряна трудомісткість і не grant rate; taxes/overheads/program rules не включено;
- exact potential-user count не заявляється: надійно визначити його без окремого market validation не вдалося. Як proxy одного ключового сценарію наведено official NCEC/Ukrstat 2023 fixed-Internet indicator 62 per 100 households із джерельними territorial limitations; це не TAM;
- до bibliography додано sources [22]–[26]: GitHub Pricing, GitHub Actions billing, GitHub Pages limits, DOU salary report summer 2026, Ukrstat/NCEC indicator 9.6.1;
- confirmed funding agreements відсутні; grants/funds/local-government/partner funding залишаються Future Work recommendations;
- Appendix A — додано таблицю артефактів проєкту з посиланнями на repository, live demo та GitHub Actions workflow;
- автоматична навігаційна структура Google Docs налаштована через `Heading 1`/`Heading 2`; заголовки залишено чорними;
- список скорочень оформлено таблицею за шаблоном;
- поточний формат сторінки — US Letter (`612 × 792 pt`); потрібно перевести документ у A4, зберігши встановлені поля;
- за поточною US Letter pagination financial block розташований у Chapter 5 на стор. 46–47; bibliography [22]–[26] — стор. 50; після A4/page breaks номери потрібно оновити;
- у змісті ще залишаються `#` замість номерів сторінок; списки рисунків і таблиць потрібно сформувати/оновити після фінальної пагінації;
- після A4, page breaks і заповнення змісту потрібні повний PDF visual QA та фінальний експорт;
- відкритий лише один Google Docs comment: `додати що буде вміти проєкт`; вимогу вже змістовно враховано у Chapter 1, comment не закривати без рішення Сергія/підтвердження керівника.

## Постійні правила редагування записки

- Усе, що ChatGPT/Codex додає або змінює в робочій пояснювальній записці, позначати помаранчевим `#E65900`; незмінений текст залишати чорним. Не переводити погоджені зміни в чорний без прямої команди Сергія.
- Назви елементів інтерфейсу подавати за правилом: українська назва першою, у дужках — точна англійська назва UI. Приклад: `«Обладнання» (Equipment)`.
- Англомовні технічні/проєктні терміни в прозі подавати українською першими, а точний англійський відповідник — у дужках, якщо це доречно. Для code identifiers (`usableCapacityWh`, `powerW`, `maxOutputPowerW`, `totalPowerW` тощо) у прозі спочатку давати природну українську назву, а identifier — у дужках; у коді, формулах, шляхах, URL та точних назвах джерел/продуктів identifier не перекладати.
- Після кожного редагування записки повідомляти Сергію, у яких розділах/підрозділах і на яких сторінках за поточною пагінацією зроблено зміни; якщо пагінація ще не фінальна, прямо це зазначати.
- Не вигадувати результати тестування, usability study, бюджет, фінансування, фактичні показники обладнання або feedback керівника. Фінансові числа допускаються лише як прозоро позначені сценарні оцінки з перевіреними джерелами та явними припущеннями.
- Не розширювати scope MVP новими функціями до завершення записки та демо; допустимі лише погоджені косметичні правки без зміни Simulation Engine, Availability Estimator formulas, service-template semantics, status semantics або recommendation logic.

## Verification baseline

- automated suite після cosmetic duration formatting: `141 passed`, `0 failed`, `0 skipped`;
- Vite `8.2.1` production build: success, `36 modules transformed`;
- `git diff --check` — PASS;
- whole-branch review: initial `2 Major` + `2 Minor` fixed; final `ACCEPTED`;
- browser/manual acceptance — PASS;
- post-deploy live smoke — PASS;
- Chapter 4 connector/PDF readback: UI figures 4.1–4.4 and test/deploy evidence figures 4.5–4.6 present; current layout visually checked.
- performance baseline виконано для локального `runUserScenario`: 1 000 warm-up запусків, 5 серій × 20 000 виміряних запусків (100 000 загалом), Node.js `v24.19.0`, Linux x86_64, Intel Xeon E5-2673 v4 @ 2.30 GHz; median `0.026 ms/run`, mean `0.028 ms/run`;
- baseline охоплює лише локальний розрахунковий контур для одного невеликого deterministic fixture; не охоплює browser rendering, network latency або low-end devices і не має наперед заданого acceptance threshold;
- external usability study і screen-reader result не проводилися. Не вигадувати результати.

## Cosmetic duration formatting

- Реалізовано display-only форматування тривалості без зміни внутрішніх integer-minute calculations.
- Українською: `45 хв`, `1 год`, `1 год 25 хв`, `0 хв`; англійською: `45 min`, `1 h`, `1 h 25 min`, `0 min`.
- Форматер використовується на `Result` і в recommendation helper messages; legacy demo також оновлено.
- Code review: Critical — none, Important — none; minor direct zero-case test додано.
- Локальний commit реалізації: `b36fa30` (`Format durations as hours and minutes`); локальний commit попередньої синхронізації статусу: `0a06cfe`.
- Push у `origin/main` виконано через підключений GitHub connector як fast-forward без force. GitHub створив еквівалентні remote commits `85d66bf4acaad09529482cf5b3672d46faf8f37a` (`Format durations as hours and minutes`) і `d99a670e3504a94ff269a9fd23c5a6dbec2a7ad6` (`docs: record Week 6 continuation checkpoint`).

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

1. Перевести записку з US Letter у A4 і налаштувати фінальні page breaks.
2. Сформувати/оновити списки рисунків і таблиць, потім заповнити номери сторінок у змісті.
3. Виконати повний PDF visual QA; виправити лише фактичні проблеми верстки.
4. Після прямого підтвердження Сергія прибрати помаранчеве маркування, експортувати фінальний PDF і передати Тетяні готову записку.
5. Після завершення записки підготувати й відрепетирувати 15-хвилинне демо та матеріали Week 6.

Нові функції не додавати до завершення цих кроків.
