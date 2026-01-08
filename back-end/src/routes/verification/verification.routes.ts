import { Router } from 'express';
import verificationController from '../../controllers/verification.controller';
import { authenticateToken as authenticate } from '../../middlewares/auth.middleware';
import { uploadVerificationDocuments, handleUploadError } from '../../middlewares/upload-document.middleware';

const router = Router();

/**
 * @swagger
 * /verification/submit:
 *   post:
 *     summary: Soumettre un document d'identité pour vérification
 *     tags: [Verification]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    '/submit',
    authenticate,
    uploadVerificationDocuments,
    handleUploadError,
    verificationController.submitVerification.bind(verificationController)
);

/**
 * @swagger
 * /verification/status:
 *   get:
 *     summary: Obtenir le statut de vérification actuel
 *     tags: [Verification]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    '/status',
    authenticate,
    verificationController.getStatus.bind(verificationController)
);

/**
 * @swagger
 * /verification/history:
 *   get:
 *     summary: Obtenir l'historique des vérifications
 *     tags: [Verification]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    '/history',
    authenticate,
    verificationController.getHistory.bind(verificationController)
);

export default router;
