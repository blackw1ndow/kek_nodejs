const { errorHandler } = require('../../src/middleware/errorHandler');

function fakeRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe('errorHandler', () => {
  test('бізнес-помилка зі своїм кодом', () => {
    const res = fakeRes();
    const err = Object.assign(new Error('Group is full'), { statusCode: 409, code: 'GROUP_FULL' });
    errorHandler(err, {}, res, () => {});
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: { code: 'GROUP_FULL', message: 'Group is full' } });
  });

  test('невідома помилка -> 500 без витоку тексту', () => {
    const res = fakeRes();
    errorHandler(new Error('db password is 123'), {}, res, () => {});
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  });
});