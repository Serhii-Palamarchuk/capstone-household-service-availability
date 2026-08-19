import test from 'node:test';
import assert from 'node:assert/strict';
import { createModelIndex } from '../../src/simulation/model-index.js';
import {
  validateScenarioStructure,
  validateSimulationInput,
} from '../../src/simulation/validation.js';
import { simulate } from '../../src/simulation/simulate.js';
import { createInternetModel, createInternetScenario } from './fixtures.js';

for (const value of [0, -1, 1.5]) {
  test(`TS-18: rejects outageDurationMinutes=${value}`, () => {
    const index = createModelIndex(createInternetModel());
    const scenario = {
      ...createInternetScenario(),
      outageDurationMinutes: value,
    };

    const errors = validateScenarioStructure(index, scenario);
    assert.ok(errors.some(error =>
      error.code === 'INVALID_OUTAGE_DURATION' &&
      error.field === 'outageDurationMinutes'
    ));
  });
}

test('TS-19: rejects empty targetServiceIds', () => {
  const index = createModelIndex(createInternetModel());
  const scenario = {
    ...createInternetScenario(),
    targetServiceIds: [],
  };

  const errors = validateScenarioStructure(index, scenario);
  assert.ok(errors.some(error =>
    error.code === 'EMPTY_TARGET_SERVICES' &&
    error.field === 'targetServiceIds'
  ));
});

test('TS-20: rejects duplicated target', () => {
  const index = createModelIndex(createInternetModel());
  const scenario = {
    ...createInternetScenario(),
    targetServiceIds: ['service-internet', 'service-internet'],
  };

  const errors = validateScenarioStructure(index, scenario);
  assert.ok(errors.some(error =>
    error.code === 'DUPLICATE_TARGET_SERVICE' &&
    error.nodeId === 'service-internet' &&
    error.field === 'targetServiceIds'
  ));
});

test('TS-21: rejects target that does not exist', () => {
  const index = createModelIndex(createInternetModel());
  const scenario = {
    ...createInternetScenario(),
    targetServiceIds: ['missing-service'],
  };

  const errors = validateScenarioStructure(index, scenario);
  assert.ok(errors.some(error =>
    error.code === 'TARGET_SERVICE_NOT_FOUND' &&
    error.field === 'targetServiceIds'
  ));
});

test('TS-21: rejects target that is a Device, not a Service', () => {
  const index = createModelIndex(createInternetModel());
  const scenario = {
    ...createInternetScenario(),
    targetServiceIds: ['device-router'],
  };

  const errors = validateScenarioStructure(index, scenario);
  assert.ok(errors.some(error =>
    error.code === 'TARGET_SERVICE_NOT_FOUND' &&
    error.field === 'targetServiceIds'
  ));
});

test('TS-22: availability key referencing a missing node is invalid', () => {
  const index = createModelIndex(createInternetModel());
  const scenario = createInternetScenario();
  scenario.availability['missing-node'] = 10;

  const errors = validateScenarioStructure(index, scenario);
  assert.ok(errors.some(error =>
    error.code === 'INVALID_AVAILABILITY_NODE' &&
    error.nodeId === 'missing-node' &&
    error.field === 'availability'
  ));
});

test('regression: invalid availability key does not skip value validation', () => {
  const index = createModelIndex(createInternetModel());
  const scenario = createInternetScenario();
  scenario.availability['missing-node'] = -1;

  const errors = validateScenarioStructure(index, scenario);
  assert.ok(errors.some(error =>
    error.code === 'INVALID_AVAILABILITY_NODE' &&
    error.nodeId === 'missing-node' &&
    error.field === 'availability'
  ));
  assert.ok(errors.some(error =>
    error.code === 'INVALID_AVAILABILITY_VALUE' &&
    error.nodeId === 'missing-node' &&
    error.field === 'availability'
  ));
});

test('TS-22: availability key cannot reference Service', () => {
  const index = createModelIndex(createInternetModel());
  const scenario = createInternetScenario();
  scenario.availability['service-internet'] = 10;

  const errors = validateScenarioStructure(index, scenario);
  assert.ok(errors.some(error =>
    error.code === 'INVALID_AVAILABILITY_NODE' &&
    error.nodeId === 'service-internet' &&
    error.field === 'availability'
  ));
});

for (const value of [-1, 1.5]) {
  test(`TS-23: rejects availability value=${value}`, () => {
    const index = createModelIndex(createInternetModel());
    const scenario = createInternetScenario();
    scenario.availability['device-router'] = value;

    const errors = validateScenarioStructure(index, scenario);
    assert.ok(errors.some(error =>
      error.code === 'INVALID_AVAILABILITY_VALUE' &&
      error.field === 'availability'
    ));
  });
}

test('TS-23: accepts availability value=0', () => {
  const index = createModelIndex(createInternetModel());
  const scenario = createInternetScenario();
  scenario.availability['device-router'] = 0;

  const errors = validateScenarioStructure(index, scenario);
  assert.ok(!errors.some(error => error.code === 'INVALID_AVAILABILITY_VALUE'));
});

test('valid structural scenario produces no errors', () => {
  const index = createModelIndex(createInternetModel());
  const scenario = createInternetScenario();

  const errors = validateScenarioStructure(index, scenario);
  assert.deepEqual(errors, []);
});

test('TS-11: unreachable incomplete Service produces no simulation validation error', () => {
  const model = {
    services: [
      { id: 'service-internet', name: 'Internet', dependencyIds: ['device-router'] },
      { id: 'service-heating', name: 'Heating', dependencyIds: [] },
    ],
    devices: [{ id: 'device-router', name: 'Router' }],
    externalProviders: [],
  };

  const scenario = {
    id: 's1',
    name: 'scenario',
    outageDurationMinutes: 360,
    targetServiceIds: ['service-internet'],
    availability: { 'device-router': 480 },
  };

  const errors = validateSimulationInput(createModelIndex(model), scenario);
  assert.deepEqual(errors, []);
});

test('TS-12: cycle in unreachable part of the model does not block independent target', () => {
  const model = {
    services: [
      { id: 'service-internet', name: 'Internet', dependencyIds: ['device-router'] },
      { id: 'service-heating', name: 'Heating', dependencyIds: ['service-water'] },
      { id: 'service-water', name: 'Water', dependencyIds: ['service-heating'] },
    ],
    devices: [{ id: 'device-router', name: 'Router' }],
    externalProviders: [],
  };

  const scenario = {
    id: 's1',
    name: 'scenario',
    outageDurationMinutes: 360,
    targetServiceIds: ['service-internet'],
    availability: { 'device-router': 480 },
  };

  const errors = validateSimulationInput(createModelIndex(model), scenario);
  assert.deepEqual(errors, []);
});

test('TS-14: missing reachable leaf availability is an error', () => {
  const model = createInternetModel();
  const scenario = createInternetScenario();
  delete scenario.availability['device-ont'];

  const errors = validateSimulationInput(createModelIndex(model), scenario);
  assert.ok(errors.some(error =>
    error.code === 'MISSING_AVAILABILITY' &&
    error.nodeId === 'device-ont' &&
    error.field === 'availability'
  ));
});

test('simulate returns no partial results on validation failure', () => {
  const scenario = createInternetScenario();
  delete scenario.availability['device-ont'];

  const outcome = simulate(createInternetModel(), scenario);

  assert.equal(outcome.success, false);
  assert.ok(outcome.errors.some(error => error.code === 'MISSING_AVAILABILITY'));
  assert.equal('targetResults' in outcome, false);
  assert.equal('serviceResults' in outcome, false);
});

test('TS-15: reachable Service without dependencies is an error', () => {
  const model = {
    services: [
      { id: 'service-internet', name: 'Internet', dependencyIds: [] },
    ],
    devices: [],
    externalProviders: [],
  };

  const scenario = {
    id: 's1',
    name: 'scenario',
    outageDurationMinutes: 360,
    targetServiceIds: ['service-internet'],
    availability: {},
  };

  const errors = validateSimulationInput(createModelIndex(model), scenario);
  assert.ok(errors.some(error =>
    error.code === 'SERVICE_WITHOUT_DEPENDENCIES' &&
    error.nodeId === 'service-internet' &&
    error.field === 'dependencyIds'
  ));
});

test('TS-16: dependency referencing a missing node is an error', () => {
  const model = {
    services: [
      {
        id: 'service-internet',
        name: 'Internet',
        dependencyIds: ['device-router', 'missing-node'],
      },
    ],
    devices: [{ id: 'device-router', name: 'Router' }],
    externalProviders: [],
  };

  const scenario = {
    id: 's1',
    name: 'scenario',
    outageDurationMinutes: 360,
    targetServiceIds: ['service-internet'],
    availability: { 'device-router': 480 },
  };

  const errors = validateSimulationInput(createModelIndex(model), scenario);
  assert.ok(errors.some(error =>
    error.code === 'DEPENDENCY_NOT_FOUND' &&
    error.nodeId === 'service-internet' &&
    error.field === 'dependencyIds'
  ));
});

test('TS-17: reachable cycle has canonical path', () => {
  const model = {
    services: [
      { id: 'service-a', name: 'A', dependencyIds: ['service-b'] },
      { id: 'service-b', name: 'B', dependencyIds: ['service-c'] },
      { id: 'service-c', name: 'C', dependencyIds: ['service-a'] },
    ],
    devices: [],
    externalProviders: [],
  };
  const scenario = {
    id: 's1',
    name: 'cycle',
    outageDurationMinutes: 360,
    targetServiceIds: ['service-a'],
    availability: {},
  };

  const errors = validateSimulationInput(createModelIndex(model), scenario);
  const cycle = errors.find(error => error.code === 'CYCLE_DETECTED');
  assert.deepEqual(cycle.path, ['service-a', 'service-b', 'service-c', 'service-a']);
});

test('regression: cycle canonical path rotates to the lexicographically smallest id regardless of DFS start', () => {
  const model = {
    services: [
      { id: 'service-c', name: 'C', dependencyIds: ['service-a'] },
      { id: 'service-a', name: 'A', dependencyIds: ['service-b'] },
      { id: 'service-b', name: 'B', dependencyIds: ['service-c'] },
    ],
    devices: [],
    externalProviders: [],
  };
  const scenario = {
    id: 's1',
    name: 'cycle',
    outageDurationMinutes: 360,
    targetServiceIds: ['service-c'],
    availability: {},
  };

  const errors = validateSimulationInput(createModelIndex(model), scenario);
  const cycle = errors.find(error => error.code === 'CYCLE_DETECTED');
  assert.deepEqual(cycle.path, ['service-a', 'service-b', 'service-c', 'service-a']);
});

test('regression: equal code/nodeId/field errors are ordered by path as the final tie-breaker', () => {
  const model = {
    services: [
      {
        id: 'service-a',
        name: 'A',
        dependencyIds: ['service-d', 'service-b'],
      },
      { id: 'service-b', name: 'B', dependencyIds: ['service-a'] },
      { id: 'service-d', name: 'D', dependencyIds: ['service-a'] },
    ],
    devices: [],
    externalProviders: [],
  };
  const scenario = {
    id: 's1',
    name: 'two cycles through the same node, discovered out of lexicographic order',
    outageDurationMinutes: 360,
    targetServiceIds: ['service-a'],
    availability: {},
  };

  const errors = validateSimulationInput(createModelIndex(model), scenario);
  const cycles = errors.filter(error => error.code === 'CYCLE_DETECTED');

  assert.equal(cycles.length, 2);
  assert.ok(cycles.every(cycle => cycle.nodeId === 'service-a' && cycle.field === 'dependencyIds'));

  assert.deepEqual(cycles.map(cycle => cycle.path), [
    ['service-a', 'service-b', 'service-a'],
    ['service-a', 'service-d', 'service-a'],
  ]);
});

test('TS-24: multiple independent validation errors are collected together', () => {
  const model = createInternetModel();
  const scenario = createInternetScenario();
  scenario.outageDurationMinutes = 0;
  delete scenario.availability['device-ont'];

  const errors = validateSimulationInput(createModelIndex(model), scenario);
  assert.ok(errors.some(error => error.code === 'INVALID_OUTAGE_DURATION'));
  assert.ok(errors.some(error =>
    error.code === 'MISSING_AVAILABILITY' &&
    error.nodeId === 'device-ont'
  ));
});

test('TS-25: one shared-leaf problem is not duplicated through multiple paths', () => {
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
    externalProviders: [{ id: 'provider-isp', name: 'Internet Provider' }],
  };

  const scenario = {
    id: 's1',
    name: 'scenario',
    outageDurationMinutes: 360,
    targetServiceIds: ['service-remote-work'],
    availability: {},
  };

  const errors = validateSimulationInput(createModelIndex(model), scenario);
  const missingAvailabilityErrors = errors.filter(error =>
    error.code === 'MISSING_AVAILABILITY' && error.nodeId === 'provider-isp'
  );
  assert.equal(missingAvailabilityErrors.length, 1);
});

test('TS-26: validation errors are sorted deterministically by code, nodeId, field', () => {
  const model = createInternetModel();
  const scenario = createInternetScenario();
  scenario.outageDurationMinutes = 0;
  delete scenario.availability['device-ont'];
  delete scenario.availability['provider-isp'];

  const errors = validateSimulationInput(createModelIndex(model), scenario);
  const keys = errors.map(error => [error.code, error.nodeId ?? '', error.field ?? '']);
  const sortedKeys = [...keys].sort((a, b) => {
    for (let i = 0; i < a.length; i += 1) {
      if (a[i] !== b[i]) {
        return a[i] < b[i] ? -1 : 1;
      }
    }
    return 0;
  });
  assert.deepEqual(keys, sortedKeys);

  const errorsAgain = validateSimulationInput(createModelIndex(model), scenario);
  assert.deepEqual(errors, errorsAgain);
});
