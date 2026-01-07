import { Router } from 'express';
import { PaymentController } from '../../controllers/payment';
import { requireAuth } from '../../middlewares';

const router = Router();

/**
 * @openapi
 * /payments/operators:
 *   get:
 *     tags:
 *       - Paiements
 *     summary: Liste des opérateurs Mobile Money
 *     description: Récupère la liste des opérateurs Mobile Money disponibles
 *     responses:
 *       200:
 *         description: Liste des opérateurs
 */
router.get('/operators', PaymentController.getOperators);

/**
 * @openapi
 * /payments:
 *   post:
 *     tags:
 *       - Paiements
 *     summary: Initier un paiement
 *     description: Initie un paiement par carte ou Mobile Money
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reservationId
 *               - amount
 *               - method
 *             properties:
 *               reservationId:
 *                 type: string
 *               amount:
 *                 type: number
 *               method:
 *                 type: string
 *                 enum: [carte, mobile_money]
 *               mobileOperator:
 *                 type: string
 *                 description: Requis pour mobile_money
 *                 example: orange_money
 *               cardDetails:
 *                 type: object
 *                 properties:
 *                   last4:
 *                     type: string
 *                   brand:
 *                     type: string
 *     responses:
 *       200:
 *         description: Paiement traité
 *       400:
 *         description: Paiement échoué
 */
router.post('/', requireAuth, PaymentController.initiatePayment);

/**
 * @openapi
 * /payments/my:
 *   get:
 *     tags:
 *       - Paiements
 *     summary: Historique de mes paiements
 *     description: Récupère l'historique des paiements de l'utilisateur
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [en_attente, reussi, echec, rembourse, annule]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des paiements
 */
router.get('/my', requireAuth, PaymentController.getMyPayments);

/**
 * @openapi
 * /payments/{paymentId}:
 *   get:
 *     tags:
 *       - Paiements
 *     summary: Statut d'un paiement
 *     description: Récupère le statut détaillé d'un paiement
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails du paiement
 *       404:
 *         description: Paiement non trouvé
 */
router.get('/:paymentId', PaymentController.getPaymentStatus);

/**
 * @openapi
 * /payments/{paymentId}/confirm:
 *   post:
 *     tags:
 *       - Paiements
 *     summary: Confirmer un paiement Mobile Money
 *     description: Confirme un paiement Mobile Money avec le code OTP
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otpCode
 *             properties:
 *               otpCode:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Paiement confirmé
 *       400:
 *         description: Code OTP invalide
 */
router.post('/:paymentId/confirm', requireAuth, PaymentController.confirmPayment);

/**
 * @openapi
 * /payments/{paymentId}/refund:
 *   post:
 *     tags:
 *       - Paiements
 *     summary: Demander un remboursement
 *     description: Demande le remboursement d'un paiement réussi
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Remboursement effectué
 *       400:
 *         description: Remboursement impossible
 */
router.post('/:paymentId/refund', requireAuth, PaymentController.requestRefund);

/**
 * @openapi
 * /payments/reservation/{reservationId}:
 *   get:
 *     tags:
 *       - Paiements
 *     summary: Paiements d'une réservation
 *     description: Récupère tous les paiements liés à une réservation
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des paiements
 */
router.get('/reservation/:reservationId', PaymentController.getReservationPayments);

export default router;
