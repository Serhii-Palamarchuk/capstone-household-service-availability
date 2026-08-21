# Архітектура User-facing MVP

```mermaid
flowchart LR
    U["Користувач"]

    subgraph SPA["React SPA — браузер"]
        direction LR

        UI["UI<br/>4 кроки"]
        ST["Шаблони сервісів"]
        EP["External Provider<br/>availability"]
        V["Нормалізація<br/>та валідація"]
        AE["Availability<br/>Estimator"]
        SE["Simulation<br/>Engine v1"]
        R["Result<br/>статус · час · причини"]

        UI --> V
        ST --> V
        EP --> V
        V --> AE
        AE -->|доступність Device| SE
        V -->|граф сервісів + сценарій| SE
        SE --> R
    end

    U --> UI
```

Схема показує фактичний runtime flow поточного MVP. Шаблони сервісів і ручна доступність External Provider є частиною клієнтського сценарію та обробляються всередині React SPA. Availability Estimator формує часову доступність Device, а Simulation Engine v1 використовує її разом із графом сервісів і сценарієм відключення для формування результату. Backend і база даних у поточному MVP відсутні.

Контракт схеми узгоджений із `docs/specs/user-facing-mvp-v1.md`, `docs/DECISIONS.md` і `docs/STATUS.md`.

Raw Mermaid source: [`mvp-architecture.mmd`](./mvp-architecture.mmd).
