import assert from 'node:assert/strict';
import test from 'node:test';
import {
  SUPPORTED_LANGUAGES,
  createTranslator,
  translateRecommendation,
  translateStatus,
  translateValidationError,
  translateWarning,
} from '../../src/user-mvp/i18n.js';

test('English and Ukrainian UI strings resolve', () => {
  const en = createTranslator('en');
  const uk = createTranslator('uk');

  assert.deepEqual(SUPPORTED_LANGUAGES, ['en', 'uk']);
  assert.equal(en('actions.continue'), 'Continue');
  assert.equal(uk('actions.continue'), 'Продовжити');
  assert.equal(translateStatus('Limited', en), 'Limited');
  assert.equal(translateStatus('Limited', uk), 'Обмежено');
  assert.equal(createTranslator('unsupported')('actions.back'), 'Back');
  assert.equal(uk('missing.key', { fallback: 'Fallback' }), 'Fallback');
});

test('current form and result copy has English and Ukrainian translations', () => {
  const en = createTranslator('en');
  const uk = createTranslator('uk');

  assert.equal(en('formErrors.heading'), 'Correct the scenario before running it');
  assert.equal(uk('formErrors.heading'), 'Виправте сценарій перед запуском');
  assert.equal(en('formErrors.fallback'), 'Check this value.');
  assert.equal(uk('formErrors.fallback'), 'Перевірте це значення.');
  assert.equal(en('result.failureTitle'), 'Scenario could not run');
  assert.equal(uk('result.failureTitle'), 'Сценарій не вдалося запустити');
  assert.equal(
    en('result.failureDescription'),
    'Correct these errors and run the scenario again. No partial result is shown.',
  );
  assert.equal(
    uk('result.failureDescription'),
    'Виправте ці помилки й запустіть сценарій ще раз. Частковий результат не показано.',
  );
  assert.equal(en('result.errorFallback'), 'Review the scenario input.');
  assert.equal(uk('result.errorFallback'), 'Перевірте введені дані сценарію.');
  assert.equal(en('result.heading'), 'Availability result');
  assert.equal(uk('result.heading'), 'Результат доступності');
  assert.equal(en('result.availability'), 'Availability:');
  assert.equal(uk('result.availability'), 'Доступність:');
  assert.equal(en('role.oneOrMore'), 'one or more');
  assert.equal(uk('role.oneOrMore'), 'один або більше');
});

test('category, backup type, and service template identifiers have distinct Ukrainian labels', () => {
  const en = createTranslator('en');
  const uk = createTranslator('uk');

  assert.equal(en('category.Router'), 'Router');
  assert.equal(uk('category.Router'), 'Маршрутизатор');
  assert.notEqual(uk('category.Router'), en('category.Router'));
  assert.equal(en('backupType.PowerStation'), 'Power station');
  assert.equal(uk('backupType.PowerStation'), 'Портативна електростанція');
  assert.notEqual(uk('backupType.PowerStation'), en('backupType.PowerStation'));
  assert.equal(en('template.RemoteWork'), 'Remote Work');
  assert.equal(uk('template.RemoteWork'), 'Віддалена робота');
  assert.notEqual(uk('template.RemoteWork'), en('template.RemoteWork'));
});

test('translation helpers render messages without mutating stable status and validation identifiers', () => {
  const uk = createTranslator('uk');
  const target = { status: 'Limited' };
  const error = { code: 'BACKUP_SOURCE_MAX_OUTPUT_EXCEEDED', sourceId: 'source-home' };

  assert.equal(translateStatus(target.status, uk), 'Обмежено');
  assert.equal(
    translateValidationError(error, uk),
    'Потужність навантаження перевищує максимальну вихідну потужність резервного джерела.',
  );
  assert.equal(target.status, 'Limited');
  assert.equal(error.code, 'BACKUP_SOURCE_MAX_OUTPUT_EXCEEDED');
});

test('warning translation uses display names without mutating its code', () => {
  const warning = { code: 'MISSING_BACKUP_SOURCE_MAX_OUTPUT', sourceId: 'source-home' };

  assert.equal(
    translateWarning(warning, createTranslator('uk'), () => 'Домашній резерв'),
    'Для Домашній резерв не задано максимальну вихідну потужність; перевантаження не перевірялося.',
  );
  assert.equal(warning.code, 'MISSING_BACKUP_SOURCE_MAX_OUTPUT');
});

test('each recommendation type translates without mutating its stable type', () => {
  const en = createTranslator('en');
  const recommendations = [
    { type: 'ADD_BACKUP', entityId: 'device-router' },
    { type: 'EXTERNAL_PROVIDER_LIMIT', entityId: 'provider-internet' },
    { type: 'DISABLE_ADDITIONAL_LOAD', entityId: 'device-lamp', improvementMinutes: 60 },
  ];
  const names = {
    'device-router': 'Router',
    'provider-internet': 'Internet provider',
    'device-lamp': 'Desk lamp',
  };

  assert.equal(
    translateRecommendation(recommendations[0], en, id => names[id]),
    'Add backup power for Router.',
  );
  assert.equal(
    translateRecommendation(recommendations[1], en, id => names[id]),
    'Internet provider is limiting availability; increasing local battery capacity does not remove this provider limit.',
  );
  assert.equal(
    translateRecommendation(recommendations[2], en, id => names[id]),
    'Disabling Desk lamp improves every selected target by at least 60 minutes.',
  );
  assert.deepEqual(
    recommendations.map(recommendation => recommendation.type),
    ['ADD_BACKUP', 'EXTERNAL_PROVIDER_LIMIT', 'DISABLE_ADDITIONAL_LOAD'],
  );
});
