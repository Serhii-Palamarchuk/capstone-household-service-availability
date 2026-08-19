import { useState } from 'react';
import { ScenarioForm } from './components/ScenarioForm.jsx';
import {
  DEFAULT_INTERNET_DEMO_INPUTS,
  createInternetScenarioFromHours,
  INTERNET_DEMO_MODEL,
} from './demo/internet-demo.js';
import { simulate } from './simulation/simulate.js';

export function App() {
  const [values, setValues] = useState(DEFAULT_INTERNET_DEMO_INPUTS);
  const [conversionErrors, setConversionErrors] = useState([]);
  const [, setOutcome] = useState(null);

  function handleChange(field, value) {
    setValues(currentValues => ({ ...currentValues, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const conversion = createInternetScenarioFromHours(values);
    if (!conversion.success) {
      setConversionErrors(conversion.errors);
      return;
    }

    setConversionErrors([]);
    setOutcome(simulate(INTERNET_DEMO_MODEL, conversion.scenario));
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">Power outage scenario</p>
        <h1>Household Service Availability</h1>
        <p>
          Estimate whether Internet remains available by evaluating all of
          its required dependencies.
        </p>
      </header>
      <ScenarioForm
        values={values}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
      {conversionErrors.length > 0 && (
        <div role="alert" className="input-errors">
          <h2>Check scenario values</h2>
          <ul>
            {conversionErrors.map(({ field, message }) => (
              <li key={field}>{message}</li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
