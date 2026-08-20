import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'vite';

import {
  createInitialUserMvpState,
  normalizeUserMvpForm,
} from '../../src/user-mvp/form-state.js';
import { runUserScenario } from '../../src/user-mvp/run-user-scenario.js';

let executeQuickRecalculation;
let viteServer;

before(async () => {
  viteServer = await createServer({
    appType: 'custom',
    logLevel: 'silent',
    server: { middlewareMode: true },
  });
  ({ executeQuickRecalculation } = await viteServer.ssrLoadModule('/src/App.jsx'));
});

after(async () => {
  await viteServer?.close();
});

test('invalid quick-edit patch returns errors without committing or mutating current state', () => {
  const currentForm = createInitialUserMvpState();
  const submittedInput = normalizeUserMvpForm(currentForm);
  const currentOutcome = runUserScenario(submittedInput);
  const formSnapshot = structuredClone(currentForm);
  const outcomeSnapshot = structuredClone(currentOutcome);
  let commitCalls = 0;
  let renderedForm = currentForm;
  let renderedInput = submittedInput;
  let renderedOutcome = currentOutcome;

  const response = executeQuickRecalculation(
    currentForm,
    { sourceId: 'missing-source', usableCapacityWh: '960' },
    ({ nextOutcome, nextState, normalized }) => {
      commitCalls += 1;
      renderedForm = nextState;
      renderedInput = normalized;
      renderedOutcome = nextOutcome;
    },
  );

  assert.deepEqual(response, {
    success: false,
    errors: [{
      code: 'INVALID_QUICK_EDIT_PATCH',
      message: 'Quick edit sourceId must identify an existing backup source',
    }],
  });
  assert.equal(commitCalls, 0);
  assert.equal(renderedForm, currentForm);
  assert.equal(renderedInput, submittedInput);
  assert.equal(renderedOutcome, currentOutcome);
  assert.deepEqual(currentForm, formSnapshot);
  assert.deepEqual(currentOutcome, outcomeSnapshot);
});

test('unexpected TypeError from corrupted state propagates without committing', () => {
  const corruptedForm = {
    ...createInitialUserMvpState(),
    backupSources: null,
  };
  let commitCalls = 0;

  assert.throws(
    () => executeQuickRecalculation(
      corruptedForm,
      { sourceId: 'source-home', usableCapacityWh: '960' },
      () => { commitCalls += 1; },
    ),
    error => error instanceof TypeError && error.name === 'TypeError',
  );
  assert.equal(commitCalls, 0);
});
