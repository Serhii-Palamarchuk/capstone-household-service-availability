export function createModelIndex(model) {
  const servicesById = new Map(model.services.map(node => [node.id, node]));
  const devicesById = new Map(model.devices.map(node => [node.id, node]));
  const externalProvidersById = new Map(
    model.externalProviders.map(node => [node.id, node]),
  );
  const nodesById = new Map([
    ...servicesById,
    ...devicesById,
    ...externalProvidersById,
  ]);

  return {
    nodesById,
    servicesById,
    devicesById,
    externalProvidersById,
  };
}
