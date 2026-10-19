const {
  educatorSalary,
  assistantSalary,
  clubTeacherSalary,
  managerSalary,
} = require('../../../src/domain/salary');

describe('salary (копійки)', () => {
  test.each([
    [0, 0, 2000000],
    [10, 2000000, 2000000],
    [12, 2400000, 2000000],
    [13, 3100000, 2300000],
    [20, 8000000, 4400000],
  ])('n=%i: вихователь %i, помічник %i', (n, educator, assistant) => {
    expect(educatorSalary(n)).toBe(educator);
    expect(assistantSalary(n)).toBe(assistant);
  });

  test.each([21, -1, 2.5, NaN, '10'])('n=%p -> RangeError', (n) => {
    expect(() => educatorSalary(n)).toThrow(RangeError);
    expect(() => assistantSalary(n)).toThrow(RangeError);
  });

  test('викладач гуртка — 40 000 грн, менеджер — 80 000 грн', () => {
    expect(clubTeacherSalary()).toBe(4000000);
    expect(managerSalary()).toBe(8000000);
  });
});
