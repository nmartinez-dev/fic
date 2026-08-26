export function formatCurrency(amount: number, currency = 'ARS'): string {
  try {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/** Fecha ISO (YYYY-MM-DD) a texto legible es-AR. */
export function formatDate(date: string): string {
  try {
    const d = new Date(`${date}T00:00:00`);
    return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(d);
  } catch {
    return date;
  }
}

/** Timestamp completo a texto legible es-AR. */
export function formatDateTime(value: string): string {
  try {
    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function todayISO(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

/** Dias entre dos fechas ISO (b - a). Negativo => a es posterior a b. */
export function daysBetween(a: string, b: string): number {
  const da = new Date(`${a}T00:00:00`).getTime();
  const db = new Date(`${b}T00:00:00`).getTime();
  return Math.round((db - da) / (1000 * 60 * 60 * 24));
}

export function isUniqueConstraintError(err: unknown): boolean {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    return (err as { code: string }).code === '23505';
  }
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return msg.includes('unique') || msg.includes('duplicate key');
  }
  return false;
}
