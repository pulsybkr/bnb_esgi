import { Router } from 'express';
import { DisponibiliteController } from '../../controllers/disponibilite';
import { validateRequest, requireAuth, verifyPropertyOwnership } from '../../middlewares';
import {
    createAvailabilitySchema,
    updateAvailabilitySchema,
    queryAvailabilitiesSchema,
    bulkCreateAvailabilitiesSchema,
} from '../../utils/validation';

const router = Router();

/**
 * @openapi
 * /logements/{id}/availabilities:
 *   post:
 *     tags:
 *       - Disponibilités
 *     summary: Créer une période de disponibilité
 *     description: Permet au propriétaire de créer une période de disponibilité pour son bien
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du logement
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startDate
 *               - endDate
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-02-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-02-28"
 *               status:
 *                 type: string
 *                 enum: [disponible, reserve, bloque]
 *                 default: disponible
 *               customPrice:
 *                 type: number
 *                 example: 60000
 *               note:
 *                 type: string
 *                 example: "Haute saison"
 *     responses:
 *       201:
 *         description: Période créée avec succès
 *       400:
 *         description: Conflit de dates ou données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
router.post(
    '/logements/:id/availabilities',
    requireAuth,
    verifyPropertyOwnership,
    validateRequest(createAvailabilitySchema),
    DisponibiliteController.createAvailability
);

/**
 * @openapi
 * /logements/{id}/availabilities:
 *   get:
 *     tags:
 *       - Disponibilités
 *     summary: Récupérer les disponibilités d'un bien
 *     description: Récupère toutes les périodes de disponibilité (route publique)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du logement
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrer à partir de cette date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrer jusqu'à cette date
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [disponible, reserve, bloque]
 *         description: Filtrer par statut
 *     responses:
 *       200:
 *         description: Liste des disponibilités
 */
router.get('/logements/:id/availabilities', DisponibiliteController.getAvailabilities);

/**
 * @openapi
 * /logements/{id}/available-dates:
 *   get:
 *     tags:
 *       - Disponibilités
 *     summary: Récupérer les dates disponibles
 *     description: Récupère uniquement les dates disponibles dans une plage (route publique)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du logement
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin
 *     responses:
 *       200:
 *         description: Liste des dates disponibles
 */
router.get('/logements/:id/available-dates', DisponibiliteController.getAvailableDates);

/**
 * @openapi
 * /availabilities/{id}:
 *   put:
 *     tags:
 *       - Disponibilités
 *     summary: Mettre à jour une période
 *     description: Permet au propriétaire de modifier une période de disponibilité
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la période
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [disponible, reserve, bloque]
 *               customPrice:
 *                 type: number
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Période mise à jour
 *       400:
 *         description: Conflit de dates
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
router.put(
    '/availabilities/:id',
    requireAuth,
    validateRequest(updateAvailabilitySchema),
    DisponibiliteController.updateAvailability
);

/**
 * @openapi
 * /availabilities/{id}:
 *   delete:
 *     tags:
 *       - Disponibilités
 *     summary: Supprimer une période
 *     description: Permet au propriétaire de supprimer une période (impossible si réservée)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la période
 *     responses:
 *       200:
 *         description: Période supprimée
 *       400:
 *         description: Impossible de supprimer (période réservée)
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
router.delete('/availabilities/:id', requireAuth, DisponibiliteController.deleteAvailability);

/**
 * @openapi
 * /logements/{id}/availabilities/bulk:
 *   post:
 *     tags:
 *       - Disponibilités
 *     summary: Créer plusieurs périodes
 *     description: Permet de créer plusieurs périodes de disponibilité en une seule requête
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du logement
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - periods
 *             properties:
 *               periods:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - startDate
 *                     - endDate
 *                   properties:
 *                     startDate:
 *                       type: string
 *                       format: date
 *                     endDate:
 *                       type: string
 *                       format: date
 *                     status:
 *                       type: string
 *                       enum: [disponible, reserve, bloque]
 *                     customPrice:
 *                       type: number
 *                     note:
 *                       type: string
 *                 example:
 *                   - startDate: "2026-02-01"
 *                     endDate: "2026-02-28"
 *                     status: "disponible"
 *                   - startDate: "2026-03-01"
 *                     endDate: "2026-03-31"
 *                     customPrice: 70000
 *     responses:
 *       201:
 *         description: Périodes créées avec succès
 *       400:
 *         description: Conflit de dates
 */
router.post(
    '/logements/:id/availabilities/bulk',
    requireAuth,
    verifyPropertyOwnership,
    validateRequest(bulkCreateAvailabilitiesSchema),
    DisponibiliteController.bulkCreateAvailabilities
);

export default router;
