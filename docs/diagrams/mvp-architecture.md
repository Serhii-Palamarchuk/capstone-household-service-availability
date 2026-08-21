# Архітектура User-facing MVP

```mermaid
flowchart LR
    U["Користувач"]

    subgraph SPA["React SPA — браузер"]
        direction LR

        UI["UI<br/>4 кроки"]
        ST["Шаблони сервісів"]
        EP["Доступність<br/>External Provider"]
        V["Нормалізація<br/>та валідація"]
        AE["Availability Estimator<br/>оцінювання доступності Device"]
        SE["Simulation<br/>Engine v1"]
        R["Result<br/>статус · доступність · причини"]

        UI --> V
        ST --> V
        EP --> V
        V -->|валідована модель| AE
        AE -->|підготовлена модель сценарію| SE
        SE --> R
    end

    U --> UI
```

Схема показує фактичний runtime flow поточного MVP. Шаблони сервісів і ручна доступність External Provider є частиною клієнтського сценарію та обробляються всередині React SPA. Після нормалізації й валідації Availability Estimator доповнює валідовану модель розрахованою часовою доступністю Device. Підготовлена модель сценарію передається до Simulation Engine v1, який визначає доступність сервісу, статус і причини обмеження. Backend і база даних у поточному MVP відсутні.

Контракт схеми узгоджений із `docs/specs/user-facing-mvp-v1.md`, `docs/DECISIONS.md` і `docs/STATUS.md`.

Raw Mermaid source: [`mvp-architecture.mmd`](./mvp-architecture.mmd).
