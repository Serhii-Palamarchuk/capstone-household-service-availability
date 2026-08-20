function clean(value) {
  return String(value ?? '').trim();
}

function comparable(value) {
  return clean(value).toLocaleLowerCase();
}

function translated(t, key, fallback) {
  return t(key, { fallback });
}

function withOrdinals(entries) {
  const counts = new Map();

  for (const { label } of entries) {
    const key = comparable(label);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const occurrences = new Map();
  return new Map(entries.map(({ id, label }) => {
    const key = comparable(label);
    const occurrence = (occurrences.get(key) ?? 0) + 1;
    occurrences.set(key, occurrence);
    return [id, counts.get(key) > 1 ? `${label} #${occurrence}` : label];
  }));
}

function displayLabels(entities, technicalLabel, rawName) {
  return withOrdinals(entities.map((entity) => {
    const technical = technicalLabel(entity);
    const customName = clean(entity.name);
    const comparisons = [rawName(entity), technical];
    const isDuplicate = comparisons.some(value => comparable(customName) === comparable(value));
    return {
      id: entity.id,
      label: customName && !isDuplicate ? `${customName} (${technical})` : technical,
    };
  }));
}

export function fallbackDeviceName(device) {
  return `${clean(device.category) || 'Device'} · ${clean(device.powerW)} W`;
}

export function fallbackBackupSourceName(source) {
  const type = source.type === 'PowerStation' ? 'Power station' : clean(source.type) || 'Backup source';
  const parts = [type, `${clean(source.usableCapacityWh)} Wh`];
  if (clean(source.maxOutputPowerW)) parts.push(`${clean(source.maxOutputPowerW)} W max`);
  return parts.join(' · ');
}

export function fallbackServiceName(service) {
  return [clean(service.templateId) || 'Service', clean(service.variantId)].filter(Boolean).join(' · ');
}

export function deviceDisplayLabels(devices, t) {
  return displayLabels(
    devices,
    device => `${translated(
      t,
      `category.${device.category}`,
      clean(device.category) || translated(t, 'label.genericDevice', 'Device'),
    )} · ${t('unit.watts', {
      value: clean(device.powerW),
      fallback: `${clean(device.powerW)} W`,
    })}`,
    device => device.category,
  );
}

export function backupSourceDisplayLabels(sources, t) {
  return displayLabels(
    sources,
    source => {
      const type = source.type === 'PowerStation'
        ? translated(t, 'backupType.PowerStation', 'Power station')
        : translated(
          t,
          `backupType.${source.type}`,
          clean(source.type) || translated(t, 'label.genericBackupSource', 'Backup source'),
        );
      const parts = [type, t('unit.wattHours', {
        value: clean(source.usableCapacityWh),
        fallback: `${clean(source.usableCapacityWh)} Wh`,
      })];
      if (clean(source.maxOutputPowerW)) {
        parts.push(t('unit.maximumWatts', {
          value: clean(source.maxOutputPowerW),
          fallback: `${clean(source.maxOutputPowerW)} W max`,
        }));
      }
      return parts.join(' · ');
    },
    source => source.type,
  );
}

export function serviceDisplayLabels(services, t) {
  return displayLabels(
    services,
    service => [
      translated(
        t,
        `template.${service.templateId}`,
        clean(service.templateId) || translated(t, 'label.genericService', 'Service'),
      ),
      clean(service.variantId)
        ? translated(t, `variant.${service.variantId}`, clean(service.variantId))
        : '',
    ].filter(Boolean).join(' · '),
    service => service.templateId,
  );
}
