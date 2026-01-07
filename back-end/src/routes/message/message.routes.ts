import { Router } from 'express';
import { MessageController } from '../../controllers/message';
import { requireAuth } from '../../middlewares';

const router = Router();

/**
 * @openapi
 * /messages:
 *   post:
 *     tags:
 *       - Messages
 *     summary: Envoyer un message
 *     description: Envoie un message à un autre utilisateur, optionnellement lié à une réservation
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
 *                 description: ID du destinataire
 *               reservationId:
 *                 type: string
 *                 description: ID de la réservation (optionnel)
 *               content:
 *                 type: string
 *                 description: Contenu du message
 *               type:
 *                 type: string
 *                 enum: [reservation, support, general]
 *                 default: general
 *     responses:
 *       201:
 *         description: Message envoyé
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Destinataire non trouvé
 */
router.post('/', requireAuth, MessageController.sendMessage);

/**
 * @openapi
 * /messages/conversations:
 *   get:
 *     tags:
 *       - Messages
 *     summary: Liste des conversations
 *     description: Récupère toutes les conversations de l'utilisateur
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
 *     description: Récupère le nombre de messages non lus
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nombre de messages non lus
 */
router.get('/unread-count', requireAuth, MessageController.getUnreadCount);

/**
 * @openapi
 * /messages/reservation/{reservationId}:
 *   get:
 *     tags:
 *       - Messages
 *     summary: Messages d'une réservation
 *     description: Récupère tous les messages liés à une réservation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des messages
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Réservation non trouvée
 */
router.get('/reservation/:reservationId', requireAuth, MessageController.getReservationMessages);

/**
 * @openapi
 * /messages/mark-read:
 *   put:
 *     tags:
 *       - Messages
 *     summary: Marquer des messages comme lus
 *     description: Marque des messages comme lus
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messageIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               reservationId:
 *                 type: string
 *                 description: Marquer tous les messages d'une réservation
 *     responses:
 *       200:
 *         description: Messages marqués comme lus
 */
router.put('/mark-read', requireAuth, MessageController.markAsRead);

export default router;
