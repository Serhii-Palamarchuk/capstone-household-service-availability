import test from 'node:test';
import assert from 'node:assert/strict';
import { createModelIndex } from '../../src/simulation/model-index.js';
import { validateScenarioStructure } from '../../src/simulation/validation.js';
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
