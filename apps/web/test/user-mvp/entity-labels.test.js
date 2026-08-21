import assert from 'node:assert/strict';
import test from 'node:test';

import {
  backupSourceDisplayLabels,
  deviceDisplayLabels,
  fallbackBackupSourceName,
  fallbackDeviceName,
  fallbackServiceName,
  serviceDisplayLabels,
} from '../../src/user-mvp/entity-labels.js';
import { createTranslator } from '../../src/user-mvp/i18n.js';

const t = (key, params = {}) => ({
  'category.Router': 'Router',
}[key] ?? params.fallback ?? key);

test('device fallback is deterministic', () => {
  assert.equal(fallbackDeviceName({ category: 'Router', powerW: 15 }), 'Router · 15 W');
});

test('duplicate custom category name is suppressed', () => {
  const labels = deviceDisplayLabels([
    { id: 'r1', name: 'Router', category: 'Router', powerW: 15 },
  ], t);

  assert.equal(labels.get('r1'), 'Router · 15 W');
});

test('duplicate custom technical label is suppressed after trim and case normalization', () => {
  const labels = deviceDisplayLabels([
    { id: 'r1', name: ' router · 15 w ', category: 'Router', powerW: 15 },
  ], t);

  assert.equal(labels.get('r1'), 'Router · 15 W');
});

test('meaningful custom name is retained', () => {
  const labels = deviceDisplayLabels([
    { id: 'r1', name: 'Bedroom router', category: 'Router', powerW: 15 },
  ], t);

  assert.equal(labels.get('r1'), 'Bedroom router (Router · 15 W)');
});

test('identical unnamed labels get stable ordinals', () => {
  const labels = deviceDisplayLabels([
    { id: 'r1', name: '', category: 'Router', powerW: 15 },
    { id: 'r2', name: '', category: 'Router', powerW: 15 },
  ], t);

  assert.equal(labels.get('r1'), 'Router · 15 W #1');
  assert.equal(labels.get('r2'), 'Router · 15 W #2');
});

test('backup and service fallbacks are deterministic', () => {
  assert.equal(
    fallbackBackupSourceName({ type: 'PowerStation', usableCapacityWh: 1000, maxOutputPowerW: 1200 }),
    'Power station · 1000 Wh · 1200 W max',
  );
  assert.equal(fallbackServiceName({ templateId: 'Internet', variantId: 'Fiber' }), 'Internet · Fiber');
});

test('backup and service labels retain meaningful names and distinguish duplicates', () => {
  const sourceLabels = backupSourceDisplayLabels([
    { id: 's1', name: 'EcoFlow', type: 'PowerStation', usableCapacityWh: 1000, maxOutputPowerW: 1200 },
    { id: 's2', name: '', type: 'PowerStation', usableCapacityWh: 1000, maxOutputPowerW: 1200 },
  ], t);
  const serviceLabels = serviceDisplayLabels([
    { id: 'internet-a', name: '', templateId: 'Internet', variantId: 'Fiber' },
    { id: 'internet-b', name: '', templateId: 'Internet', variantId: 'Fiber' },
  ], t);

  assert.equal(sourceLabels.get('s1'), 'EcoFlow (Power station · 1000 Wh · 1200 W max)');
  assert.equal(sourceLabels.get('s2'), 'Power station · 1000 Wh · 1200 W max');
  assert.equal(serviceLabels.get('internet-a'), 'Internet · Fiber #1');
  assert.equal(serviceLabels.get('internet-b'), 'Internet · Fiber #2');
});

test('English translated base category, type, and template names do not repeat technical labels', () => {
  const en = createTranslator('en');

  assert.equal(deviceDisplayLabels([
    { id: 'device-router', name: 'Router', category: 'Router', powerW: 15 },
  ], en).get('device-router'), 'Router · 15 W');
  assert.equal(backupSourceDisplayLabels([{
    id: 'source-home',
    name: 'Power station',
    type: 'PowerStation',
    usableCapacityWh: 1000,
    maxOutputPowerW: 1200,
  }], en).get('source-home'), 'Power station · 1000 Wh · 1200 W max');
  assert.equal(serviceDisplayLabels([{
    id: 'service-work',
    name: 'Remote Work',
    templateId: 'RemoteWork',
    variantId: '',
  }], en).get('service-work'), 'Remote Work');
});

test('Ukrainian translated base names are suppressed while identifiers and ordinals stay stable', () => {
  const uk = createTranslator('uk');
  const devices = [
    { id: 'router-a', name: 'Маршрутизатор', category: 'Router', powerW: 15 },
    { id: 'router-b', name: 'Маршрутизатор', category: 'Router', powerW: 15 },
  ];
  const sources = [{
    id: 'source-home',
    name: 'Портативна електростанція',
    type: 'PowerStation',
    usableCapacityWh: 1000,
    maxOutputPowerW: 1200,
  }];
  const services = [{
    id: 'service-work',
    name: 'Віддалена робота',
    templateId: 'RemoteWork',
    variantId: '',
  }];
  const snapshot = structuredClone({ devices, services, sources });

  const deviceLabels = deviceDisplayLabels(devices, uk);
  assert.equal(deviceLabels.get('router-a'), 'Маршрутизатор · 15 Вт #1');
  assert.equal(deviceLabels.get('router-b'), 'Маршрутизатор · 15 Вт #2');
  assert.equal(
    backupSourceDisplayLabels(sources, uk).get('source-home'),
    'Портативна електростанція · 1000 Вт·год · 1200 Вт макс.',
  );
  assert.equal(serviceDisplayLabels(services, uk).get('service-work'), 'Віддалена робота');
  assert.deepEqual({ devices, services, sources }, snapshot);
});
