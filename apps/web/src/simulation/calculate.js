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

  const limitingDependencyIds = [];
  const causalPaths = [];

  if (status !== ServiceStatus.AVAILABLE) {
    for (const dependencyId of service.dependencyIds) {
      const dependencyDurationMinutes = modelIndex.servicesById.has(dependencyId)
        ? memo.get(dependencyId).availabilityDurationMinutes
        : scenario.availability[dependencyId];

      if (dependencyDurationMinutes !== availabilityDurationMinutes) {
        continue;
      }

      if (modelIndex.servicesById.has(dependencyId)) {
        const child = memo.get(dependencyId);
        limitingDependencyIds.push(...child.limitingDependencyIds);
        for (const childPath of child.causalPaths) {
          causalPaths.push([serviceId, ...childPath]);
        }
      } else {
        limitingDependencyIds.push(dependencyId);
        causalPaths.push([serviceId, dependencyId]);
      }
    }
  }

  const uniqueLimitingDependencyIds = [...new Set(limitingDependencyIds)].sort();
  const pathMap = new Map();
  for (const path of causalPaths) {
    pathMap.set(path.join('\u0000'), path);
  }
  const uniqueCausalPaths = [...pathMap.values()]
    .sort((a, b) => a.join('\u0000').localeCompare(b.join('\u0000')));

  const result = {
    serviceId,
    availabilityDurationMinutes,
    status,
    limitingDependencyIds: uniqueLimitingDependencyIds,
    causalPaths: uniqueCausalPaths,
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
