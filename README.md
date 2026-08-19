# capstone-household-service-availability
Neoversity MSc Software Engineering capstone project for evaluating household service availability during power outages using functional dependency modeling.

## Live demo

[Open the deployed React demo](https://serhii-palamarchuk.github.io/capstone-household-service-availability/)

## Current demo and product direction

The deployed `React Demo v1` is a controlled end-to-end vertical slice used to verify the service-dependency simulation flow. It intentionally accepts dependency availability durations directly, so the current UI exposes a simplified technical input model rather than the intended final household-user experience.

The target user-facing direction is:

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

A household user should be able to describe important services, compose their dependencies, describe local equipment and backup power, and run outage scenarios without manually translating the whole household model into internal engine inputs. The exact autonomy-estimation formula, required power/capacity parameters, validation rules, and UI flow are not implemented yet and must be specified and tested in a separate iteration before they become part of the final MVP contract.

The Week 2 demo and report remain valid historical milestones; this clarification describes the next product iteration rather than retroactively redefining that work.
