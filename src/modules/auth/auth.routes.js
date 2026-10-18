const { Router } = require('express');
const { validate } = require('../../middleware/validate');
const { auth } = require('../../middleware/auth');
const { loginSchema } = require('./auth.schema');
const { authController } = require('./auth.controller');

const router = Router();

router.post('/login', validate(loginSchema), authController.login);
router.get('/me', auth, authController.me);

module.exports = router;
