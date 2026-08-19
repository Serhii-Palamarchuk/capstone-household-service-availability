import assert from 'node:assert/strict';
import test from 'node:test';

import { buildRecommendations } from '../../src/user-mvp/recommendations.js';
import {
  runUserScenario,
  runUserScenarioCore,
} from '../../src/user-mvp/run-user-scenario.js';
import {
  additionalLoadInternetFixture,
  providerFixture,
} from './fixtures.js';

function withoutBackup(input) {
  const noBackup = structuredClone(input);
  noBackup.backupSources = [];
  noBackup.scenario.backupAssignments = [];
  return noBackup;
}

function multiTargetAdditionalLoadFixture(providerAvailabilityMinutes) {
  return {
    model: {
      services: [
        {
          id: 'service-a',
          name: 'Service A',
          dependencyIds: ['device-a', 'provider-a'],
        },
        {
          id: 'service-b',
          name: 'Service B',
          dependencyIds: ['device-b'],
        },
      ],
      devices: [
        { id: 'device-a', name: 'Device A', powerW: 10 },
        { id: 'device-b', name: 'Device B', powerW: 5 },
        { id: 'device-tv', name: 'TV', powerW: 5 },
      ],
      externalProviders: [{ id: 'provider-a', name: 'Provider A' }],
    },
    backupSources: [{
      id: 'source-home',
      name: 'Home source',
      type: 'Power station',
      usableCapacityWh: 100,
      maxOutputPowerW: 100,
    }],
    scenario: {
      outageDurationMinutes: 600,
      targetServiceIds: ['service-a', 'service-b'],
      backupAssignments: [
        { deviceId: 'device-a', backupSourceId: 'source-home' },
        { deviceId: 'device-b', backupSourceId: 'source-home' },
        { deviceId: 'device-tv', backupSourceId: 'source-home' },
      ],
      additionalActiveDeviceIds: ['device-tv'],
      externalProviderAvailability: { 'provider-a': providerAvailabilityMinutes },
    },
  };
}

test('AC-13: zero-minute required Devices recommend backup once in lexical order', () => {
  const input = withoutBackup(additionalLoadInternetFixture(false));
  const result = runUserScenarioCore(input);

  assert.equal(result.success, true);
  assert.deepEqual(buildRecommendations({
    model: input.model,
    scenario: input.scenario,
    estimation: result.estimation,
    simulation: result.simulation,
    counterfactuals: new Map(),
  }), [
    { type: 'ADD_BACKUP', entityId: 'device-ont' },
    { type: 'ADD_BACKUP', entityId: 'device-router' },
  ]);
});

test('AC-13: assigned backup with zero rounded runtime does not recommend another backup', () => {
  const input = additionalLoadInternetFixture(false);
  input.backupSources[0].usableCapacityWh = 0.1;

  const result = runUserScenario(input);

  assert.equal(result.success, true);
  assert.equal(
    result.recommendations.some((recommendation) => recommendation.type === 'ADD_BACKUP'),
    false,
  );
});

test('AC-13: provider recommendations are limited to ExternalProvider bottlenecks', () => {
  const input = providerFixture({ outageDurationMinutes: 480 });
  input.scenario.externalProviderAvailability['provider-isp'] = 120;
  const result = runUserScenarioCore(input);

  assert.equal(result.success, true);
  assert.deepEqual(buildRecommendations({
    model: input.model,
    scenario: input.scenario,
    estimation: result.estimation,
    simulation: result.simulation,
    counterfactuals: new Map(),
  }), [
    { type: 'EXTERNAL_PROVIDER_LIMIT', entityId: 'provider-isp' },
  ]);
});

test('AC-13: removing one additional load reports its actual target improvement', () => {
  const result = runUserScenario(additionalLoadInternetFixture(true));

  assert.equal(result.success, true);
  assert.deepEqual(result.recommendations, [
    {
      type: 'DISABLE_ADDITIONAL_LOAD',
      entityId: 'device-tv',
      improvementMinutes: 840,
    },
  ]);
});

test('AC-13: additional load is not recommended when its counterfactual does not improve the target', () => {
  const input = additionalLoadInternetFixture(true);
  input.scenario.externalProviderAvailability['provider-internet'] = 120;

  const result = runUserScenario(input);

  assert.equal(result.success, true);
  assert.equal(
    result.recommendations.some((recommendation) => (
      recommendation.type === 'DISABLE_ADDITIONAL_LOAD'
      && recommendation.entityId === 'device-tv'
    )),
    false,
  );
});

test('AC-13: additional load is not recommended unless every target improves', () => {
  const result = runUserScenario(multiTargetAdditionalLoadFixture(300));

  assert.equal(result.success, true);
  assert.equal(
    result.recommendations.some((recommendation) => (
      recommendation.type === 'DISABLE_ADDITIONAL_LOAD'
      && recommendation.entityId === 'device-tv'
    )),
    false,
  );
});

test('AC-13: additional load reports the smallest actual improvement across all targets', () => {
  const result = runUserScenario(multiTargetAdditionalLoadFixture(350));

  assert.equal(result.success, true);
  assert.deepEqual(result.recommendations, [{
    type: 'DISABLE_ADDITIONAL_LOAD',
    entityId: 'device-tv',
    improvementMinutes: 50,
  }]);
});

test('runUserScenario preserves core failures without recommendations', () => {
  const input = additionalLoadInternetFixture(true);
  input.scenario.outageDurationMinutes = 0;

  assert.deepEqual(runUserScenario(input), runUserScenarioCore(input));
});
