# Журнал рішень

Цей файл зберігає лише **суттєві рішення**, які впливають на вимоги, предметну модель, алгоритм, архітектуру, scope або погоджений технологічний вибір.

Він не замінює канонічні документи. Поточна істина завжди має бути відображена у відповідному `PROJECT.md`, `DOMAIN_MODEL.md`, `SIMULATION.md`, `TEST_SCENARIOS.md` або іншій погодженій специфікації.

Не додавати сюди дрібні рефакторинги, перейменування локальних функцій, форматування чи звичайні implementation details, якщо вони не змінюють контракт або архітектурне рішення.

## Формат запису

```text
D-XXX — Назва
Date: YYYY-MM-DD
Status: Accepted | Superseded

Context:
...

Alternatives:
1. ...
2. ...

Criteria:
- ...

Decision:
...

Rationale:
...

Affected:
- docs/...
- implementation area
```

Якщо рішення замінене новим, старий запис не видаляється: його `Status` змінюється на `Superseded` із посиланням на новий `D-XXX`.

---

## D-001 — Репозиторій як спільний контекст для AI-агентів

Date: 2026-08-18
Status: Accepted

### Context

У проєкті можуть по черзі працювати ChatGPT, Claude Code, Codex, GitHub Copilot та інші coding agents. Історія одного чату або локальна пам’ять конкретного агента не є надійним способом передачі актуального стану між ними.

### Alternatives

1. Передавати контекст вручну в кожному новому чаті або task prompt.
2. Дублювати повну історію роботи в окремих інструкціях для кожного агента.
3. Використовувати GitHub-репозиторій як спільне джерело актуального контексту.

### Criteria

- однакова інформація для всіх агентів;
- мінімум дублювання;
- можливість відновити контекст у новій сесії;
- чітке розділення поточного стану, поточних правил і історії рішень;
- придатність для публічного репозиторію.

### Decision

Використовувати репозиторій як спільний контекст:

- `AGENTS.md` — стабільні правила роботи;
- `docs/STATUS.md` — короткий поточний operational snapshot, який перезаписується;
- канонічні `docs/*.md` — актуальні вимоги й технічні правила;
- `docs/DECISIONS.md` — append-only журнал суттєвих рішень і причин;
- `docs/plans/` — погоджені плани конкретних реалізацій;
- інструмент-специфічні instruction files повинні бути короткими bridge-файлами до спільного контексту, а не копіями правил.

Якщо під час реалізації виникає невизначеність, що потребує нового суттєвого рішення, Developer не вирішує її мовчки: фіксує `Q-XXX` у `STATUS.md`, призупиняє відповідну частину роботи та передає питання користувачу. Після рішення оновлюються `DECISIONS.md`, відповідний канонічний документ і `STATUS.md`.

### Rationale

Ця схема дозволяє різним агентам працювати послідовно без залежності від приватної історії конкретного чату та не перетворює `STATUS.md` на великий журнал.

### Affected

- `AGENTS.md`
- `docs/STATUS.md`
- `docs/DECISIONS.md`
- `docs/specs/repository-workflow.md`
- `.github/copilot-instructions.md`

---

## D-002 — GitHub Pages для Deploy v1

Date: 2026-08-19
Status: Accepted

### Context

`Simulation Engine v1` і `React Demo v1` завершені та прийняті. Для демонстрації керівнику потрібна публічна робоча версія без додавання backend або нової серверної інфраструктури.

Користувач підтвердив, що GitHub Pages проходився в межах навчальної програми.

### Alternatives

1. GitHub Pages через GitHub Actions.
2. Окремий static hosting provider (наприклад, Vercel/Netlify/Render).
3. Не робити deploy і демонструвати тільки локальний запуск.

### Criteria

- мінімальна нова інфраструктура;
- відповідність поточній статичній React/Vite архітектурі;
- публічний HTTPS URL;
- автоматичний build/deploy із `main`;
- відсутність backend і secrets;
- простота пояснення на захисті;
- технологія підтверджена користувачем як пройдена в навчальній програмі.

### Decision

Використати **GitHub Pages** як hosting для `Deploy v1` і **GitHub Actions** як build/deploy mechanism.

Vite repository base path:

`/capstone-household-service-availability/`

Deployment source:

`main → GitHub Actions → GitHub Pages`.

### Rationale

Поточний React Demo є повністю статичним і вже збирається Vite у `dist`, тому GitHub Pages вирішує конкретну вимогу публічної демонстрації без додавання серверної частини. Офіційна документація Vite прямо описує GitHub Pages deployment для Vite build, а GitHub підтримує Pages deployment через custom GitHub Actions workflow.

### Evidence

- Vite Documentation, **Deploying a Static Site — GitHub Pages**, accessed 2026-08-19: https://vite.dev/guide/static-deploy.html
- GitHub Docs, **Using custom workflows with GitHub Pages**, accessed 2026-08-19: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- GitHub Docs, **Deploying your website automatically**, accessed 2026-08-19: https://docs.github.com/en/get-started/start-your-journey/deploying-your-website-automatically

### Affected

- `docs/specs/deploy-v1.md`
- `docs/plans/deploy-v1.md`
- `apps/web/vite.config.js` (planned)
- `.github/workflows/deploy-pages.yml` (planned)
- `README.md` після успішного deploy

---

## D-003 — Користувацький рівень введення після React Demo v1

Date: 2026-08-19
Status: Accepted

### Context

`React Demo v1` успішно перевіряє наскрізний сценарій `UI → simulate() → result`, але користувач вводить уже готові години доступності Router, ONT/ONU та Internet Provider. Це зручно для контрольованої перевірки simulation engine, проте не відповідає цільовій ментальній моделі побутового користувача, який зазвичай знає своє обладнання, його споживання та джерела резервного живлення, а не готову тривалість доступності кожної залежності.

Також важливо не переписувати заднім числом Week 2 report або назви вже прийнятих артефактів: вони мають залишатися історичним відображенням фактичного стану на той момент.

### Alternatives

1. Залишити пряме введення тривалості доступності як фінальну модель UX.
2. Додати лише конфігуратор Service / Device / External Provider, але й надалі вимагати від користувача ручне введення готових годин для кожного Device.
3. Додати окремий користувацький рівень для обладнання та резервного живлення, який оцінює доступність локальних пристроїв і передає отриману тривалість у вже перевірений simulation engine.

### Criteria

- відповідність реальній ментальній моделі кінцевого користувача;
- збереження перевіреного `Simulation Engine v1` без зміни його базового контракту;
- чітке розділення енергетичного розрахунку та сервісної симуляції;
- можливість компонувати багаторівневі сервіси та сценарії;
- реалістичний scope для індивідуального дипломного проєкту;
- можливість окремо тестувати правильність оцінювання автономності й правильність simulation engine.

### Decision

1. Не перейменовувати і не переписувати заднім числом Week 2 report, `React Demo v1` або `Deploy v1`.
2. Поточний deployed Internet demo трактувати як **перший наскрізний vertical slice**, який перевіряє технічну гіпотезу та інтеграцію з simulation engine, а не як фінальну UX-модель продукту.
3. Для наступної користувацької ітерації орієнтуватися на flow:

```text
Equipment + backup-power characteristics
                ↓
      availability estimation
                ↓
Services + functional dependencies
                ↓
        Simulation Engine v1
                ↓
availability + status + limiting cause + causal path
```

4. Користувач повинен мати змогу описати важливі сервіси, локальні пристрої, зовнішні залежності, резервне живлення і сценарій відключення; для локальних пристроїв система має сама отримувати тривалість доступності з користувацьких характеристик, а не вимагати ручного перекладу всієї моделі у внутрішні engine inputs.
5. `External Provider` може залишатися сценарним входом із заданою доступністю, доки не буде окремо погоджено джерело або спосіб її визначення.
6. Точна формула автономності, потрібні параметри потужності/ємності, коефіцієнти ефективності, правила валідації та UX **ще не визначені**. Вони потребують окремої специфікації, обґрунтування і тестування до включення у фінальний MVP contract.

### Rationale

Таке розділення зберігає головну відмінність проєкту — сервісний аналіз залежностей і пояснення причин — але прибирає зайву вимогу до побутового користувача знати внутрішню часову модель кожного пристрою. При цьому вже протестований simulation engine не потрібно переписувати: новий користувацький рівень лише готує для нього коректні часові входи.

### Affected

- `docs/PROJECT.md`
- `README.md`
- `docs/STATUS.md`
- робоча пояснювальна записка, розділи 3.2 і 3.4
- наступна spec/plan для user-facing MVP iteration
