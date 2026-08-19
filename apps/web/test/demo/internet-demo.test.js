import test from 'node:test';
import assert from 'node:assert/strict';
import { simulate } from '../../src/simulation/simulate.js';
import {
  DEFAULT_INTERNET_DEMO_INPUTS,
  INTERNET_DEMO_MODEL,
  createInternetScenarioFromHours,
} from '../../src/demo/internet-demo.js';

test('default Internet demo converts hours to canonical minutes', () => {
  const conversion = createInternetScenarioFromHours(DEFAULT_INTERNET_DEMO_INPUTS);

  assert.deepEqual(conversion, {
    success: true,
    scenario: {
      id: 'scenario-internet-demo',
      name: 'Internet outage demo',
      outageDurationMinutes: 360,
      targetServiceIds: ['service-internet'],
      availability: {
        'device-router': 480,
        'device-ont': 120,
        'provider-isp': 4320,
      },
    },
  });
});

test('default Internet demo produces Limited 2 h with ONT/ONU as cause', () => {
  const conversion = createInternetScenarioFromHours(DEFAULT_INTERNET_DEMO_INPUTS);
  assert.equal(conversion.success, true);

  const result = simulate(INTERNET_DEMO_MODEL, conversion.scenario);

  assert.equal(result.success, true);
  assert.equal(result.targetResults[0].availabilityDurationMinutes, 120);
  assert.equal(result.targetResults[0].status, 'Limited');
  assert.deepEqual(result.targetResults[0].limitingDependencyIds, ['device-ont']);
  assert.deepEqual(result.targetResults[0].causalPaths, [
    ['service-internet', 'device-ont'],
  ]);
});

test('changing ONT/ONU to 8 h produces Available 8 h with empty causes', () => {
  const conversion = createInternetScenarioFromHours({
    ...DEFAULT_INTERNET_DEMO_INPUTS,
    ontHours: '8',
  });
  assert.equal(conversion.success, true);

  const result = simulate(INTERNET_DEMO_MODEL, conversion.scenario);

  assert.equal(result.success, true);
  assert.equal(result.targetResults[0].availabilityDurationMinutes, 480);
  assert.equal(result.targetResults[0].status, 'Available');
  assert.deepEqual(result.targetResults[0].limitingDependencyIds, []);
  assert.deepEqual(result.targetResults[0].causalPaths, []);
});

test('zero leaf availability is valid and can produce Unavailable', () => {
  const conversion = createInternetScenarioFromHours({
    ...DEFAULT_INTERNET_DEMO_INPUTS,
    ontHours: '0',
  });
  assert.equal(conversion.success, true);

  const result = simulate(INTERNET_DEMO_MODEL, conversion.scenario);

  assert.equal(result.success, true);
  assert.equal(result.targetResults[0].availabilityDurationMinutes, 0);
  assert.equal(result.targetResults[0].status, 'Unavailable');
});

test('zero outage is rejected before simulate()', () => {
  const conversion = createInternetScenarioFromHours({
    ...DEFAULT_INTERNET_DEMO_INPUTS,
    outageHours: '0',
  });

  assert.deepEqual(conversion, {
    success: false,
    errors: [
      {
        field: 'outageHours',
        message: 'Outage duration must be greater than 0 hours.',
      },
    ],
  });
});

test('fractional hours that do not map to whole minutes are rejected', () => {
  const conversion = createInternetScenarioFromHours({
    ...DEFAULT_INTERNET_DEMO_INPUTS,
    outageHours: '0.001',
  });

  assert.equal(conversion.success, false);
  assert.deepEqual(conversion.errors.map(error => error.field), ['outageHours']);
});
