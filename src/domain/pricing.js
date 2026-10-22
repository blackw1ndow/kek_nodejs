const { BadRequestError } = require('../errors/AppError');

// Ціни для батьків, всі ціни в копійках
// Множимо до ділення, щоб не мати пройобів в float (замість * 0.88 — * 88 / 100).
const TUITION_MONTHLY = 1500000;
const ALLOWED_DISCOUNTS = Object.freeze([0, 10, 20, 30]); // відсотки
const MEAL_BASE_PER_DAY = 30000; // 300 грн для 2-річних
const MEAL_STEP_PER_YEAR = 10000; // +100 грн за кожен наступний рік
const MIN_AGE = 2;
const MAX_AGE = 5;
const WORKING_DAYS_PER_MONTH = 21;
const WORKING_DAYS_PER_YEAR = 252;
const MONTHS_PER_YEAR = 12;
const YEARLY_TUITION_DISCOUNT_PERCENT = 12; // знижка 12% на навчання при оплаті за рік вперед (не діє на харчування)
const PERCENT_BASE = 100;

function assertDiscount(discountPercent) {
  if (!ALLOWED_DISCOUNTS.includes(discountPercent)) {
    throw new BadRequestError(
      `Discount must be one of ${ALLOWED_DISCOUNTS.join(', ')}: ${discountPercent}`,
    );
  }
}

function assertAge(age) {
  if (!Number.isInteger(age) || age < MIN_AGE || age > MAX_AGE) {
    throw new BadRequestError(`Age must be an integer from ${MIN_AGE} to ${MAX_AGE}: ${age}`);
  }
}

function assertDays(days) {
  if (!Number.isInteger(days) || days < 0) {
    throw new BadRequestError(`Working days must be a non-negative integer: ${days}`);
  }
}

const applyPercentDiscount = (amount, percent) =>
  Math.round((amount * (PERCENT_BASE - percent)) / PERCENT_BASE);

/** Навчання за місяць зі знижкою 0/10/20/30% */
function tuitionMonthly(discountPercent) {
  assertDiscount(discountPercent);
  return applyPercentDiscount(TUITION_MONTHLY, discountPercent);
}

/** Харчування за день */
function mealPerDay(age) {
  assertAge(age);
  return MEAL_BASE_PER_DAY + MEAL_STEP_PER_YEAR * (age - MIN_AGE);
}

/** Харчування за місяць */
function mealMonthly(age, workingDays = WORKING_DAYS_PER_MONTH) {
  assertDays(workingDays);
  return mealPerDay(age) * workingDays;
}

/** До оплати за місяць з навчанням і харчуванням */
function monthlyTotal(age, discountPercent) {
  return tuitionMonthly(discountPercent) + mealMonthly(age);
}

/** До оплати за рік (знижка 12% на навчання при оплаті на рік наперед; пільги на їжу не діють) */
function yearlyTotal(age, discountPercent) {
  const tuition = applyPercentDiscount(
    tuitionMonthly(discountPercent) * MONTHS_PER_YEAR,
    YEARLY_TUITION_DISCOUNT_PERCENT,
  );
  const meals = mealPerDay(age) * WORKING_DAYS_PER_YEAR;
  return tuition + meals;
}

module.exports = {
  tuitionMonthly,
  mealPerDay,
  mealMonthly,
  monthlyTotal,
  yearlyTotal,
  ALLOWED_DISCOUNTS,
  WORKING_DAYS_PER_MONTH,
};
