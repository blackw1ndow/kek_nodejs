const {
  tuitionMonthly,
  mealPerDay,
  mealMonthly,
  monthlyTotal,
  yearlyTotal,
  ALLOWED_DISCOUNTS,
} = require('../../../src/domain/pricing');

describe('tuitionMonthly (копійки)', () => {
  test.each([
    [0, 1500000],
    [10, 1350000],
    [20, 1200000],
    [30, 1050000],
  ])('знижка %i%% -> %i', (discount, expected) => {
    expect(tuitionMonthly(discount)).toBe(expected);
  });

  test.each([15, 40, -10, '20', undefined])('знижка %p -> RangeError', (discount) => {
    expect(() => tuitionMonthly(discount)).toThrow(RangeError);
  });
});

describe('mealPerDay (копійки)', () => {
  test.each([
    [2, 30000],
    [3, 40000],
    [4, 50000],
    [5, 60000],
  ])('%i роки -> %i', (age, expected) => {
    expect(mealPerDay(age)).toBe(expected);
  });

  test.each([1, 6, 3.5, '4'])('вік %p -> RangeError', (age) => {
    expect(() => mealPerDay(age)).toThrow(RangeError);
  });
});

describe('mealMonthly', () => {
  test('за замовчуванням 21 робочий день', () => {
    expect(mealMonthly(4)).toBe(1050000);
  });

  test('можна передати іншу кількість днів', () => {
    expect(mealMonthly(2, 20)).toBe(600000);
    expect(mealMonthly(2, 0)).toBe(0);
  });

  test.each([-1, 2.5])('днів %p -> RangeError', (days) => {
    expect(() => mealMonthly(4, days)).toThrow(RangeError);
  });

  test.each(ALLOWED_DISCOUNTS)('знижка %i%% не впливає на харчування', (discount) => {
    expect(monthlyTotal(4, discount) - tuitionMonthly(discount)).toBe(mealMonthly(4));
  });
});

describe('кейс із ТЗ: 4 роки, знижка 20%', () => {
  test('за місяць — 22 500 грн', () => {
    expect(monthlyTotal(4, 20)).toBe(2250000);
  });

  test('за рік — 254 880 грн', () => {
    expect(yearlyTotal(4, 20)).toBe(25488000);
  });
});

describe('yearlyTotal', () => {
  test.each([
    [2, 0, 24652800],
    [5, 30, 25905600],
  ])('%i роки, знижка %i%% -> %i', (age, discount, expected) => {
    expect(yearlyTotal(age, discount)).toBe(expected);
  });

  test('невалідні дані -> RangeError', () => {
    expect(() => yearlyTotal(6, 0)).toThrow(RangeError);
    expect(() => yearlyTotal(4, 15)).toThrow(RangeError);
  });
});
