const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Некоректний формат email'),
  password: z.string().min(6, 'Пароль має містити щонайменше 6 символів'),
});

module.exports = { loginSchema };
