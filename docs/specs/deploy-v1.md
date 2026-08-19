# Deploy v1 — специфікація

## 1. Мета

Опублікувати прийнятий `React Demo v1` як статичний вебзастосунок у GitHub Pages і отримати стабільне публічне посилання для демонстрації керівнику.

## 2. Погоджений hosting

Hosting/platform: **GitHub Pages**.

Користувач підтвердив 2026-08-19, що GitHub Pages проходився в межах навчальної програми.

Deployment виконується через **GitHub Actions** із гілки `main`.

Очікувана адреса для repository site:

`https://serhii-palamarchuk.github.io/capstone-household-service-availability/`

Фактичним source of truth після deploy є URL, який повертає GitHub Pages deployment.

## 3. Архітектурні межі

`Deploy v1` не змінює архітектуру застосунку:

```text
Browser
  ↓
GitHub Pages static hosting
  ↓
React Demo v1
  ↓
Simulation Engine v1
```

- backend не додається;
- API не додається;
- DB/persistence не додаються;
- simulation engine не змінюється;
- deploy не повинен переносити domain/simulation logic у workflow або hosting configuration.

## 4. Поточна структура build

Web application root:

`apps/web`

Package manager:

`npm`

Lockfile:

`apps/web/package-lock.json`

Production build command:

`npm run build`

Default Vite output:

`apps/web/dist`

## 5. Vite base path

Repository site розміщується не в корені `https://<username>.github.io/`, а за шляхом repository name.

Тому Vite config повинен використовувати:

```js
base: '/capstone-household-service-availability/'
```

Це потрібно, щоб production HTML посилався на JS/CSS assets через правильний GitHub Pages subpath.

## 6. GitHub Actions workflow

Створюється один deployment workflow:

`.github/workflows/deploy-pages.yml`

Workflow повинен:

1. запускатися для релевантних push у `main` і вручну через `workflow_dispatch`;
2. checkout repository;
3. використовувати Node.js 24;
4. використовувати npm cache через `apps/web/package-lock.json`;
5. виконувати `npm ci` у `apps/web`;
6. виконувати повний `npm test` перед deploy;
7. виконувати `npm run build`;
8. конфігурувати GitHub Pages;
9. upload `apps/web/dist` як Pages artifact;
10. deploy artifact у environment `github-pages`;
11. повертати deployment URL.

Мінімальні permissions:

```yaml
contents: read
pages: write
id-token: write
```

Force push, окрема `gh-pages` branch або commit build artifacts у repository не використовуються.

## 7. One-time repository setting

GitHub Pages repository source має бути **GitHub Actions**.

Якщо Pages ще не увімкнено/не налаштовано, autonomous agent не додає Personal Access Token і не commit-ить credentials. Він зупиняється та просить користувача виконати одноразову дію:

`Repository → Settings → Pages → Build and deployment → Source → GitHub Actions`.

Після цього workflow можна rerun через `workflow_dispatch` або повторний запуск failed workflow.

## 8. Verification

До acceptance `Deploy v1` потрібно фактично підтвердити:

### Local/source verification

- `npm test` — exit `0`;
- `npm run build` — exit `0`;
- `dist/index.html` використовує repository base path для built assets;
- `git diff --check` — exit `0`.

### GitHub verification

- deployment workflow завершився `success`;
- deployment environment — `github-pages`;
- public Pages URL доступний по HTTPS;
- root page повертає успішну HTTP-відповідь;
- built JS/CSS assets, на які посилається production HTML, доступні через repository subpath.

### Functional smoke

На публічній версії має зберігатися поведінка прийнятого `React Demo v1`:

1. `6 / 8 / 2 / 72 h` → `Limited`, `2 h`, `ONT/ONU`, `Internet → ONT/ONU`;
2. зміна `ONT/ONU = 8 h` → `Available`, `8 h`, без limiting dependency і causal path.

Якщо Reviewer environment не має browser runtime, HTTP/assets verification виконується автоматично, а фінальний browser smoke фіксується як manual user verification; відсутність browser binding не є підставою вигадувати результат.

## 9. Documentation outcome

Після успішного deploy:

- у `README.md` додається короткий `Live demo` link;
- `docs/STATUS.md` фіксує фактичний Pages URL, workflow result і verification;
- керівнику можна передати repository URL + live demo URL.

## 10. Out of scope

У `Deploy v1` не входять:

- custom domain;
- CDN configuration;
- analytics;
- monitoring service;
- preview environments для PR;
- backend/server hosting;
- environment secrets;
- PAT-based Pages enablement;
- Docker;
- окремий deployment framework/service.

## 11. Джерела рішення

- Vite Documentation, **Deploying a Static Site — GitHub Pages**, accessed 2026-08-19: https://vite.dev/guide/static-deploy.html
- GitHub Docs, **Using custom workflows with GitHub Pages**, accessed 2026-08-19: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- GitHub Docs, **Deploying your website automatically**, accessed 2026-08-19: https://docs.github.com/en/get-started/start-your-journey/deploying-your-website-automatically
