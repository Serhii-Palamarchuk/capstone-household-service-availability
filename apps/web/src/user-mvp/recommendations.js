function sortedUnique(ids) {
  return [...new Set(ids)].sort();
}

function getCounterfactual(counterfactuals, additionalLoadId) {
  return counterfactuals instanceof Map
    ? counterfactuals.get(additionalLoadId)
    : counterfactuals?.[additionalLoadId];
}

function targetImprovementMinutes(simulation, counterfactualSimulation) {
  const counterfactualTargetsById = new Map(
    counterfactualSimulation.targetResults.map((target) => [target.serviceId, target]),
  );
  let greatestImprovement = 0;

  for (const target of simulation.targetResults) {
    const counterfactualTarget = counterfactualTargetsById.get(target.serviceId);
    if (!counterfactualTarget) continue;

    greatestImprovement = Math.max(
      greatestImprovement,
      counterfactualTarget.availabilityDurationMinutes - target.availabilityDurationMinutes,
    );
  }

  return greatestImprovement;
}

export function buildRecommendations({
  model,
  scenario,
  estimation,
  simulation,
  counterfactuals,
}) {
  const deviceIds = new Set(model.devices.map((device) => device.id));
  const externalProviderIds = new Set(
    model.externalProviders.map((provider) => provider.id),
  );
  const recommendations = [];

  for (const deviceId of sortedUnique(estimation.requiredDeviceIds)) {
    if (deviceIds.has(deviceId) && estimation.availability[deviceId] === 0) {
      recommendations.push({ type: 'ADD_BACKUP', entityId: deviceId });
    }
  }

  const limitingProviderIds = simulation.targetResults.flatMap(
    (target) => target.limitingDependencyIds,
  ).filter((dependencyId) => externalProviderIds.has(dependencyId));

  for (const providerId of sortedUnique(limitingProviderIds)) {
    recommendations.push({ type: 'EXTERNAL_PROVIDER_LIMIT', entityId: providerId });
  }

  for (const additionalLoadId of sortedUnique(scenario.additionalActiveDeviceIds ?? [])) {
    const counterfactual = getCounterfactual(counterfactuals, additionalLoadId);
    if (!counterfactual?.success) continue;

    const improvementMinutes = targetImprovementMinutes(
      simulation,
      counterfactual.simulation,
    );
    if (improvementMinutes > 0) {
      recommendations.push({
        type: 'DISABLE_ADDITIONAL_LOAD',
        entityId: additionalLoadId,
        improvementMinutes,
      });
    }
  }

  return recommendations;
}
