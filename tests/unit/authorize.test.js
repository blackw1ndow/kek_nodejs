const { authorize } = require('../../src/middleware/authorize');
const { UnauthorizedError, ForbiddenError } = require('../../src/errors/AppError');

describe('authorize middleware', () => {
  test('викликає next(), якщо користувач має дозволену роль', () => {
    const middleware = authorize('ADMIN', 'MANAGER');
    const req = { user: { id: 1, role: 'ADMIN' } };
    const next = jest.fn();

    middleware(req, {}, next);

    expect(next).toHaveBeenCalledWith();
  });

  test('передає ForbiddenError (403), якщо користувач має недозволену роль', () => {
    const middleware = authorize('ADMIN', 'MANAGER');
    const req = { user: { id: 2, role: 'PARENT' } };
    const next = jest.fn();

    middleware(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(ForbiddenError);
    expect(err.statusCode).toBe(403);
    expect(err.message).toBe('Access forbidden: insufficient rights');
  });

  test('передає UnauthorizedError (401), якщо req.user відсутній', () => {
    const middleware = authorize('ADMIN');
    const req = {};
    const next = jest.fn();

    middleware(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(UnauthorizedError);
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Authentication required');
  });

  test('якщо список дозволених ролей порожній, пропускає будь-якого автентифікованого користувача', () => {
    const middleware = authorize();
    const req = { user: { id: 3, role: 'TEACHER' } };
    const next = jest.fn();

    middleware(req, {}, next);

    expect(next).toHaveBeenCalledWith();
  });
});
