const jwt = require('jsonwebtoken');
const { auth } = require('../../src/middleware/auth');
const { config } = require('../../src/config');
const { UnauthorizedError } = require('../../src/errors/AppError');

describe('auth middleware', () => {
  const validPayload = { id: 1, email: 'admin@kindergarten.ua', role: 'ADMIN' };

  test('успішна автентифікація з валідним Bearer токеном підшиває req.user', () => {
    const token = jwt.sign(validPayload, config.jwtSecret, { expiresIn: '30m' });
    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };
    const next = jest.fn();

    auth(req, {}, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe(validPayload.id);
    expect(req.user.email).toBe(validPayload.email);
    expect(req.user.role).toBe(validPayload.role);
  });

  test('відсутній заголовок authorization -> UnauthorizedError', () => {
    const req = { headers: {} };
    const next = jest.fn();

    auth(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(UnauthorizedError);
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Token not provided');
  });

  test('req.headers undefined -> UnauthorizedError', () => {
    const req = {};
    const next = jest.fn();

    auth(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(UnauthorizedError);
    expect(err.message).toBe('Token not provided');
  });

  test('заголовок не починається з Bearer -> UnauthorizedError', () => {
    const req = {
      headers: { authorization: 'Basic some-base64-creds' },
    };
    const next = jest.fn();

    auth(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(UnauthorizedError);
    expect(err.message).toBe('Token not provided');
  });

  test('Bearer без самого токена (лише пробіли) -> UnauthorizedError', () => {
    const req = {
      headers: { authorization: 'Bearer    ' },
    };
    const next = jest.fn();

    auth(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(UnauthorizedError);
    expect(err.message).toBe('Token not provided');
  });

  test('прострочений токен -> UnauthorizedError', () => {
    const expiredToken = jwt.sign(validPayload, config.jwtSecret, { expiresIn: -1 });
    const req = {
      headers: { authorization: `Bearer ${expiredToken}` },
    };
    const next = jest.fn();

    auth(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(UnauthorizedError);
    expect(err.message).toBe('Invalid or expired token');
  });

  test('токен підписаний іншим секретом -> UnauthorizedError', () => {
    const invalidToken = jwt.sign(validPayload, 'wrong-secret-key');
    const req = {
      headers: { authorization: `Bearer ${invalidToken}` },
    };
    const next = jest.fn();

    auth(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(UnauthorizedError);
    expect(err.message).toBe('Invalid or expired token');
  });

  test('пошкоджений токен -> UnauthorizedError', () => {
    const req = {
      headers: { authorization: 'Bearer completely-invalid-jwt-format' },
    };
    const next = jest.fn();

    auth(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(UnauthorizedError);
    expect(err.message).toBe('Invalid or expired token');
  });
});
