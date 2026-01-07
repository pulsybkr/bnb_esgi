import { Router } from 'express';
import { ReservationController } from '../../controllers/reservation';
import {
    validateRequest,
    requireAuth,
    verifyReservationAccess,
    verifyPropertyOwnerForReservation,
    verifyPropertyOwnership,
} from '../../middlewares';
import {
    createReservationSchema,
    cancelReservationSchema,
    queryReservationsSchema,
} from '../../utils/validation';

const router = Router();

/**
 * @openapi
 * /reservations:
 *   post:
 *     tags:
 *       - Réservations
 *     summary: Créer une demande de réservation
 *     description: Permet à un locataire de créer une demande de réservation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accommodationId
 *               - startDate
 *               - endDate
 *               - guestCount
 *             properties:
 *               accommodationId:
 *                 type: string
 *                 example: "uuid-du-logement"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-03-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-03-07"
 *               guestCount:
 *                 type: integer
 *                 minimum: 1
 *                 example: 2
 *               tenantMessage:
 *                 type: string
 *                 example: "Bonjour, je souhaiterais réserver votre bien..."
 *     responses:
 *       201:
 *         description: Demande de réservation créée
 *       400:
 *         description: Dates non disponibles ou données invalides
 *       401:
 *         description: Non authentifié
 */
router.post(
    '/',
    requireAuth,
    validateRequest(createReservationSchema),
    ReservationController.createReservation
);

/**
 * @openapi
 * /reservations/my:
 *   get:
 *     tags:
 *       - Réservations
 *     summary: Mes réservations (locataire)
 *     description: Récupère toutes mes réservations en tant que locataire
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [en_attente, confirmee, annulee, en_cours, terminee]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, startDate, endDate, totalAmount]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Liste des réservations
 */
router.get('/my', requireAuth, ReservationController.getMyReservations);

/**
 * @openapi
 * /reservations/owner:
 *   get:
 *     tags:
 *       - Réservations
 *     summary: Réservations de mes biens (propriétaire)
 *     description: Récupère toutes les réservations pour mes biens
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [en_attente, confirmee, annulee, en_cours, terminee]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, startDate, endDate, totalAmount]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Liste des réservations
 */
router.get('/owner', requireAuth, ReservationController.getOwnerReservations);

/**
 * @openapi
 * /reservations/owner/statistics:
 *   get:
 *     tags:
 *       - Réservations
 *     summary: Statistiques propriétaire
 *     description: Récupère les statistiques de réservation pour le propriétaire
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         totalReservations:
 *                           type: integer
 *                         pendingReservations:
 *                           type: integer
 *                         confirmedReservations:
 *                           type: integer
 *                         completedReservations:
 *                           type: integer
 *                         cancelledReservations:
 *                           type: integer
 *                         totalRevenue:
 *                           type: string
 */
router.get('/owner/statistics', requireAuth, ReservationController.getOwnerStatistics);

/**
 * @openapi
 * /logements/{id}/reservations:
 *   get:
 *     tags:
 *       - Réservations
 *     summary: Réservations d'un bien
 *     description: Récupère toutes les réservations pour un bien spécifique (propriétaire uniquement)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du logement
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [en_attente, confirmee, annulee, en_cours, terminee]
 *     responses:
 *       200:
 *         description: Liste des réservations
 */
router.get(
    '/logements/:id/reservations',
    requireAuth,
    verifyPropertyOwnership,
    ReservationController.getPropertyReservations
);

/**
 * @openapi
 * /reservations/{id}:
 *   get:
 *     tags:
 *       - Réservations
 *     summary: Détails d'une réservation
 *     description: Récupère les détails d'une réservation (locataire ou propriétaire)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la réservation
 *     responses:
 *       200:
 *         description: Détails de la réservation
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Réservation non trouvée
 */
router.get('/:id', requireAuth, verifyReservationAccess, ReservationController.getReservationById);

/**
 * @openapi
 * /reservations/{id}/accept:
 *   put:
 *     tags:
 *       - Réservations
 *     summary: Accepter une réservation
 *     description: Permet au propriétaire d'accepter une demande de réservation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la réservation
 *     responses:
 *       200:
 *         description: Réservation acceptée (disponibilité auto-bloquée)
 *       400:
 *         description: Statut invalide pour acceptation
 *       403:
 *         description: Seul le propriétaire peut accepter
 *       404:
 *         description: Réservation non trouvée
 */
router.put(
    '/:id/accept',
    requireAuth,
    verifyPropertyOwnerForReservation,
    ReservationController.acceptReservation
);

/**
 * @openapi
 * /reservations/{id}/reject:
 *   put:
 *     tags:
 *       - Réservations
 *     summary: Refuser une réservation
 *     description: Permet au propriétaire de refuser une demande de réservation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la réservation
 *     responses:
 *       200:
 *         description: Réservation refusée
 *       400:
 *         description: Statut invalide pour refus
 *       403:
 *         description: Seul le propriétaire peut refuser
 *       404:
 *         description: Réservation non trouvée
 */
router.put(
    '/:id/reject',
    requireAuth,
    verifyPropertyOwnerForReservation,
    ReservationController.rejectReservation
);

/**
 * @openapi
 * /reservations/{id}/cancel:
 *   put:
 *     tags:
 *       - Réservations
 *     summary: Annuler une réservation
 *     description: Permet au locataire ou propriétaire d'annuler une réservation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la réservation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cancellationReason
 *             properties:
 *               cancellationReason:
 *                 type: string
 *                 minLength: 10
 *                 example: "Changement de plans, je ne peux plus venir"
 *     responses:
 *       200:
 *         description: Réservation annulée (disponibilité libérée si confirmée)
 *       400:
 *         description: Impossible d'annuler (déjà annulée ou terminée)
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Réservation non trouvée
 */
router.put(
    '/:id/cancel',
    requireAuth,
    verifyReservationAccess,
    validateRequest(cancelReservationSchema),
    ReservationController.cancelReservation
);

/**
 * @openapi
 * /reservations/{id}/price:
 *   put:
 *     tags:
 *       - Réservations
 *     summary: Mettre à jour le prix négocié
 *     description: Permet de modifier le prix par nuit négocié pour une réservation en attente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la réservation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPrice
 *             properties:
 *               newPrice:
 *                 type: number
 *                 minimum: 1
 *                 example: 25000
 *     responses:
 *       200:
 *         description: Prix mis à jour
 *       400:
 *         description: Prix invalide ou réservation non en attente
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Réservation non trouvée
 */
router.put(
    '/:id/price',
    requireAuth,
    verifyReservationAccess,
    ReservationController.updateNegotiatedPrice
);

export default router;
