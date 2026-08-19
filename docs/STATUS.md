# Поточний стан проєкту

## Поточний етап

`Simulation Engine v1`, `React Demo v1` і `Deploy v1` завершено та прийнято після незалежних review.

Публічна demo доступна: https://serhii-palamarchuk.github.io/capstone-household-service-availability/

Поточний deployed Internet UI є першим наскрізним **vertical slice** для перевірки технічної гіпотези та інтеграції з `Simulation Engine v1`. Він не вважається фінальною UX-моделлю продукту.

## Активне завдання

Активного implementation task немає. Новий autonomous coding cycle не запускати до окремої spec/plan наступної користувацької ітерації.

## Поточне продуктове рішення

Прийнято `D-003 — Користувацький рівень введення після React Demo v1` у `docs/DECISIONS.md`.

Ключове уточнення:

```text
Поточний demo:
готові години availability → Simulation Engine → результат

Цільовий користувацький напрям:
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

Кінцевий користувач має працювати з власними пристроями, джерелами резервного живлення, характеристиками навантаження, важливими сервісами та їхніми залежностями. Для локальних пристроїв окремий користувацький рівень повинен отримувати тривалість доступності з цих характеристик і передавати її в уже перевірений engine.

`External Provider` поки може залишатися сценарним входом із заданою доступністю.

Точна формула автономності, потрібні параметри потужності/ємності, коефіцієнти ефективності, validation rules і UX ще не визначені. Їх не реалізовувати мовчки: спочатку потрібні окрема специфікація, обґрунтування та план тестування.

## Історична узгодженість

Week 2 report, `React Demo v1` і `Deploy v1` не перейменовуються і не переписуються заднім числом. Вони залишаються фактичними milestone-артефактами того етапу. Нове формулювання описує подальшу еволюцію продукту.

## Остання фактична перевірка

- Simulation Engine final suite: `43 passed, 0 failed`;
- React Demo / final full suite: `53 passed, 0 failed`;
- production build: exit `0`, Vite `8.2.1`;
- GitHub Pages deployment: accepted, HTTPS live URL працює;
- ручний browser smoke користувачем:
  - `6 / 8 / 2 / 72 h` → `Limited`, `2 h`, `ONT/ONU`, `Internet → ONT/ONU`;
  - `6 / 8 / 8 / 72 h` → `Available`, `8 h`, без limiting dependency/path.

Ці значення — контрольні програмні сценарії, не результати реальних вимірювань автономності.

## Актуальна база

- canonical project context: `docs/PROJECT.md`;
- simulation contract: `docs/SIMULATION.md`;
- domain model: `docs/DOMAIN_MODEL.md`;
- acceptance scenarios: `docs/TEST_SCENARIOS.md`;
- product-direction decision: `D-003` у `docs/DECISIONS.md`;
- synchronization rules: `docs/specs/repository-workflow.md`;
- autonomous workflow: `docs/specs/autonomous-agent-workflow.md`;
- reusable prompts: `docs/specs/agent-session-prompts.md`.

## Наступна дія

1. Передати Тетяні repository, live demo і Weekly Report 2 та зафіксувати її feedback.
2. Після feedback окремо спроєктувати наступну user-facing MVP iteration: configurator сервісів/залежностей + модель обладнання/резервного живлення + availability estimation layer.
3. До початку реалізації визначити exact inputs, формулу/метод оцінювання автономності, validation rules, acceptance criteria і tests.
4. Лише після цього створити нові spec + implementation plan і запускати Developer → fresh Reviewer autonomous cycle.
