const { prisma } = require('../../config/prisma');

class AuthRepository {
  constructor(db = prisma) {
    this.db = db;
  }

  async findByEmail(email) {
    return this.db.user.findUnique({
      where: { email },
    });
  }

  async findById(id) {
    return this.db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}

const authRepository = new AuthRepository();

module.exports = { AuthRepository, authRepository };
