# Поточний стан проєкту

Оновлено: 2026-09-03 (після фінального перегляду записки та підготовки Week 6 report до подання).

## Поточний етап

Завершені milestones: `Simulation Engine v1`, `React Demo v1`, `Deploy v1`, `User-facing MVP v1`, `UX Polish v1`.

Live URL: https://serhii-palamarchuk.github.io/capstone-household-service-availability/

Архітектура MVP: React SPA + Vite, client-side runtime, GitHub Pages; backend і БД відсутні. Без окремого рішення не змінювати Simulation Engine v1, Availability Estimator formulas, service-template semantics, status semantics і recommendation logic.

Нові функції до завершення пояснювальної записки та фінального демо не додавати.

## Reporting checkpoint

- Week 2 — accepted.
- Week 3 — accepted 2026-08-21.
- Week 4 — accepted 2026-08-24.
- Week 5 — accepted; для Week 6 потрібно подати готову пояснювальну записку.
- Week 6 report підготовлено на базі Week 5 зі збереженням структури та artifact links: https://docs.google.com/document/d/1wpRGYzFgslrH8iUOky_w3zgBE2tp0hJPfv88Yb4H5tc/edit?usp=drivesdk.
- Сергій самостійно підкоригував Week 6 report перед поданням; документ більше не редагувати без прямого запиту.
- У supervisor-facing звітах без потреби не використовувати ім’я керівника; достатньо нейтральних формулювань «керівник» / «науковий керівник».
- Фінальне демо ще НЕ проведено. Не приписувати йому результати або feedback до фактичного проведення.

## Explanatory note checkpoint

Робочий Google Doc: https://docs.google.com/document/d/1sWA7sMvRp_X0hZUpSc310kh-wJ_fARo6OipjGoFtLB8/edit?usp=drivesdk

Chapters 1–5, AI declaration, bibliography й Appendix A змістовно заповнені. Нового змісту не додавати без конкретної виявленої прогалини.

### Фінальна A4-верстка — 2026-09-03

- документ переведено в A4 `210 × 297 мм`;
- поля: ліве `2,5 см`, праве `1,5 см`, верхнє/нижнє `2 см`;
- звичайний основний текст має залишатися вирівняним по ширині (`Justify`); це постійне правило й вимога офіційного шаблону Neoversity;
- `СПИСОК ТАБЛИЦЬ` і `СПИСОК РИСУНКІВ` оформлено як реальні таблиці `№ / Назва / Сторінка`;
- зміст заповнено фактичними номерами сторінок;
- усі номери сторінок у списках таблиць і рисунків синхронізовано з фінальною пагінацією;
- виправлено orphan heading §2.4: `2.4. Прогалина існуючих рішень та вимоги до вебсистеми` тепер починається на стор. 26; `Висновки до другого розділу` — стор. 27;
- Рисунок 3.1 після випадкового видалення під час попереднього formatting pass відновлено та повторно перевірено; надалі структурні правки робити лише точково й одразу перевіряти сусідні рисунки/таблиці в PDF.

### Поточний PDF

Fresh export:

- **57 сторінок**;
- формат **A4** (`596 × 842 pt` у PDF renderer);
- зміст — стор. 4–5;
- список таблиць — стор. 6;
- список рисунків — стор. 7;
- список скорочень — стор. 8;
- анотація — стор. 9–10;
- Розділ 1 — стор. 11;
- Розділ 2 — стор. 17; §2.4 — стор. 26; висновки — стор. 27;
- Розділ 3 — стор. 28; Рисунок 3.1 — стор. 35; Рисунок 3.2 — стор. 37;
- Розділ 4 — стор. 41;
- Рисунки 4.1–4.4 — стор. 41, 42, 43, 44;
- Рисунки 4.5–4.8 — стор. 46, 47, 48, 49;
- Розділ 5 — стор. 52;
- бібліографія — стор. 55–56;
- додатки / Таблиця А.1 — стор. 57.

Повний visual QA усіх 57 сторінок виконано. Видимого clipping, overlap або зламаних glyphs не виявлено; рисунки 2.1–2.3, 3.1–3.2 та 4.1–4.8 присутні й читабельні; таблиці, code screenshots, bibliography та Appendix A відображаються коректно. Після останнього page-break fix повторно перевірено стор. 25–28 і front matter стор. 4–7.

## Technical documentation checkpoint

- Канонічний Mermaid-source Рисунка 3.2: `docs/diagrams/service-availability-evaluation-diagram.md`.
- У §4.2 два ключові фрагменти реалізації оформлено як screenshot-рисунки із syntax highlighting: Рисунок 4.5 — Availability Estimator shared-load/runtime calculation; Рисунок 4.6 — recursive Simulation Engine calculation.
- Рисунок 4.7 — automated tests; Рисунок 4.8 — GitHub Actions build/deploy.
- Програмний код і product semantics під час documentation/layout pass не змінювалися; нового запису в `docs/DECISIONS.md` не потрібно.

## Financial viability checkpoint

- Поточний public MVP використовує GitHub Free / GitHub Pages / стандартні GitHub-hosted runners у межах чинних умов для публічного репозиторію; це не означає нульову загальну вартість супроводу.
- Labor planning scenario: DOU median developer salary June 2026 = 3500 дол. США/місяць net, sample 4541 developers; planning assumptions 160 h/month and 8 h support/month → 21.9 дол. США/h → 175 дол. США/month → 2100 дол. США/year. Це сценарна оцінка, не виміряна трудомісткість і не grant rate.
- Точний TAM не заявляється; підтверджених домовленостей про фінансування немає.

## Supervisor comments in Google Docs

Останній відкритий comment `додати що буде вміти проєкт` Сергій закрив 2026-09-03. Відкритих supervisor comments у робочій записці більше немає.

## Постійні правила редагування записки

- Для нових змістовних правок ChatGPT/Codex за потреби знову використовувати помаранчеве `#E65900`, щоб Сергій бачив нові зміни. Попереднє маркування Сергій уже переглянув і самостійно прибрав; відновлювати його не потрібно.
- **Звичайний основний текст зберігати `Justify`; не скидати вручну встановлене вирівнювання під час наступних правок.**
- Редагувати лише цільовий фрагмент; після структурних змін перевіряти сусідні рисунки/таблиці та page breaks у PDF.
- Назви UI: українська назва першою, точна англійська — у дужках.
- Внутрішні identifiers у прозі спочатку пояснювати українською, точний identifier давати в дужках.
- Після кожного редагування повідомляти розділ/підрозділ і сторінки за поточною пагінацією.
- Не вигадувати usability study, screen-reader results, фінансування, фактичні device measurements або test numbers.

## Communication style checkpoint

- Короткі повідомлення для LMS/Slack писати природно й по-людськи, без офіціозу та канцеляризмів.
- Формат: коротке привітання → що завершено/подано → подяка та прохання про feedback.
- Узгоджений приклад для LMS: `Вітаю, Тетяно. Я завершив роботу над MVP та фіналізував пояснювальну записку; усі посилання оновлено. Буду вдячний за ваш фідбек.`

## Verification baseline

- automated suite: `141 passed`, `0 failed`, `0 skipped`;
- Vite `8.2.1` production build: success, `36 modules transformed`;
- `git diff --check`: PASS;
- whole-branch review: initial `2 Major + 2 Minor` fixed; final `ACCEPTED`;
- browser/manual acceptance: PASS;
- post-deploy live smoke: PASS;
- performance baseline: local `runUserScenario`, 1 000 warm-up, 5 × 20 000 measured = 100 000 runs; Node.js `v24.19.0`, Linux x86_64, Xeon E5-2673 v4 @ 2.30 GHz; median `0.026 ms/run`, mean `0.028 ms/run`; calculation loop only, no browser/network/low-end-device claim and no predefined acceptance threshold;
- external usability study and screen-reader evaluation НЕ проводилися.

## Source of truth

1. Google Drive `Capstone Project Context — Software Engineering`.
2. `docs/STATUS.md`.
3. `docs/DECISIONS.md` + accepted specs.
4. Working explanatory note in Google Drive.

## Final note approval checkpoint — 2026-09-03

- Сергій переглянув фінальну A4-версію й підтвердив, що вона виглядає коректно.
- Сергій самостійно прибрав помаранчеве маркування змін; відновлювати його не потрібно, якщо не буде нових змістовних правок.
- Усі supervisor comments закриті.

## Наступна дія

1. Подати Week 6 report разом із готовою пояснювальною запискою через LMS; після подання зафіксувати факт submission.
2. Дочекатися фактичного feedback керівника й внести лише необхідні точкові правки.
3. Фінальне 15-хвилинне демо готувати паралельно/за потреби; не затримувати поточне подання лише через відсутність записаного відео, якщо LMS прямо його не вимагає.
4. Не вважати демо проведеним і не записувати результатів/feedback до фактичного проведення.
