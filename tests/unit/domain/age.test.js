const { ageOnSeptemberFirst } = require('../../../src/domain/age');
const { BadRequestError } = require('../../../src/errors/AppError');

describe('ageOnSeptemberFirst', () => {
  test.each([
    ['2022-09-01', 2026, 4], // день народження саме 1 вересня
    ['2022-09-02', 2026, 3], // день після — ще не виповнилось
    ['2022-03-15', 2026, 4], // народився навесні
    ['2022-12-31', 2026, 3], // народився наприкінці року
    ['2020-02-29', 2026, 6], // високосний рік
    ['2026-09-01', 2026, 0], // народився в сам день
  ])('%s на 1.09.%i -> %i', (birthDate, year, expected) => {
    expect(ageOnSeptemberFirst(birthDate, year)).toBe(expected);
  });

  test('приймає Date так само, як рядок', () => {
    expect(ageOnSeptemberFirst(new Date(Date.UTC(2022, 2, 15)), 2026)).toBe(4);
  });

  test.each([
    ['дата пізніше 1 вересня', '2026-09-02', 2026],
    ['некоректна дата', 'not-a-date', 2026],
    ['дробовий рік', '2022-01-01', 2026.5],
  ])('%s -> BadRequestError', (_name, birthDate, year) => {
    expect(() => ageOnSeptemberFirst(birthDate, year)).toThrow(BadRequestError);
  });
});
