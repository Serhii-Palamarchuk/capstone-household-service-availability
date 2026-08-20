export function invalidateResultState({ outcome, submittedInput, resultStale }) {
  return {
    outcome: null,
    submittedInput: null,
    resultStale: outcome ? true : resultStale,
  };
}
