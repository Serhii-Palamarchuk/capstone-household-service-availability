import test from 'node:test';
import assert from 'node:assert/strict';
import { ServiceStatus, ValidationCode } from '../../src/simulation/constants.js';

test('TS-01: simulation constants expose the canonical status and validation contract', () => {
  assert.deepEqual(ServiceStatus, {
    AVAILABLE: 'Available',
    LIMITED: 'Limited',
    UNAVAILABLE: 'Unavailable',
  });

  assert.deepEqual(Object.values(ValidationCode).sort(), [
    'CYCLE_DETECTED',
    'DEPENDENCY_NOT_FOUND',
    'DUPLICATE_TARGET_SERVICE',
    'EMPTY_TARGET_SERVICES',
    'INVALID_AVAILABILITY_NODE',
    'INVALID_AVAILABILITY_VALUE',
    'INVALID_OUTAGE_DURATION',
    'MISSING_AVAILABILITY',
    'SERVICE_WITHOUT_DEPENDENCIES',
    'TARGET_SERVICE_NOT_FOUND',
  ].sort());
});
