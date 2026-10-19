const { StatusCodes } = require('http-status-codes');
const { notFound } = require('../../src/middleware/notFound');
const { ErrorCodes } = require('../../src/errors/errorCodes');

describe('notFound middleware', () => {
  test('повертає 404 та ErrorCodes.NOT_FOUND', () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    const req = {};

    notFound(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: ErrorCodes.NOT_FOUND,
        message: 'Route not found',
      },
    });
  });
});
