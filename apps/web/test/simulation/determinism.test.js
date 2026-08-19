import test from 'node:test';
import assert from 'node:assert/strict';
import { simulate } from '../../src/simulation/simulate.js';
import { createInternetModel, createInternetScenario } from './fixtures.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createSharedServicesModel() {
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
        dependencyIds: ['device-router', 'device-ont'],
      },
      {
        id: 'service-smart-tv',
        name: 'Smart TV',
        dependencyIds: ['service-internet', 'device-tv'],
      },
    ],
    devices: [
      { id: 'device-router', name: 'Router' },
      { id: 'device-ont', name: 'ONT/ONU' },
      { id: 'device-laptop', name: 'Laptop' },
      { id: 'device-tv', name: 'TV' },
    ],
    externalProviders: [],
  };
}

function createSharedServicesScenario() {
  return {
    id: 'scenario-shared-services',
    name: 'Shared Internet',
    outageDurationMinutes: 480,
    targetServiceIds: ['service-remote-work', 'service-smart-tv'],
    availability: {
      'device-router': 480,
      'device-ont': 240,
      'device-laptop': 360,
      'device-tv': 600,
    },
  };
}

test('TS-10: calculates one shared nested Service and roots each target causal path', () => {
  const outcome = simulate(createSharedServicesModel(), createSharedServicesScenario());

  assert.equal(outcome.success, true);
  assert.equal(outcome.serviceResults.has('service-internet'), true);
  assert.equal(
    [...outcome.serviceResults.keys()].filter(id => id === 'service-internet').length,
    1,
  );
  assert.equal(outcome.targetResults[0].serviceId, 'service-remote-work');
  assert.equal(outcome.targetResults[1].serviceId, 'service-smart-tv');
  assert.equal(outcome.targetResults[0].status, 'Limited');
  assert.equal(outcome.targetResults[1].status, 'Limited');
  assert.deepEqual(outcome.targetResults[0].limitingDependencyIds, ['device-ont']);
  assert.deepEqual(outcome.targetResults[1].limitingDependencyIds, ['device-ont']);
  assert.deepEqual(outcome.targetResults[0].causalPaths, [
    ['service-remote-work', 'service-internet', 'device-ont'],
  ]);
  assert.deepEqual(outcome.targetResults[1].causalPaths, [
    ['service-smart-tv', 'service-internet', 'device-ont'],
  ]);
});

test('TS-13: accepts unreachable availability for an existing leaf node', () => {
  const model = createInternetModel();
  model.devices.push({ id: 'device-refrigerator', name: 'Refrigerator' });
  const baseline = simulate(model, createInternetScenario());
  const scenarioWithExtraAvailability = createInternetScenario();
  scenarioWithExtraAvailability.availability['device-refrigerator'] = 0;

  const outcome = simulate(model, scenarioWithExtraAvailability);

  assert.equal(baseline.success, true);
  assert.equal(outcome.success, true);
  assert.deepEqual(outcome.targetResults, baseline.targetResults);
  assert.deepEqual(
    [...outcome.serviceResults.entries()],
    [...baseline.serviceResults.entries()],
  );
});

test('TS-27: dependency order does not change the target semantic result', () => {
  const firstModel = createInternetModel();
  firstModel.services[0].dependencyIds = [
    'device-router',
    'device-ont',
    'provider-isp',
  ];
  const secondModel = clone(firstModel);
  secondModel.services[0].dependencyIds = [
    'provider-isp',
    'device-ont',
    'device-router',
  ];
  const scenario = createInternetScenario();
  scenario.availability['device-router'] = 120;
  scenario.availability['device-ont'] = 120;

  const first = simulate(firstModel, scenario).targetResults[0];
  const second = simulate(secondModel, scenario).targetResults[0];

  assert.equal(first.availabilityDurationMinutes, 120);
  assert.equal(second.availabilityDurationMinutes, 120);
  assert.equal(first.status, 'Limited');
  assert.equal(second.status, 'Limited');
  assert.deepEqual(first.limitingDependencyIds, ['device-ont', 'device-router']);
  assert.deepEqual(second.limitingDependencyIds, ['device-ont', 'device-router']);
  assert.deepEqual(first.causalPaths, [
    ['service-internet', 'device-ont'],
    ['service-internet', 'device-router'],
  ]);
  assert.deepEqual(second.causalPaths, [
    ['service-internet', 'device-ont'],
    ['service-internet', 'device-router'],
  ]);
});

test('TS-28: repeated runs are deterministic and leave inputs unchanged', () => {
  const model = createSharedServicesModel();
  const scenario = createSharedServicesScenario();
  const modelBefore = clone(model);
  const scenarioBefore = clone(scenario);

  const first = simulate(model, scenario);
  const second = simulate(model, scenario);

  assert.deepEqual(model, modelBefore);
  assert.deepEqual(scenario, scenarioBefore);
  assert.deepEqual(first.targetResults, second.targetResults);
  assert.deepEqual(
    [...first.serviceResults.entries()],
    [...second.serviceResults.entries()],
  );
});

test('TS-29: reruns with changed Scenario availability without mutating the model', () => {
  const model = createInternetModel();
  const firstScenario = createInternetScenario();
  const secondScenario = createInternetScenario();
  secondScenario.availability['device-ont'] = 480;

  const first = simulate(model, firstScenario).targetResults[0];
  const second = simulate(model, secondScenario).targetResults[0];

  assert.equal(first.status, 'Limited');
  assert.equal(first.availabilityDurationMinutes, 120);
  assert.equal(second.status, 'Available');
  assert.equal(second.availabilityDurationMinutes, 480);
  assert.deepEqual(second.limitingDependencyIds, []);
  assert.deepEqual(second.causalPaths, []);
});
