# Поточний стан проєкту

Оновлено: 2026-09-03 (після feedback керівника на Week 6).

## Поточний етап

Завершені milestones: `Simulation Engine v1`, `React Demo v1`, `Deploy v1`, `User-facing MVP v1`, `UX Polish v1`.

Live URL: https://serhii-palamarchuk.github.io/capstone-household-service-availability/

Архітектура MVP: React SPA + Vite, client-side runtime, GitHub Pages; backend і БД відсутні. Без окремого рішення не змінювати Simulation Engine v1, Availability Estimator formulas, service-template semantics, status semantics і recommendation logic.

Нові функції до завершення пояснювальної записки та фінального демо не додавати.

## Reporting checkpoint

- Week 2 — accepted.
- Week 3 — accepted 2026-08-21.
- Week 4 — accepted 2026-08-24.
- Week 5 — accepted.
- Week 6 report подано; 2026-09-03 о 14:14 отримано feedback керівника: `залишила коментарі в документі. Треба доробити`.
- Week 6 report Сергій самостійно підкоригував перед поданням; документ більше не редагувати без прямого запиту.
- У supervisor-facing звітах без потреби не використовувати ім’я керівника; достатньо нейтральних формулювань `керівник` / `науковий керівник`.
- Фінальне демо ще НЕ проведено. Не приписувати йому результати або feedback до фактичного проведення.

## Explanatory note checkpoint

Робочий Google Doc: https://docs.google.com/document/d/1sWA7sMvRp_X0hZUpSc310kh-wJ_fARo6OipjGoFtLB8/edit?usp=drivesdk

Chapters 1–5, AI declaration, bibliography й Appendix A змістовно заповнені. Нового змісту не додавати без конкретної виявленої прогалини.

### Новий feedback керівника — 2026-09-03

У записці відкрито **9 нових supervisor comments**. Вони переважно стосуються оформлення, а не зміни функціонального scope або логіки MVP:

1. прибрати синій колір тексту;
2. прибрати вбудовані вертикальні відступи по всій роботі;
3. анотацію вмістити на одну сторінку;
4. назви підрозділів оформити 12 pt відповідно до офіційного Шаблону;
5. усунути напівпорожні сторінки / дозаповнити порожні рядки там, де це потрібно для коректної верстки;
6. оформити рисунки й таблиці відповідно до Шаблону;
7. у відповідному підписі замінити тире на двокрапку за Шаблоном;
8. прибрати зайву жирність у звичайному тексті та таблицях;
9. після кожного рисунка й таблиці додати текстове пояснення.

Коментарі не закривати до фактичного внесення правок і повторної перевірки документа.

## Verification baseline

- automated suite: `141 passed`, `0 failed`, `0 skipped`;
- Vite `8.2.1` production build: success, `36 modules transformed`;
- `git diff --check`: PASS;
- whole-branch review: initial `2 Major + 2 Minor` fixed; final `ACCEPTED`;
- browser/manual acceptance: PASS;
- post-deploy live smoke: PASS;
- performance baseline: local `runUserScenario`, 1 000 warm-up, 5 × 20 000 measured = 100 000 runs; Node.js `v24.19.0`, Linux x86_64, Xeon E5-2673 v4 @ 2.30 GHz; median `0.026 ms/run`, mean `0.028 ms/run`; calculation loop only, no browser/network/low-end-device claim and no predefined acceptance threshold;
- external usability study and screen-reader evaluation НЕ проводилися.

## Постійні правила редагування записки

- Для нових змістовних правок ChatGPT/Codex за потреби використовувати помаранчеве `#E65900`, щоб Сергій бачив нові зміни.
- Звичайний основний текст зберігати `Justify`.
- Редагувати лише цільовий фрагмент; після структурних змін перевіряти сусідні рисунки/таблиці та page breaks у PDF.
- Назви UI: українська назва першою, точна англійська — у дужках.
- Внутрішні identifiers у прозі спочатку пояснювати українською, точний identifier давати в дужках.
- Після кожного редагування повідомляти розділ/підрозділ і сторінки за поточною пагінацією.
- Не вигадувати usability study, screen-reader results, фінансування, фактичні device measurements або test numbers.

## Source of truth

1. Google Drive `Capstone Project Context — Software Engineering`.
2. `docs/STATUS.md`.
3. `docs/DECISIONS.md` + accepted specs.
4. Working explanatory note in Google Drive.

## Наступна дія

1. Системно пройти всі 9 нових comments і звірити оформлення з офіційним Шаблоном Neoversity.
2. Спочатку виправити глобальні formatting rules (колір, vertical spacing, heading 12 pt, bold), потім таблиці/рисунки й пояснення після них, потім сторінкову верстку та анотацію.
3. Після правок повторно експортувати PDF і виконати visual QA всієї роботи; тільки після цього закрити comment threads.
4. Фінальне 15-хвилинне демо готувати після стабілізації записки; новий функціонал MVP не додавати.
