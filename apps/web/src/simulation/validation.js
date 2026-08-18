import { ValidationCode } from './constants.js';

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

function isNonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0;
}

export function validateScenarioStructure(modelIndex, scenario) {
  const errors = [];

  if (!isPositiveInteger(scenario.outageDurationMinutes)) {
    errors.push({
      code: ValidationCode.INVALID_OUTAGE_DURATION,
      field: 'outageDurationMinutes',
      message: 'outageDurationMinutes must be a positive integer.',
    });
  }

  if (scenario.targetServiceIds.length === 0) {
    errors.push({
      code: ValidationCode.EMPTY_TARGET_SERVICES,
      field: 'targetServiceIds',
      message: 'targetServiceIds must contain at least one Service id.',
    });
  }

  const seenTargetIds = new Set();
  for (const targetId of scenario.targetServiceIds) {
    if (seenTargetIds.has(targetId)) {
      errors.push({
        code: ValidationCode.DUPLICATE_TARGET_SERVICE,
        nodeId: targetId,
        field: 'targetServiceIds',
        message: `targetServiceIds contains a duplicate id: ${targetId}.`,
      });
    }
    seenTargetIds.add(targetId);

    if (!modelIndex.servicesById.has(targetId)) {
      errors.push({
        code: ValidationCode.TARGET_SERVICE_NOT_FOUND,
        nodeId: targetId,
        field: 'targetServiceIds',
        message: `targetServiceIds references a missing Service: ${targetId}.`,
      });
    }
  }

  for (const [nodeId, value] of Object.entries(scenario.availability)) {
    const isDeviceOrProvider =
      modelIndex.devicesById.has(nodeId) ||
      modelIndex.externalProvidersById.has(nodeId);

    if (!isDeviceOrProvider) {
      errors.push({
        code: ValidationCode.INVALID_AVAILABILITY_NODE,
        nodeId,
        field: 'availability',
        message: `availability references a node that is not a Device or ExternalProvider: ${nodeId}.`,
      });
    }

    if (!isNonNegativeInteger(value)) {
      errors.push({
        code: ValidationCode.INVALID_AVAILABILITY_VALUE,
        nodeId,
        field: 'availability',
        message: `availability value for ${nodeId} must be a non-negative integer.`,
      });
    }
  }

  return errors;
}
