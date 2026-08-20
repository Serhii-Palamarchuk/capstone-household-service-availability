import assert from 'node:assert/strict';
import test from 'node:test';

import { runUserScenarioCore } from '../../src/user-mvp/run-user-scenario.js';
import {
  additionalLoadInternetFixture,
  endToEndRemoteWorkFixture,
  providerFixture,
  sharedInternetRemoteWorkFixture,
} from './fixtures.js';

test('AC-07: additional TV load reduces Internet runtime without becoming a dependency', () => {
  const input = additionalLoadInternetFixture(false);

  const baseline = runUserScenarioCore(input);
  const loaded = runUserScenarioCore({
    ...input,
    scenario: {
      ...input.scenario,
      additionalActiveDeviceIds: ['device-tv'],
    },
  });

  assert.equal(baseline.success, true);
  assert.equal(baseline.simulation.targetResults[0].availabilityDurationMinutes, 1200);
  assert.equal(baseline.simulation.targetResults[0].status, 'Available');
  assert.equal(loaded.success, true);
  assert.equal(loaded.simulation.targetResults[0].availabilityDurationMinutes, 360);
  assert.equal(loaded.simulation.targetResults[0].status, 'Limited');
  assert.deepEqual(input.model.services[0].dependencyIds, [
    'device-router',
    'device-ont',
    'provider-internet',
  ]);
  assert.equal(input.model.services[0].dependencyIds.includes('device-tv'), false);
});

test('AC-10: two Remote Work targets reuse one shared Internet service result', () => {
  const input = sharedInternetRemoteWorkFixture();

  const result = runUserScenarioCore(input);

  assert.equal(result.success, true);
  assert.equal(result.simulation.serviceResults.size, 3);
  assert.deepEqual(
    result.simulation.targetResults.map((target) => target.availabilityDurationMinutes),
    [1200, 1200],
  );
  assert.deepEqual(result.simulation.targetResults[0].causalPaths, [
    ['service-remote-work-a', 'service-internet-home', 'device-ont'],
    ['service-remote-work-a', 'service-internet-home', 'device-router'],
  ]);
  assert.deepEqual(result.simulation.targetResults[1].causalPaths, [
    ['service-remote-work-b', 'service-internet-home', 'device-ont'],
    ['service-remote-work-b', 'service-internet-home', 'device-router'],
  ]);
});

test('AC-11: manual provider availability reaches the engine and missing input stops the run', () => {
  const validInput = providerFixture({ outageDurationMinutes: 480 });
  const missingInput = providerFixture({
    outageDurationMinutes: 480,
    externalProviderAvailability: {},
  });

  const valid = runUserScenarioCore(validInput);
  const missing = runUserScenarioCore(missingInput);

  assert.equal(valid.success, true);
  assert.equal(valid.estimation.availability['provider-isp'], 600);
  assert.equal(valid.simulation.targetResults[0].availabilityDurationMinutes, 600);
  assert.deepEqual(missing, {
    success: false,
    errors: [{ code: 'MISSING_EXTERNAL_PROVIDER_AVAILABILITY', providerId: 'provider-isp' }],
  });
});

test('AC-12: estimates the accepted Remote Work fixture and simulates its bottlenecks', () => {
  const result = runUserScenarioCore(endToEndRemoteWorkFixture());

  assert.equal(result.success, true);
  assert.equal(result.estimation.sourceResults[0].totalPowerW, 80);
  assert.equal(result.estimation.sourceResults[0].runtimeMinutes, 360);
  assert.equal(result.estimation.availability['device-router'], 360);
  assert.equal(result.estimation.availability['device-ont'], 360);
  assert.equal(result.estimation.availability['device-laptop'], 480);
  assert.equal(
    result.simulation.serviceResults.get('service-internet-home').availabilityDurationMinutes,
    360,
  );

  const remoteWork = result.simulation.targetResults[0];
  assert.equal(remoteWork.availabilityDurationMinutes, 360);
  assert.equal(remoteWork.status, 'Limited');
  assert.deepEqual(remoteWork.limitingDependencyIds.sort(), [
    'device-ont',
    'device-router',
  ]);
  assert.deepEqual(remoteWork.causalPaths, [
    ['service-remote-work', 'service-internet-home', 'device-ont'],
    ['service-remote-work', 'service-internet-home', 'device-router'],
  ]);
});

test('engine validation failure is returned without a synthetic partial success', () => {
  const input = endToEndRemoteWorkFixture();
  input.scenario.outageDurationMinutes = 0;

  const result = runUserScenarioCore(input);

  assert.equal(result.success, false);
  assert.deepEqual(result.errors.map((error) => error.code), ['INVALID_OUTAGE_DURATION']);
  assert.equal(Object.hasOwn(result, 'estimation'), false);
  assert.equal(Object.hasOwn(result, 'simulation'), false);
});
