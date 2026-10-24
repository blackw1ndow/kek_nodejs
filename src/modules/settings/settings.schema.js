const { z } = require('zod');

const keySchema = z
  .string()
  .trim()
  .min(1, 'Setting key is required')
  .max(100, 'Setting key is too long')
  .regex(/^[A-Za-z0-9_]+$/, 'Key can only contain letters, numbers, and underscores');

// All setting values are non-negative integers (amounts in cents, percentages, limits) or arrays of them
const nonNegativeInt = z
  .number()
  .int('Value must be an integer')
  .nonnegative('Value cannot be negative');

const valueSchema = z.union([
  nonNegativeInt,
  z.array(nonNegativeInt).min(1, 'Array cannot be empty'),
]);

const keyParamsSchema = z.object({
  params: z.object({ key: keySchema }),
});

const updateSettingSchema = z.object({
  params: z.object({ key: keySchema }),
  body: z.object({ value: valueSchema }).strict(),
});

module.exports = { keySchema, valueSchema, keyParamsSchema, updateSettingSchema };