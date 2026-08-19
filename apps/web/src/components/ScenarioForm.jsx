const fields = [
  { name: 'outageHours', label: 'Outage duration (hours)' },
  { name: 'routerHours', label: 'Router availability (hours)' },
  { name: 'ontHours', label: 'ONT/ONU availability (hours)' },
  { name: 'providerHours', label: 'Internet Provider availability (hours)' },
];

export function ScenarioForm({ values, onChange, onSubmit }) {
  return (
    <form className="scenario-card" onSubmit={onSubmit}>
      <div className="scenario-grid">
        {fields.map(({ name, label }) => (
          <label key={name} htmlFor={name}>
            {label}
            <input
              id={name}
              name={name}
              type="number"
              min="0"
              step="any"
              value={values[name]}
              onChange={event => onChange(event.target.name, event.target.value)}
            />
          </label>
        ))}
      </div>
      <button type="submit">Run simulation</button>
    </form>
  );
}
