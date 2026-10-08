const { StatusCodes } = require('http-status-codes');
const { errorHandler } = require('../../src/middleware/errorHandler');
const { ErrorCodes } = require('../../src/errors/errorCodes');

function fakeRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe('errorHandler', () => {
  test('бізнес-помилка зі своїм кодом', () => {
    const res = fakeRes();
    const err = Object.assign(new Error('Group is full'), {
      statusCode: StatusCodes.CONFLICT,
      code: 'GROUP_FULL',
    });
    errorHandler(err, {}, res, () => {});
    expect(res.status).toHaveBeenCalledWith(StatusCodes.CONFLICT);
    expect(res.json).toHaveBeenCalledWith({ error: { code: 'GROUP_FULL', message: 'Group is full' } });
  });

  test('невідома помилка -> 500 без витоку тексту', () => {
    const res = fakeRes();
    errorHandler(new Error('db password is 123'), {}, res, () => {});
    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: ErrorCodes.INTERNAL_ERROR, message: 'Internal Server Error' },
    });
  });
});