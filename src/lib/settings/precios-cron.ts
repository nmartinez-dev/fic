/** Día de la semana en cron estándar (0 = domingo, 1 = lunes, …). */
export type CronWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type PreciosCronSchedule = {
  hour: number;
  days: CronWeekday[];
};

export const ALL_CRON_WEEKDAYS: CronWeekday[] = [0, 1, 2, 3, 4, 5, 6];

/** Orden visual: lunes a domingo. */
export const WEEKDAY_OPTIONS: { value: CronWeekday; label: string }[] = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
  { value: 0, label: 'Dom' },
];

const SCHEDULE_RE = /^0 (\d{1,2}) \* \* (.+)$/;

function parseDowField(field: string): CronWeekday[] | null {
  if (field === '*') return [...ALL_CRON_WEEKDAYS];

  const days = new Set<CronWeekday>();

  for (const part of field.split(',')) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const range = trimmed.match(/^(\d)-(\d)$/);
    if (range) {
      const start = Number(range[1]);
      const end = Number(range[2]);
      if (start > end) return null;
      for (let d = start; d <= end; d++) {
        if (d < 0 || d > 6) return null;
        days.add(d as CronWeekday);
      }
      continue;
    }

    const day = Number(trimmed);
    if (!Number.isInteger(day) || day < 0 || day > 6) return null;
    days.add(day as CronWeekday);
  }

  if (days.size === 0) return null;
  return [...days].sort((a, b) => a - b);
}

function formatDowField(days: CronWeekday[]): string {
  const unique = [...new Set(days)].sort((a, b) => a - b);
  if (unique.length === ALL_CRON_WEEKDAYS.length) return '*';
  return unique.join(',');
}

export function parsePreciosCron(expression: string): PreciosCronSchedule {
  const trimmed = expression.trim();
  const match = trimmed.match(SCHEDULE_RE);

  if (!match) {
    return { hour: 6, days: [...ALL_CRON_WEEKDAYS] };
  }

  const hour = Number(match[1]);
  const days = parseDowField(match[2]);

  if (!Number.isInteger(hour) || hour < 0 || hour > 23 || !days) {
    return { hour: 6, days: [...ALL_CRON_WEEKDAYS] };
  }

  return { hour, days };
}

export function formatPreciosCron(schedule: PreciosCronSchedule): string {
  const hour = Math.min(23, Math.max(0, schedule.hour));
  const days =
    schedule.days.length > 0 ? schedule.days : [...ALL_CRON_WEEKDAYS];

  return `0 ${hour} * * ${formatDowField(days)}`;
}

export function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

export const HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) => ({
  value: String(hour),
  label: formatHour(hour),
}));

export function describePreciosCron(expression: string): string {
  const { hour, days } = parsePreciosCron(expression);
  const dayLabels = WEEKDAY_OPTIONS.filter((d) => days.includes(d.value)).map(
    (d) => d.label
  );

  if (days.length === ALL_CRON_WEEKDAYS.length) {
    return `Todos los días a las ${formatHour(hour)}`;
  }

  return `${dayLabels.join(', ')} a las ${formatHour(hour)}`;
}
