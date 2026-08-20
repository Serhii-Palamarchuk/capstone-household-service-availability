import assert from 'node:assert/strict';
import test from 'node:test';
import { invalidateResultState } from '../../src/user-mvp/result-state.js';

test('existing result becomes stale', () => {
  assert.deepEqual(
    invalidateResultState({ outcome: { success: true }, submittedInput: { id: 1 }, resultStale: false }),
    { outcome: null, submittedInput: null, resultStale: true },
  );
});

test('no existing result stays non-stale', () => {
  assert.deepEqual(
    invalidateResultState({ outcome: null, submittedInput: null, resultStale: false }),
    { outcome: null, submittedInput: null, resultStale: false },
  );
});
