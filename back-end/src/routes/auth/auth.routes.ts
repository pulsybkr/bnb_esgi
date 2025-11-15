import { Router } from 'express';
import { AuthController } from '../../controllers/auth';
import { validateRequest, checkNotAlreadyAuthenticated } from '../../middlewares';
import { requireAuth } from '../../middlewares/auth.middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../../utils/validation';

const router = Router();

router.post('/register', checkNotAlreadyAuthenticated, validateRequest(registerSchema), AuthController.register);
router.post('/login', checkNotAlreadyAuthenticated, validateRequest(loginSchema), AuthController.login);
router.post('/refresh', validateRequest(refreshTokenSchema), AuthController.refreshToken);
router.post('/password-reset/request', validateRequest(requestPasswordResetSchema), AuthController.requestPasswordReset);
router.post('/password-reset/reset', validateRequest(resetPasswordSchema), AuthController.resetPassword);
router.post('/verify-email', validateRequest(verifyEmailSchema), AuthController.verifyEmail);

// Routes protégées
router.post('/logout', requireAuth, AuthController.logout);
router.get('/profile', requireAuth, AuthController.getProfile);
router.put('/password', requireAuth, validateRequest(changePasswordSchema), AuthController.changePassword);
router.get('/check', requireAuth, AuthController.checkAuth);

export default router;

