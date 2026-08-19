import test from 'node:test';
import assert from 'node:assert/strict';
import { createModelIndex } from '../../src/simulation/model-index.js';
import { calculateServiceResults } from '../../src/simulation/calculate.js';
import { simulate } from '../../src/simulation/simulate.js';
import { createInternetModel, createInternetScenario } from './fixtures.js';

test('TS-07: returns all equal leaf bottlenecks in stable order', () => {
  const model = createInternetModel();
  const scenario = createInternetScenario();
  scenario.availability = {
    'device-router': 120,
    'device-ont': 120,
    'provider-isp': 600,
  };

  const results = calculateServiceResults(createModelIndex(model), scenario);
  const result = results.get('service-internet');

  assert.deepEqual(result.limitingDependencyIds, ['device-ont', 'device-router']);
  assert.deepEqual(result.causalPaths, [
    ['service-internet', 'device-ont'],
    ['service-internet', 'device-router'],
  ]);
});

test('TS-08: returns equal leaf bottlenecks from direct and nested branches', () => {
  const model = {
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
    ],
    devices: [
      { id: 'device-router', name: 'Router' },
      { id: 'device-ont', name: 'ONT/ONU' },
      { id: 'device-laptop', name: 'Laptop' },
    ],
    externalProviders: [],
  };
  const scenario = {
    id: 'scenario-1',
    name: '6-hour outage',
    outageDurationMinutes: 360,
    targetServiceIds: ['service-remote-work'],
    availability: {
      'device-router': 480,
      'device-ont': 120,
      'device-laptop': 120,
    },
  };

  const outcome = simulate(model, scenario);

  assert.equal(outcome.success, true);
  assert.deepEqual(outcome.targetResults[0], {
    serviceId: 'service-remote-work',
    availabilityDurationMinutes: 120,
    status: 'Limited',
    limitingDependencyIds: ['device-laptop', 'device-ont'],
    causalPaths: [
      ['service-remote-work', 'device-laptop'],
      ['service-remote-work', 'service-internet', 'device-ont'],
    ],
  });
  assert.equal(
    outcome.serviceResults.get('service-internet').availabilityDurationMinutes,
    120,
  );
});

test('TS-09: returns one shared leaf bottleneck with both causal paths', () => {
  const model = {
    services: [
      {
        id: 'service-remote-work',
        name: 'Remote Work',
        dependencyIds: ['service-internet', 'service-vpn'],
      },
      {
        id: 'service-internet',
        name: 'Internet',
        dependencyIds: ['provider-isp'],
      },
      {
        id: 'service-vpn',
        name: 'VPN',
        dependencyIds: ['provider-isp'],
      },
    ],
    devices: [],
    externalProviders: [
      { id: 'provider-isp', name: 'Internet Provider' },
    ],
  };
  const scenario = {
    id: 'scenario-1',
    name: '6-hour outage',
    outageDurationMinutes: 360,
    targetServiceIds: ['service-remote-work'],
    availability: { 'provider-isp': 0 },
  };

  const results = calculateServiceResults(createModelIndex(model), scenario);
  const result = results.get('service-remote-work');

  assert.deepEqual(result.limitingDependencyIds, ['provider-isp']);
  assert.deepEqual(result.causalPaths, [
    ['service-remote-work', 'service-internet', 'provider-isp'],
    ['service-remote-work', 'service-vpn', 'provider-isp'],
  ]);
});
