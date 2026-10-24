const SEPTEMBER = 8; // Months in Date are 0-indexed (January = 0, September = 8)

function startOfUtcDay(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/** Adds months with clamping to the last day of the month (e.g., Jan 31 + 1 month = Feb 28/29) */
function addMonthsUtc(date, months) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + months;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, Math.min(date.getUTCDate(), lastDay)));
}

/** Academic year starts September 1st: October 2026 -> 2026, July 2027 -> still 2026 */
function academicYearOf(now) {
  return now.getUTCMonth() >= SEPTEMBER ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
}

/** 'YYYY-MM-DD' or null */
function toIsoDate(date) {
  return date ? date.toISOString().slice(0, 10) : null;
}

module.exports = { startOfUtcDay, addMonthsUtc, academicYearOf, toIsoDate };