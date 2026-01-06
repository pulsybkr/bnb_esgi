import { Router } from 'express';
import aiController from '../../controllers/ai.controller';
import { requireAuth, requireOwnerRole, validateRequest } from '../../middlewares';
import { generateAiDescriptionSchema } from '../../utils/validation';

const router = Router();

// Route protégée par authentification et rôle propriétaire
router.post(
    '/generate-description',
    requireAuth,
    requireOwnerRole,
    validateRequest(generateAiDescriptionSchema),
    aiController.generateDescription
);

export default router;
