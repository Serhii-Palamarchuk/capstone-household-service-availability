# GitHub Copilot project instructions

Follow the shared repository rules in `AGENTS.md`.

Before substantial work, read:

1. `AGENTS.md`;
2. `docs/STATUS.md`;
3. the active task or plan in `docs/plans/` or `docs/specs/`;
4. the relevant canonical documents from `docs/` referenced by that task.

Do not duplicate or override project-wide rules in this file.

If implementation requires a new decision about requirements, domain model, simulation behavior, architecture, scope, or an unapproved technology:

- do not decide silently;
- add an `OPEN` `Q-XXX` entry to `docs/STATUS.md`;
- pause the affected part of the implementation;
- report the question to the user.

After a task is implemented and actually verified, update `docs/STATUS.md` with the current task state, factual verification result, relevant implementation commit, and next action.

If a significant decision was accepted, also update `docs/DECISIONS.md` and the affected canonical document before treating the implementation as accepted.

Do not use chat history as the source of truth when repository documentation says otherwise.