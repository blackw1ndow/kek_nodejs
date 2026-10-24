const { BadRequestError, ConflictError, NotFoundError } = require('../../errors/AppError');
const { ageOnSeptemberFirst } = require('../../domain/age');
const { tuitionMonthly, mealMonthly, monthlyTotal, yearlyTotal } = require('../../domain/pricing');
const { billingRepository } = require('./billing.repository');
const { startOfUtcDay, addMonthsUtc, academicYearOf, toIsoDate } = require('./billing.dates');

const CURRENCY = 'UAH'; // All amounts are stored in kopiykas
const MONTHS_BY_PLAN = Object.freeze({ MONTHLY: 1, YEARLY: 12 });

class BillingService {
  constructor(repository = billingRepository) {
    this.repository = repository;
  }

  /** Admin and Manager can access any child; a Parent can only access their own (returns "not found" for others) */
  async loadAccessibleChild(user, childId) {
    const child = await this.repository.findChildWithParents(childId);
    const isOwnChild = child?.parents.some((link) => link.parent.userId === user.id);
    if (!child || (user.role === 'PARENT' && !isOwnChild)) {
      throw new NotFoundError('Child not found');
    }
    return child;
  }

  calculate(child, now) {
    const age = ageOnSeptemberFirst(child.birthDate, academicYearOf(now));
    const discount = child.discountPercent;
    return {
      age,
      monthly: {
        tuition: tuitionMonthly(discount),
        meals: mealMonthly(age),
        total: monthlyTotal(age, discount),
      },
      yearly: { total: yearlyTotal(age, discount) },
    };
  }

  amountFor(plan, bill) {
    return plan === 'YEARLY' ? bill.yearly.total : bill.monthly.total;
  }

  /** Calculates billing details and payment due date for a child */
  async getChildBilling(user, childId, now = new Date()) {
    const child = await this.loadAccessibleChild(user, childId);
    const bill = this.calculate(child, now);
    const today = startOfUtcDay(now);

    return {
      childId: child.id,
      fullName: child.fullName,
      age: bill.age,
      discountPercent: child.discountPercent,
      paymentPlan: child.paymentPlan,
      currency: CURRENCY,
      monthly: bill.monthly,
      yearly: bill.yearly,
      amountDue: this.amountFor(child.paymentPlan, bill),
      paidUntil: toIsoDate(child.paidUntil),
      isPaid: Boolean(child.paidUntil) && child.paidUntil >= today,
    };
  }

  /** Records a tuition payment: extends paidUntil by 1 month or 12 months */
  async payForChild(user, childId, plan, now = new Date()) {
    const child = await this.loadAccessibleChild(user, childId);
    if (!child.isActive) {
      throw new BadRequestError('Child is not active');
    }

    const chosenPlan = plan ?? child.paymentPlan;
    const amount = this.amountFor(chosenPlan, this.calculate(child, now));

    const today = startOfUtcDay(now);
    const base = child.paidUntil && child.paidUntil > today ? child.paidUntil : today;
    const paidUntil = addMonthsUtc(base, MONTHS_BY_PLAN[chosenPlan]);

    const updated = await this.repository.updatePaidUntil(child.id, child.paidUntil, paidUntil);
    if (updated === 0) {
      throw new ConflictError('Payment status was changed by another request, please retry');
    }

    return {
      childId: child.id,
      plan: chosenPlan,
      amount,
      currency: CURRENCY,
      paidUntil: toIsoDate(paidUntil),
    };
  }
}

const billingService = new BillingService();

module.exports = { BillingService, billingService, CURRENCY };