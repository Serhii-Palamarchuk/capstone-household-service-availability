import test from 'node:test';
import assert from 'node:assert/strict';
import { createResultView } from '../../src/demo/result-view.js';

test('Limited outcome is mapped to 2 h, ONT/ONU and its causal path', () => {
  const view = createResultView({
    success: true,
    targetResults: [{
      serviceId: 'service-internet',
      availabilityDurationMinutes: 120,
      status: 'Limited',
      limitingDependencyIds: ['device-ont'],
      causalPaths: [['service-internet', 'device-ont']],
    }],
  });

  assert.deepEqual(view, {
    kind: 'success',
    serviceName: 'Internet',
    availabilityText: '2 h',
    status: 'Limited',
    limitingDependencyNames: ['ONT/ONU'],
    causalPathTexts: ['Internet → ONT/ONU'],
  });
});

test('Available outcome keeps cause lists empty', () => {
  const view = createResultView({
    success: true,
    targetResults: [{
      serviceId: 'service-internet',
      availabilityDurationMinutes: 480,
      status: 'Available',
      limitingDependencyIds: [],
      causalPaths: [],
    }],
  });

  assert.deepEqual(view.limitingDependencyNames, []);
  assert.deepEqual(view.causalPathTexts, []);
  assert.equal(view.status, 'Available');
});

test('engine failure preserves validation code and message', () => {
  const view = createResultView({
    success: false,
    errors: [{
      code: 'MISSING_AVAILABILITY',
      message: 'Availability is required for device-ont.',
      nodeId: 'device-ont',
      field: 'availability',
    }],
  });

  assert.deepEqual(view, {
    kind: 'failure',
    errors: [{
      code: 'MISSING_AVAILABILITY',
      message: 'Availability is required for device-ont.',
    }],
  });
});

test('duration formatter displays exact whole and fractional hours from integer minutes', () => {
  const createSuccessOutcome = availabilityDurationMinutes => ({
    success: true,
    targetResults: [{
      serviceId: 'service-internet',
      availabilityDurationMinutes,
      status: 'Limited',
      limitingDependencyIds: [],
      causalPaths: [],
    }],
  });

  assert.equal(createResultView(createSuccessOutcome(120)).availabilityText, '2 h');
  assert.equal(createResultView(createSuccessOutcome(90)).availabilityText, '1.5 h');
  assert.equal(createResultView(createSuccessOutcome(0)).availabilityText, '0 h');
});
