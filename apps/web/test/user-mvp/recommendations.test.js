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

test('runUserScenario preserves core failures without recommendations', () => {
  const input = additionalLoadInternetFixture(true);
  input.scenario.outageDurationMinutes = 0;

  assert.deepEqual(runUserScenario(input), runUserScenarioCore(input));
});
