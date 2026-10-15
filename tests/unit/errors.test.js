const { StatusCodes } = require('http-status-codes');
const {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} = require('../../src/errors/AppError');
const { ErrorCodes } = require('../../src/errors/errorCodes');

describe('AppError hierarchy', () => {
  test('AppError default values', () => {
    const err = new AppError('Something broke');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
    expect(err.message).toBe('Something broke');
    expect(err.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(err.code).toBe(ErrorCodes.INTERNAL_ERROR);
    expect(err.details).toBeUndefined();
    expect(err.name).toBe('AppError');
  });

  test('AppError with custom status, code and details', () => {
    const details = [{ field: 'email', reason: 'invalid' }];
    const err = new AppError('Custom error', 418, 'I_AM_A_TEAPOT', details);
    expect(err.statusCode).toBe(418);
    expect(err.code).toBe('I_AM_A_TEAPOT');
    expect(err.details).toEqual(details);
  });

  test('BadRequestError', () => {
    const err = new BadRequestError('Invalid input');
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(StatusCodes.BAD_REQUEST);
    expect(err.code).toBe(ErrorCodes.BAD_REQUEST);
    expect(err.message).toBe('Invalid input');

    const defaultErr = new BadRequestError();
    expect(defaultErr.message).toBe('Bad Request');
  });

  test('BadRequestError with custom code and details', () => {
    const details = { info: 'test' };
    const err = new BadRequestError('Custom bad request', 'CUSTOM_CODE', details);
    expect(err.code).toBe('CUSTOM_CODE');
    expect(err.details).toEqual(details);
  });

  test('UnauthorizedError', () => {
    const err = new UnauthorizedError('Invalid token');
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(StatusCodes.UNAUTHORIZED);
    expect(err.code).toBe(ErrorCodes.UNAUTHORIZED);
    expect(err.message).toBe('Invalid token');

    const defaultErr = new UnauthorizedError();
    expect(defaultErr.message).toBe('Unauthorized');
  });

  test('ForbiddenError', () => {
    const err = new ForbiddenError('Not allowed');
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(StatusCodes.FORBIDDEN);
    expect(err.code).toBe(ErrorCodes.FORBIDDEN);
    expect(err.message).toBe('Not allowed');

    const defaultErr = new ForbiddenError();
    expect(defaultErr.message).toBe('Forbidden');
  });

  test('NotFoundError', () => {
    const err = new NotFoundError('Child not found');
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(StatusCodes.NOT_FOUND);
    expect(err.code).toBe(ErrorCodes.NOT_FOUND);
    expect(err.message).toBe('Child not found');

    const defaultErr = new NotFoundError();
    expect(defaultErr.message).toBe('Not Found');
  });

  test('ConflictError', () => {
    const err = new ConflictError('Room occupied');
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(StatusCodes.CONFLICT);
    expect(err.code).toBe(ErrorCodes.CONFLICT);
    expect(err.message).toBe('Room occupied');

    const defaultErr = new ConflictError();
    expect(defaultErr.message).toBe('Conflict');
  });
});
