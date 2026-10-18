const { z } = require('zod');
const { StatusCodes } = require('http-status-codes');
const { validate } = require('../../src/middleware/validate');
const { errorHandler } = require('../../src/middleware/errorHandler');
const { ErrorCodes } = require('../../src/errors/errorCodes');

function fakeRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe('validate middleware', () => {
  describe('direct body schema', () => {
    const bodySchema = z.object({
      email: z.string().email().toLowerCase(),
      age: z.coerce.number(),
    });

    test('успішна валідація оновлює req.body та викликає next()', async () => {
      const middleware = validate(bodySchema);
      const req = {
        body: { email: 'TEST@EXAMPLE.COM', age: '25' },
      };
      const next = jest.fn();

      await middleware(req, {}, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.body).toEqual({ email: 'test@example.com', age: 25 });
    });

    test('помилка валідації передає ZodError у next(err)', async () => {
      const middleware = validate(bodySchema);
      const req = {
        body: { email: 'invalid-email', age: 'not-a-number' },
      };
      const next = jest.fn();

      await middleware(req, {}, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err.name).toBe('ZodError');
      expect(err.issues.length).toBeGreaterThan(0);
    });
  });

  describe('composite schema (body, query, params)', () => {
    const fullSchema = z.object({
      body: z.object({
        name: z.string().min(2),
      }),
      query: z.object({
        month: z.string().regex(/^\d{4}-\d{2}$/),
      }),
      params: z.object({
        id: z.coerce.number().positive(),
      }),
    });

    test('успішна валідація оновлює body, query, params', async () => {
      const middleware = validate(fullSchema);
      const req = {
        body: { name: '  Оленка  '.trim() },
        query: { month: '2026-10' },
        params: { id: '15' },
      };
      const next = jest.fn();

      await middleware(req, {}, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.body).toEqual({ name: 'Оленка' });
      expect(req.query).toEqual({ month: '2026-10' });
      expect(req.params).toEqual({ id: 15 });
    });

    test('помилка у query передає ZodError у next(err)', async () => {
      const middleware = validate(fullSchema);
      const req = {
        body: { name: 'Оленка' },
        query: { month: 'bad-month' },
        params: { id: '15' },
      };
      const next = jest.fn();

      await middleware(req, {}, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err.name).toBe('ZodError');
      expect(err.issues[0].path).toEqual(['query', 'month']);
    });

    test('часткова схема запиту (лише body) не зачіпає query та params', async () => {
      const bodyOnlySchema = z.object({
        body: z.object({
          action: z.string(),
        }),
      });

      const middleware = validate(bodyOnlySchema);
      const req = {
        body: { action: 'test' },
        query: { filter: 'all' },
        params: { id: '42' },
      };
      const next = jest.fn();

      await middleware(req, {}, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.body).toEqual({ action: 'test' });
      expect(req.query).toEqual({ filter: 'all' });
      expect(req.params).toEqual({ id: '42' });
    });

    test('часткова схема запиту (лише query) не зачіпає body та params', async () => {
      const queryOnlySchema = z.object({
        query: z.object({
          role: z.enum(['ADMIN', 'MANAGER']),
        }),
      });

      const middleware = validate(queryOnlySchema);
      const req = {
        body: { keep: 'me' },
        query: { role: 'ADMIN' },
        params: { id: '123' },
      };
      const next = jest.fn();

      await middleware(req, {}, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.body).toEqual({ keep: 'me' });
      expect(req.params).toEqual({ id: '123' });
      expect(req.query).toEqual({ role: 'ADMIN' });
    });
  });

  describe('non-object or primitive schema', () => {
    test('валідація схеми без властивості shape валідує req.body', async () => {
      const stringSchema = z.string();
      const middleware = validate(stringSchema);
      const req = { body: 'valid string' };
      const next = jest.fn();

      await middleware(req, {}, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.body).toBe('valid string');
    });

    test('schema without shape з невалідними даними передає ZodError', async () => {
      const stringSchema = z.string();
      const middleware = validate(stringSchema);
      const req = { body: 12345 };
      const next = jest.fn();

      await middleware(req, {}, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err.name).toBe('ZodError');
    });
  });

  describe('зв\'язка validate + errorHandler', () => {
    test('помилка з validate автоматично перетворюється errorHandler у 400', async () => {
      const schema = z.object({
        email: z.string().email('Некоректний email'),
      });
      const middleware = validate(schema);
      const req = { body: { email: 'not-an-email' } };
      let capturedError = null;

      await middleware(req, {}, (err) => {
        capturedError = err;
      });

      expect(capturedError).not.toBeNull();

      const res = fakeRes();
      errorHandler(capturedError, req, res, () => {});

      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Validation failed',
          details: [
            { path: 'email', message: 'Некоректний email' },
          ],
        },
      });
    });
  });
});

