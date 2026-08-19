import { simulate } from '../simulation/simulate.js';
import { estimateAvailability } from './availability-estimator.js';
import { buildRecommendations } from './recommendations.js';

export function runUserScenarioCore({ model, backupSources, scenario }) {
  const estimation = estimateAvailability({ model, backupSources, scenario });

  if (!estimation.success) {
    return estimation;
  }

  const simulation = simulate(model, {
    outageDurationMinutes: scenario.outageDurationMinutes,
    targetServiceIds: scenario.targetServiceIds,
    availability: estimation.availability,
  });

  if (!simulation.success) {
    return simulation;
  }

  return {
    success: true,
    estimation,
    simulation,
  };
}

export function runUserScenario({ model, backupSources, scenario }) {
  const result = runUserScenarioCore({ model, backupSources, scenario });

  if (!result.success) {
    return result;
  }

  const counterfactuals = new Map();
  const additionalLoadIds = [...new Set(scenario.additionalActiveDeviceIds ?? [])].sort();

  for (const additionalLoadId of additionalLoadIds) {
    const counterfactualScenario = {
      ...scenario,
      additionalActiveDeviceIds: (scenario.additionalActiveDeviceIds ?? []).filter(
        (deviceId) => deviceId !== additionalLoadId,
      ),
    };
    counterfactuals.set(additionalLoadId, runUserScenarioCore({
      model,
      backupSources,
      scenario: counterfactualScenario,
    }));
  }

  return {
    ...result,
    recommendations: buildRecommendations({
      model,
      scenario,
      estimation: result.estimation,
      simulation: result.simulation,
      counterfactuals,
    }),
  };
}
