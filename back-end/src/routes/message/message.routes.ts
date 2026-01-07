import { Router } from 'express';
import { MessageController } from '../../controllers/message';
import { validateRequest, requireAuth } from '../../middlewares';
import { sendMessageSchema } from '../../utils/validation/message.validation';

const router = Router();

/**
 * @openapi
 * /messages:
 *   post:
 *     tags:
 *       - Messages
 *     summary: Envoyer un message
 *     description: Permet d'envoyer un message à un autre utilisateur
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - content
 *             properties:
 *               receiverId:
 *                 type: string
 *                 format: uuid
 *                 example: "uuid-du-destinataire"
 *               content:
 *                 type: string
 *                 example: "Bonjour, je suis intéressé par votre logement..."
 *               reservationId:
 *                 type: string
 *                 format: uuid
 *                 example: "uuid-de-la-reservation"
 *               type:
 *                 type: string
 *                 enum: [reservation, support, general]
 *                 default: general
 *     responses:
 *       201:
 *         description: Message envoyé
 *       401:
 *         description: Non authentifié
 */
router.post('/', requireAuth, validateRequest(sendMessageSchema), MessageController.sendMessage);

/**
 * @openapi
 * /messages/conversations:
 *   get:
 *     tags:
 *       - Messages
 *     summary: Liste des conversations
 *     description: Récupère la liste de toutes les conversations de l'utilisateur
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des conversations
 */
router.get('/conversations', requireAuth, MessageController.getConversations);

/**
 * @openapi
 * /messages/unread-count:
 *   get:
 *     tags:
 *       - Messages
 *     summary: Nombre de messages non lus
 *     description: Récupère le nombre total de messages non lus
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nombre de messages non lus
 */
router.get('/unread-count', requireAuth, MessageController.getUnreadCount);

/**
 * @openapi
 * /messages/conversation/{userId}:
 *   get:
 *     tags:
 *       - Messages
 *     summary: Messages d'une conversation
 *     description: Récupère tous les messages échangés avec un utilisateur spécifique
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Liste des messages
 */
router.get('/conversation/:userId', requireAuth, MessageController.getConversation);

/**
 * @openapi
 * /messages/conversation/{userId}/mark-read:
 *   patch:
 *     tags:
 *       - Messages
 *     summary: Marquer une conversation comme lue
 *     description: Marque tous les messages d'une conversation comme lus
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Messages marqués comme lus
 */
router.patch(
    '/conversation/:userId/mark-read',
    requireAuth,
    MessageController.markConversationAsRead
);

/**
 * @openapi
 * /messages/{id}:
 *   get:
 *     tags:
 *       - Messages
 *     summary: Détails d'un message
 *     description: Récupère les détails d'un message spécifique
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du message
 *     responses:
 *       200:
 *         description: Détails du message
 */
router.get('/:id', requireAuth, MessageController.getMessageById);

/**
 * @openapi
 * /messages/{id}/mark-read:
 *   patch:
 *     tags:
 *       - Messages
 *     summary: Marquer un message comme lu
 *     description: Marque un message spécifique comme lu
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du message
 *     responses:
 *       200:
 *         description: Message marqué comme lu
 */
router.patch('/:id/mark-read', requireAuth, MessageController.markAsRead);

export default router;

