# Архітектура User-facing MVP

```mermaid
flowchart TB
    U["Користувач"]

    subgraph SPA["React SPA — браузер"]
        direction TB

        UI["UI<br/>4 кроки"]
        V["Нормалізація<br/>та валідація"]
        AE["Availability Estimator<br/>оцінювання доступності Device"]
        SE["Simulation Engine v1"]
        R["Result<br/>статус · доступність · причини"]

        ST["Шаблони сервісів"]
        EP["Доступність<br/>External Provider"]

        UI --> V
        ST --> V
        EP --> V
        V --> AE
        AE --> SE
        SE --> R
    end

    U --> UI
```

Схема показує фактичний runtime flow поточного MVP. Шаблони сервісів і ручна доступність External Provider є частиною клієнтського сценарію та обробляються всередині React SPA. Після нормалізації й валідації Availability Estimator доповнює модель розрахованою часовою доступністю Device. Підготовлена модель передається до Simulation Engine v1, який визначає доступність сервісу, статус і причини обмеження. Backend і база даних у поточному MVP відсутні.

Контракт схеми узгоджений із `docs/specs/user-facing-mvp-v1.md`, `docs/DECISIONS.md` і `docs/STATUS.md`.

Raw Mermaid source: [`mvp-architecture.mmd`](./mvp-architecture.mmd).
