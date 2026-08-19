import test from 'node:test';
import assert from 'node:assert/strict';
import { createModelIndex } from '../../src/simulation/model-index.js';
import { calculateServiceResults } from '../../src/simulation/calculate.js';
import { simulate } from '../../src/simulation/simulate.js';
import { createInternetModel, createInternetScenario } from './fixtures.js';

function createRemoteWorkModel() {
  return {
    services: [
      {
        id: 'service-remote-work',
        name: 'Remote Work',
        dependencyIds: ['service-internet', 'device-laptop'],
      },
      {
        id: 'service-internet',
        name: 'Internet',
        dependencyIds: ['device-router', 'device-ont', 'provider-isp'],
      },
    ],
    devices: [
      { id: 'device-router', name: 'Router' },
      { id: 'device-ont', name: 'ONT/ONU' },
      { id: 'device-laptop', name: 'Laptop' },
    ],
    externalProviders: [
      { id: 'provider-isp', name: 'Internet Provider' },
    ],
  };
}

test('TS-01: T is not clipped to H', () => {
  const model = createInternetModel();
  const scenario = createInternetScenario();
  scenario.availability['device-ont'] = 600;

  const results = calculateServiceResults(createModelIndex(model), scenario);
  const result = results.get('service-internet');

  assert.equal(result.availabilityDurationMinutes, 480);
  assert.equal(result.status, 'Available');
});

test('TS-02: Available when T equals H', () => {
  const model = createInternetModel();
  const scenario = createInternetScenario();
  scenario.outageDurationMinutes = 360;
  scenario.availability['device-router'] = 360;
  scenario.availability['device-ont'] = 600;

  const results = calculateServiceResults(createModelIndex(model), scenario);
  const result = results.get('service-internet');

  assert.equal(result.availabilityDurationMinutes, 360);
  assert.equal(result.status, 'Available');
});

test('TS-03: Limited when 0 < T < H', () => {
  const model = createInternetModel();
  const scenario = createInternetScenario();
  scenario.outageDurationMinutes = 360;
  scenario.availability['device-router'] = 480;
  scenario.availability['device-ont'] = 120;

  const results = calculateServiceResults(createModelIndex(model), scenario);
  const result = results.get('service-internet');

  assert.equal(result.availabilityDurationMinutes, 120);
  assert.equal(result.status, 'Limited');
});

test('TS-03: simulate returns full success outcome', () => {
  const scenario = createInternetScenario();
  const outcome = simulate(createInternetModel(), scenario);

  assert.equal(outcome.success, true);
  assert.equal(outcome.targetResults.length, 1);
  assert.equal(outcome.targetResults[0].serviceId, 'service-internet');
  assert.equal(outcome.targetResults[0].availabilityDurationMinutes, 120);
  assert.equal(outcome.targetResults[0].status, 'Limited');
  assert.deepEqual(outcome.targetResults[0].limitingDependencyIds, ['device-ont']);
  assert.deepEqual(outcome.targetResults[0].causalPaths, [
    ['service-internet', 'device-ont'],
  ]);
  assert.equal(outcome.serviceResults instanceof Map, true);
  assert.equal('errors' in outcome, false);
});

test('TS-04: Unavailable when T = 0', () => {
  const model = createInternetModel();
  const scenario = createInternetScenario();
  scenario.outageDurationMinutes = 360;
  scenario.availability['device-router'] = 480;
  scenario.availability['device-ont'] = 0;

  const results = calculateServiceResults(createModelIndex(model), scenario);
  const result = results.get('service-internet');

  assert.equal(result.availabilityDurationMinutes, 0);
  assert.equal(result.status, 'Unavailable');
});

test('TS-05: recursive calculation of a nested Service', () => {
  const model = createRemoteWorkModel();
  const scenario = {
    id: 's1',
    name: 'scenario',
    outageDurationMinutes: 480,
    targetServiceIds: ['service-remote-work'],
    availability: {
      'device-router': 480,
      'device-ont': 120,
      'provider-isp': 600,
      'device-laptop': 360,
    },
  };

  const results = calculateServiceResults(createModelIndex(model), scenario);

  assert.equal(results.get('service-internet').availabilityDurationMinutes, 120);
  assert.equal(results.get('service-remote-work').availabilityDurationMinutes, 120);
  assert.ok(results.has('service-internet'));
  assert.ok(results.has('service-remote-work'));
});

test('TS-06: direct dependency limits parent before nested Service bottleneck', () => {
  const model = createRemoteWorkModel();
  const scenario = {
    id: 's1',
    name: 'scenario',
    outageDurationMinutes: 480,
    targetServiceIds: ['service-remote-work'],
    availability: {
      'device-router': 420,
      'device-ont': 300,
      'provider-isp': 4320,
      'device-laptop': 120,
    },
  };

  const results = calculateServiceResults(createModelIndex(model), scenario);
  const internet = results.get('service-internet');
  const remoteWork = results.get('service-remote-work');

  assert.equal(internet.availabilityDurationMinutes, 300);
  assert.equal(remoteWork.availabilityDurationMinutes, 120);
  assert.equal(remoteWork.status, 'Limited');
});
