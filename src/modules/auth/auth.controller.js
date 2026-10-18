const { StatusCodes } = require('http-status-codes');
const { authService } = require('./auth.service');

class AuthController {
  constructor(service = authService) {
    this.service = service;
  }

  login = async (req, res) => {
    const result = await this.service.login(req.body);
    res.status(StatusCodes.OK).json(result);
  };

  me = async (req, res) => {
    const user = await this.service.me(req.user.id);
    res.status(StatusCodes.OK).json({ user });
  };
}

const authController = new AuthController();

module.exports = { AuthController, authController };
