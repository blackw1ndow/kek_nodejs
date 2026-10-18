const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { config } = require('../../config');
const { UnauthorizedError } = require('../../errors/AppError');
const { authRepository } = require('./auth.repository');

class AuthService {
  constructor(repository = authRepository) {
    this.repository = repository;
  }

  async login({ email, password }) {
    const user = await this.repository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });

    return {
      token,
      user: payload,
    };
  }

  async me(userId) {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}

const authService = new AuthService();

module.exports = { AuthService, authService };
