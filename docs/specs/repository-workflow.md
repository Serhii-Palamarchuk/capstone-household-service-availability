# Repository Workflow Design

## Goal

Create a single shared engineering workspace for the Neoversity MSc Software Engineering capstone project so that ChatGPT, Claude Code, and Codex work from the same requirements, domain model, decisions, and task specifications without duplicating instructions.

## Project Context

Working topic:

**Оцінювання доступності критичних побутових сервісів під час відключень електроенергії на основі моделі функціональних залежностей**

The project is an individual engineering project. The core hypothesis is that availability of a household service during a power outage should be evaluated through all mandatory functional dependencies rather than through the autonomy of a single device.

The MVP must remain narrow, testable, and realistic for one developer.

## Repository Strategy

Use one repository for the whole capstone project.

Planned structure:

```text
/
├─ AGENTS.md
├─ CLAUDE.md
├─ README.md
├─ docs/
│  ├─ PROJECT.md
│  ├─ DOMAIN_MODEL.md
│  ├─ SIMULATION.md
│  ├─ TEST_SCENARIOS.md
│  ├─ DECISIONS.md
│  ├─ specs/
│  └─ plans/
├─ apps/
│  ├─ web/
│  └─ api/              # optional, only if later justified
└─ .gitignore
```

The repository structure must remain tool-neutral. Project documentation must not depend on a specific AI plugin, coding assistant, or workflow framework.

The first implementation stage is a React client application. A Node.js API may be added later only if a concrete requirement justifies centralized processing or persistence.

## Single Source of Agent Instructions

`AGENTS.md` is the canonical shared instruction file for all coding agents.

It must contain only stable project-wide rules:

- project purpose and scope;
- MVP boundaries;
- required documents to read before implementation;
- development and review modes;
- testing and verification rules;
- architecture constraints;
- decision-log rules;
- prohibition on silently expanding scope or adding technologies.

`CLAUDE.md` must not duplicate these rules. It should only import or point Claude Code to `AGENTS.md`.

No agent-specific role is permanently assigned.

## Working Modes

Every task explicitly assigns one of two modes.

### Developer mode

The assigned agent:

- implements only the approved task specification;
- reads the referenced canonical documents first;
- changes only files required by the task;
- adds or updates tests required by the acceptance criteria;
- runs verification before reporting completion;
- does not expand scope or change architecture implicitly.

### Reviewer mode

The assigned agent:

- reviews the implementation against the task specification and canonical project documents;
- checks correctness, scope, tests, architecture, and maintainability;
- reports findings by severity;
- does not modify code unless explicitly requested to switch to Developer mode.

Claude Code and Codex may alternate between Developer and Reviewer modes from task to task.

## Canonical Technical Documents

### `docs/PROJECT.md`

Stable product-level context:

- problem;
- end user;
- goal;
- gap;
- MVP scope;
- out-of-scope items;
- current architecture stage.

### `docs/DOMAIN_MODEL.md`

Defines the domain model and invariants.

Initial node types:

- `Service`;
- `Device`;
- `External Provider`.

All modeled dependencies in the MVP are mandatory. Cycles are not allowed.

### `docs/SIMULATION.md`

Defines the deterministic availability calculation, service states, bottleneck logic, error handling, and unresolved algorithmic decisions.

Known state model:

- `Available`: `T >= H`;
- `Limited`: `0 < T < H`;
- `Unavailable`: `T = 0`.

Where `H` is outage duration and `T` is calculated service availability duration.

### `docs/TEST_SCENARIOS.md`

Contains controlled examples and acceptance scenarios used by both implementation and review.

### `docs/DECISIONS.md`

Decision log format:

`Decision → Alternatives → Criteria → Arguments → Evidence → Choice`

Important architecture or scope changes must be recorded here before implementation.

## Task Specification Format

Each implementation task should be small enough for one independent implementation and review cycle.

Recommended task structure:

```text
Role: Developer | Reviewer
Task: <ID and title>

Goal:
...

Read first:
- AGENTS.md
- relevant docs/... files

Acceptance criteria:
- ...

Tests:
- ...

Out of scope:
- ...
```

The task prompt must reference canonical documents instead of repeating project-wide rules.

## Development Workflow

Default workflow:

**Specification → Developer implementation → verification/tests → independent Reviewer → corrections → acceptance → documentation update**

The Developer and Reviewer should normally be different agents for the same task when practical.

A reviewer should not silently rewrite the implementation. Findings go back to the current Developer unless the user explicitly changes roles.

## Scope Constraints

Core MVP remains focused on:

1. outage scenario creation;
2. service and dependency modelling;
3. explicit availability duration for Device and External Provider nodes;
4. acyclic dependency validation;
5. deterministic availability simulation;
6. status classification;
7. limiting dependency and causal-path explanation;
8. rerunning a scenario after input changes.

Not part of the core MVP:

- automatic W/Wh battery calculation;
- external outage-schedule integration;
- store integrations;
- AI recommendations;
- user accounts;
- microservices, Kubernetes, CQRS, event-driven architecture, or distributed-system complexity.

## Technology Constraints

Core framework choices must remain within the technologies allowed by the study programme.

Current approved direction:

- React for the first implementation stage;
- Node.js may be added later if a concrete server-side requirement is approved.

No database, ORM, testing framework, cloud platform, broker, or other supporting technology is considered approved merely by being common or convenient. Such choices require a deliberate project decision before adoption.

## Testing Principle

Every implementation task must be verifiable against explicit acceptance criteria.

The project should maintain traceability:

`Requirement → Implementation → Test → Result`

Measured results must come from actual test execution. No benchmark or test result may be invented.

## Public Repository Rule

The repository is public so it can be shared with the supervisor and other reviewers.

Never commit:

- passwords;
- API keys or tokens;
- `.env` secrets;
- private correspondence;
- unnecessary personal identifiers;
- confidential data.

## Current Open Design Question

Tie handling for two or more dependencies with the same minimum availability duration is intentionally unresolved. It must be decided and documented in `docs/SIMULATION.md` / `docs/DECISIONS.md` before the corresponding algorithm is implemented.
