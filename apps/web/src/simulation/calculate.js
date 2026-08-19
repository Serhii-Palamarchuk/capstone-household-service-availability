import { ServiceStatus } from './constants.js';

function calculateService(serviceId, modelIndex, scenario, memo) {
  if (memo.has(serviceId)) {
    return memo.get(serviceId);
  }

  const service = modelIndex.servicesById.get(serviceId);
  const durations = service.dependencyIds.map(dependencyId => {
    if (modelIndex.servicesById.has(dependencyId)) {
      return calculateService(dependencyId, modelIndex, scenario, memo)
        .availabilityDurationMinutes;
    }
    return scenario.availability[dependencyId];
  });

  const availabilityDurationMinutes = Math.min(...durations);
  const status = availabilityDurationMinutes >= scenario.outageDurationMinutes
    ? ServiceStatus.AVAILABLE
    : availabilityDurationMinutes === 0
      ? ServiceStatus.UNAVAILABLE
      : ServiceStatus.LIMITED;

  const result = {
    serviceId,
    availabilityDurationMinutes,
    status,
    limitingDependencyIds: [],
    causalPaths: [],
  };

  memo.set(serviceId, result);
  return result;
}

export function calculateServiceResults(modelIndex, scenario) {
  const memo = new Map();

  for (const targetId of scenario.targetServiceIds) {
    calculateService(targetId, modelIndex, scenario, memo);
  }

  return memo;
}
