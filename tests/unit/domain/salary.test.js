const {
  educatorSalary,
  assistantSalary,
  clubTeacherSalary,
  managerSalary,
} = require('../../../src/domain/salary');
const { BadRequestError } = require('../../../src/errors/AppError');

describe('salary (копійки)', () => {
  test.each([
    [0, 0, 2000000],
    [10, 2000000, 2000000],
    [12, 2400000, 2000000],
    [13, 2900000, 2300000],
    [20, 6400000, 4400000],
  ])('n=%i: вихователь %i, помічник %i', (n, educator, assistant) => {
    expect(educatorSalary(n)).toBe(educator);
    expect(assistantSalary(n)).toBe(assistant);
  });

  test.each([21, -1, 2.5, NaN, '10'])('n=%p -> BadRequestError', (n) => {
    expect(() => educatorSalary(n)).toThrow(BadRequestError);
    expect(() => assistantSalary(n)).toThrow(BadRequestError);
  });

  test('викладач гуртка — 40 000 грн, менеджер — 80 000 грн', () => {
    expect(clubTeacherSalary()).toBe(4000000);
    expect(managerSalary()).toBe(8000000);
  });
});
