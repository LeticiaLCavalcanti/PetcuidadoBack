/**
 * Datas trafegam pela API no formato ISO `YYYY-MM-DD` e são gravadas como
 * `Date` no banco. Interpretamos sempre em UTC: as datas aqui são civis
 * (nascimento, dia da vacina), sem hora, e passar pelo fuso local faria
 * `2015-03-15` virar `14/03` para quem está a oeste de Greenwich.
 */
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseISODate(value) {
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;

  if (typeof value !== "string") return null;

  const match = ISO_DATE.exec(value.trim());
  if (!match) return null;

  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  // Rejeita datas que "transbordam", como 31/02.
  const isReal =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  return isReal ? date : null;
}
