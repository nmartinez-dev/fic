/**
 * Montos en pesos (ARS). En Postgres se guardan como NUMERIC(14,2).
 * Trabajamos en escala de centavos para evitar errores de punto flotante
 * al sumar (el cliente decia que "sumando a mano siempre me da distinto").
 */

const DECIMALS = 2;
const FACTOR = 10 ** DECIMALS;

export function roundMoney(amount: number): number {
  if (!Number.isFinite(amount)) return 0;
  return Math.round((amount + Number.EPSILON) * FACTOR) / FACTOR;
}

export function sumMoney(amounts: number[]): number {
  const totalCents = amounts.reduce(
    (acc, n) => acc + Math.round((n + Number.EPSILON) * FACTOR),
    0
  );
  return totalCents / FACTOR;
}

export function isValidMoney(amount: number): boolean {
  return Number.isFinite(amount) && amount >= 0 && roundMoney(amount) === amount;
}
