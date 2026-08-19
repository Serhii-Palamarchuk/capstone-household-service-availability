function isPositiveFiniteNumber(value) {
  return Number.isFinite(value) && value > 0;
}

function isNonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0;
}

function collectRequiredDependencies(model, targetServiceIds) {
  const servicesById = new Map(model.services.map((service) => [service.id, service]));
  const devicesById = new Map(model.devices.map((device) => [device.id, device]));
  const providersById = new Map(
    model.externalProviders.map((provider) => [provider.id, provider]),
  );
  const requiredDeviceIds = new Set();
  const requiredProviderIds = new Set();
  const visitedServices = new Set();

  function visitService(serviceId) {
    if (visitedServices.has(serviceId)) return;
    visitedServices.add(serviceId);

    const service = servicesById.get(serviceId);
    if (!service) return;

    for (const dependencyId of service.dependencyIds) {
      if (devicesById.has(dependencyId)) {
        requiredDeviceIds.add(dependencyId);
      } else if (providersById.has(dependencyId)) {
        requiredProviderIds.add(dependencyId);
      } else if (servicesById.has(dependencyId)) {
        visitService(dependencyId);
      }
    }
  }

  for (const targetServiceId of targetServiceIds) {
    visitService(targetServiceId);
  }

  return { requiredDeviceIds, requiredProviderIds };
}

function validateModelAndSources(model, backupSources) {
  const errors = [];

  for (const device of model.devices) {
    if (!isPositiveFiniteNumber(device.powerW)) {
      errors.push({ code: 'INVALID_DEVICE_POWER', deviceId: device.id });
    }

    if (device.internalBattery
      && !isPositiveFiniteNumber(device.internalBattery.usableCapacityWh)) {
      errors.push({ code: 'INVALID_INTERNAL_BATTERY_CAPACITY', deviceId: device.id });
    }
  }

  for (const source of backupSources) {
    if (!isPositiveFiniteNumber(source.usableCapacityWh)) {
      errors.push({ code: 'INVALID_BACKUP_SOURCE_CAPACITY', sourceId: source.id });
    }

    if (source.maxOutputPowerW !== undefined
      && !isPositiveFiniteNumber(source.maxOutputPowerW)) {
      errors.push({ code: 'INVALID_BACKUP_SOURCE_MAX_OUTPUT', sourceId: source.id });
    }
  }

  return errors;
}

function normalizeAssignments(assignments, devicesById, sourcesById) {
  const errors = [];
  const assignmentsByDeviceId = new Map();

  for (const assignment of assignments) {
    if (assignmentsByDeviceId.has(assignment.deviceId)) {
      errors.push({ code: 'DUPLICATE_BACKUP_ASSIGNMENT', deviceId: assignment.deviceId });
      continue;
    }

    assignmentsByDeviceId.set(assignment.deviceId, assignment.backupSourceId);
  }

  if (errors.length > 0) return { errors, assignmentsByDeviceId };

  for (const [deviceId, sourceId] of assignmentsByDeviceId) {
    if (!devicesById.has(deviceId)) {
      errors.push({ code: 'BACKUP_ASSIGNMENT_DEVICE_NOT_FOUND', deviceId });
    }
    if (!sourcesById.has(sourceId)) {
      errors.push({ code: 'BACKUP_ASSIGNMENT_SOURCE_NOT_FOUND', sourceId });
    }
  }

  return { errors, assignmentsByDeviceId };
}

function collectProviderAvailability(requiredProviderIds, externalProviderAvailability) {
  const errors = [];
  const availability = {};

  for (const providerId of requiredProviderIds) {
    if (!Object.hasOwn(externalProviderAvailability, providerId)) {
      errors.push({ code: 'MISSING_EXTERNAL_PROVIDER_AVAILABILITY', providerId });
      continue;
    }

    const value = externalProviderAvailability[providerId];
    if (!isNonNegativeInteger(value)) {
      errors.push({ code: 'INVALID_EXTERNAL_PROVIDER_AVAILABILITY', providerId });
      continue;
    }

    availability[providerId] = value;
  }

  return { errors, availability };
}

export function estimateAvailability({ model, backupSources, scenario }) {
  const devicesById = new Map(model.devices.map((device) => [device.id, device]));
  const sourcesById = new Map(backupSources.map((source) => [source.id, source]));
  const assignments = normalizeAssignments(
    scenario.backupAssignments ?? [],
    devicesById,
    sourcesById,
  );
  const validationErrors = [
    ...assignments.errors,
    ...validateModelAndSources(model, backupSources),
  ];

  if (validationErrors.length > 0) {
    return { success: false, errors: validationErrors };
  }

  const { requiredDeviceIds, requiredProviderIds } = collectRequiredDependencies(
    model,
    scenario.targetServiceIds,
  );
  const providerAvailability = collectProviderAvailability(
    requiredProviderIds,
    scenario.externalProviderAvailability ?? {},
  );

  const activeDeviceIds = new Set([
    ...requiredDeviceIds,
    ...(scenario.additionalActiveDeviceIds ?? []),
  ]);
  const activeDevices = model.devices.filter((device) => activeDeviceIds.has(device.id));
  const sourceResults = [];
  const warnings = [];
  const sourceRuntimeById = new Map();
  const sourceErrors = [];

  for (const source of backupSources) {
    const assignedDevices = activeDevices.filter(
      (device) => assignments.assignmentsByDeviceId.get(device.id) === source.id,
    );
    if (assignedDevices.length === 0) continue;

    const totalPowerW = assignedDevices.reduce((total, device) => total + device.powerW, 0);
    if (source.maxOutputPowerW !== undefined && totalPowerW > source.maxOutputPowerW) {
      sourceErrors.push({
        code: 'BACKUP_SOURCE_MAX_OUTPUT_EXCEEDED',
        sourceId: source.id,
        totalPowerW,
        maxOutputPowerW: source.maxOutputPowerW,
      });
      continue;
    }

    const runtimeMinutes = Math.floor((source.usableCapacityWh / totalPowerW) * 60);
    sourceRuntimeById.set(source.id, runtimeMinutes);
    sourceResults.push({ sourceId: source.id, totalPowerW, runtimeMinutes });

    if (source.maxOutputPowerW === undefined) {
      warnings.push({ code: 'MISSING_BACKUP_SOURCE_MAX_OUTPUT', sourceId: source.id });
    }
  }

  const estimationErrors = [...providerAvailability.errors, ...sourceErrors];
  if (estimationErrors.length > 0) {
    return { success: false, errors: estimationErrors };
  }

  const availability = { ...providerAvailability.availability };
  const deviceResults = activeDevices.map((device) => {
    const sourceId = assignments.assignmentsByDeviceId.get(device.id);
    const externalRuntimeMinutes = sourceRuntimeById.get(sourceId) ?? 0;
    const internalRuntimeMinutes = device.internalBattery
      ? Math.floor((device.internalBattery.usableCapacityWh / device.powerW) * 60)
      : 0;
    const availabilityMinutes = externalRuntimeMinutes + internalRuntimeMinutes;

    availability[device.id] = availabilityMinutes;
    return {
      deviceId: device.id,
      externalRuntimeMinutes,
      internalRuntimeMinutes,
      availabilityMinutes,
    };
  });

  return {
    success: true,
    availability,
    requiredDeviceIds: [...requiredDeviceIds],
    sourceResults,
    deviceResults,
    warnings,
  };
}
