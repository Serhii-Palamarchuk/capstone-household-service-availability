import { simulate } from '../simulation/simulate.js';
import { estimateAvailability } from './availability-estimator.js';

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
