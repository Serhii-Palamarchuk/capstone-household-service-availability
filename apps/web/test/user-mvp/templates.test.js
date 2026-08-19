import assert from 'node:assert/strict';
import test from 'node:test';

import { createServiceInstance, getServiceTemplate } from '../../src/user-mvp/service-builder.js';
import {
  remoteWorkInput,
  remoteWorkWithRefrigerator,
  templateContext,
  validCatalogInputs,
} from './fixtures.js';

test('AC-08: Remote Work accepts Internet + Laptop + two Monitors', () => {
  const result = createServiceInstance(remoteWorkInput(), templateContext());

  assert.equal(result.success, true);
  assert.deepEqual(result.service.dependencyIds, [
    'service-internet-home',
    'device-laptop',
    'device-monitor-1',
    'device-monitor-2',
  ]);
});

test('AC-08: Refrigerator cannot bind to Work Devices', () => {
  const result = createServiceInstance(remoteWorkWithRefrigerator(), templateContext());

  assert.equal(result.success, false);
  assert.ok(result.errors.some((error) => error.code === 'TEMPLATE_ROLE_CATEGORY'));
});

test('AC-08: required roles and non-empty 1..N bindings are enforced', () => {
  const missingRole = createServiceInstance(remoteWorkInput({
    dependencyBindings: { workDevices: ['device-laptop'] },
  }), templateContext());
  const emptyManyRole = createServiceInstance(remoteWorkInput({
    dependencyBindings: {
      internetService: ['service-internet-home'],
      workDevices: [],
    },
  }), templateContext());

  assert.equal(missingRole.success, false);
  assert.ok(missingRole.errors.some((error) => error.code === 'TEMPLATE_ROLE_REQUIRED'));
  assert.equal(emptyManyRole.success, false);
  assert.ok(emptyManyRole.errors.some((error) => error.code === 'TEMPLATE_ROLE_CARDINALITY'));
});

test('AC-09: every predefined catalog variant creates a valid ServiceInstance', () => {
  for (const input of validCatalogInputs()) {
    const result = createServiceInstance(input, templateContext());
    assert.equal(result.success, true, `${input.templateId}/${input.variantId ?? 'default'}`);
  }
});

test('AC-09: only predefined templates and variants are available', () => {
  assert.equal(getServiceTemplate('Custom', 'Anything'), null);
  assert.equal(getServiceTemplate('Internet', 'Satellite'), null);

  const custom = createServiceInstance(remoteWorkInput({ templateId: 'Custom' }), templateContext());
  const unknownVariant = createServiceInstance(remoteWorkInput({
    templateId: 'Internet',
    variantId: 'Satellite',
  }), templateContext());

  assert.ok(custom.errors.some((error) => error.code === 'TEMPLATE_NOT_FOUND'));
  assert.ok(unknownVariant.errors.some((error) => error.code === 'TEMPLATE_VARIANT_NOT_FOUND'));
});

test('template bindings cannot introduce a role outside the selected variant', () => {
  const result = createServiceInstance(remoteWorkInput({
    dependencyBindings: {
      internetService: ['service-internet-home'],
      workDevices: ['device-laptop'],
      customGraph: ['device-refrigerator'],
    },
  }), templateContext());

  assert.equal(result.success, false);
  assert.ok(result.errors.some((error) => error.code === 'TEMPLATE_ROLE_NOT_FOUND'));
});

test('AC-10: two Remote Work instances can share one existing Internet Service', () => {
  const first = createServiceInstance(remoteWorkInput({ id: 'service-remote-work-a' }), templateContext());
  const second = createServiceInstance(remoteWorkInput({ id: 'service-remote-work-b', name: 'Remote Work — B' }), templateContext());

  assert.equal(first.success, true);
  assert.equal(second.success, true);
  assert.equal(first.service.dependencyIds[0], 'service-internet-home');
  assert.equal(second.service.dependencyIds[0], 'service-internet-home');
});

test('dependency IDs are flattened in role order without duplicates', () => {
  const result = createServiceInstance(remoteWorkInput({
    dependencyBindings: {
      internetService: ['service-internet-home'],
      workDevices: ['device-laptop', 'device-laptop', 'device-monitor-1'],
    },
  }), templateContext());

  assert.equal(result.success, true);
  assert.deepEqual(result.service.dependencyIds, [
    'service-internet-home',
    'device-laptop',
    'device-monitor-1',
  ]);
});
