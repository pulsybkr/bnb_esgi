import { Router } from 'express';
import notificationController from '../../controllers/notification.controller';
import { authenticateToken as authenticate } from '../../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /notifications/register-token:
 *   post:
 *     summary: Enregistrer un token de notification push
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    '/register-token',
    authenticate,
    notificationController.registerToken.bind(notificationController)
);

/**
 * @swagger
 * /notifications/token/{tokenId}:
 *   delete:
 *     summary: Supprimer un token de notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
    '/token/:tokenId',
    authenticate,
    notificationController.deleteToken.bind(notificationController)
);

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Obtenir l'historique des notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    '/',
    authenticate,
    notificationController.getNotifications.bind(notificationController)
);

/**
 * @swagger
 * /notifications/test:
 *   post:
 *     summary: Envoyer une notification de test
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    '/test',
    authenticate,
    notificationController.sendTestNotification.bind(notificationController)
);

export default router;
