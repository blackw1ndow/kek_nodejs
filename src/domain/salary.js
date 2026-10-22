const { BadRequestError } = require('../errors/AppError');

// Всі суми в копійках. За кожну дитину, яка виходить поріг, +до зарплати (едукатору і асістенту)
// Якшо в вихователя більше 12 людей, додатково 3к, 2к за дитину, інше фікса
const EDUCATOR_PER_CHILD = 200000; // за кожну дитину
const EDUCATOR_EXTRA_PER_CHILD = 300000;
const ASSISTANT_BASE = 2000000;
const ASSISTANT_EXTRA_PER_CHILD = 300000;
const EXTRA_CHILDREN_THRESHOLD = 12;
const MIN_GROUP_SIZE = 0;
const MAX_GROUP_SIZE = 20;
const CLUB_TEACHER_SALARY = 4000000;
const MANAGER_SALARY = 8000000;

function assertGroupSize(childrenCount) {
  if (
    !Number.isInteger(childrenCount) ||
    childrenCount < MIN_GROUP_SIZE ||
    childrenCount > MAX_GROUP_SIZE
  ) {
    throw new BadRequestError(
      `Children count must be an integer from ${MIN_GROUP_SIZE} to ${MAX_GROUP_SIZE}: ${childrenCount}`,
    );
  }
}

const extraChildren = (childrenCount) => Math.max(0, childrenCount - EXTRA_CHILDREN_THRESHOLD);

function educatorSalary(childrenCount) {
  assertGroupSize(childrenCount);
  return (
    EDUCATOR_PER_CHILD * childrenCount + EDUCATOR_EXTRA_PER_CHILD * extraChildren(childrenCount)
  );
}

function assistantSalary(childrenCount) {
  assertGroupSize(childrenCount);
  return ASSISTANT_BASE + ASSISTANT_EXTRA_PER_CHILD * extraChildren(childrenCount);
}

function clubTeacherSalary() {
  return CLUB_TEACHER_SALARY;
}

function managerSalary() {
  return MANAGER_SALARY;
}

module.exports = {
  educatorSalary,
  assistantSalary,
  clubTeacherSalary,
  managerSalary,
  EXTRA_CHILDREN_THRESHOLD,
  MAX_GROUP_SIZE,
};
