import { Router } from 'express';
import { LogementController } from '../../controllers/logement';
import { validateRequest, requireAuth, verifyPropertyOwnership, requireOwnerRole } from '../../middlewares';
import {
    createPropertySchema,
    updatePropertySchema,
    queryPropertiesSchema,
    addPhotoSchema,
} from '../../utils/validation';

const router = Router();

/**
 * @openapi
 * /logements:
 *   post:
 *     tags:
 *       - Logements
 *     summary: Créer un nouveau bien
 *     description: Permet à un propriétaire ou admin de créer une nouvelle annonce de logement
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - address
 *               - city
 *               - country
 *               - type
 *               - roomCount
 *               - capacity
 *               - pricePerNight
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 200
 *                 example: "Belle villa avec piscine"
 *               description:
 *                 type: string
 *                 minLength: 20
 *                 maxLength: 5000
 *                 example: "Magnifique villa située dans un quartier calme..."
 *               address:
 *                 type: string
 *                 example: "123 Avenue de la République"
 *               city:
 *                 type: string
 *                 example: "Dakar"
 *               country:
 *                 type: string
 *                 example: "Sénégal"
 *               latitude:
 *                 type: number
 *                 example: 14.6928
 *               longitude:
 *                 type: number
 *                 example: -17.4467
 *               type:
 *                 type: string
 *                 enum: [maison, appartement, chambre, hotel]
 *                 example: "maison"
 *               roomCount:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 50
 *                 example: 4
 *               capacity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 example: 6
 *               pricePerNight:
 *                 type: number
 *                 minimum: 0
 *                 example: 50000
 *               currency:
 *                 type: string
 *                 example: "XOF"
 *                 default: "XOF"
 *               amenities:
 *                 type: object
 *                 example: { "wifi": true, "piscine": true, "climatisation": true }
 *               houseRules:
 *                 type: object
 *                 example: { "fumeur": false, "animaux": true }
 *               photos:
 *                 type: array
 *                 description: Photos du bien (optionnel, peut être ajouté lors de la création)
 *                 items:
 *                   type: object
 *                   required:
 *                     - url
 *                   properties:
 *                     url:
 *                       type: string
 *                       format: uri
 *                       example: "https://example.com/photo1.jpg"
 *                     thumbnailUrl:
 *                       type: string
 *                       format: uri
 *                       example: "https://example.com/photo1-thumb.jpg"
 *                     isMain:
 *                       type: boolean
 *                       default: false
 *                       description: Si true, cette photo sera la photo principale
 *                     order:
 *                       type: integer
 *                       default: 0
 *                       description: Ordre d'affichage de la photo
 *                 example:
 *                   - url: "https://example.com/photo1.jpg"
 *                     thumbnailUrl: "https://example.com/photo1-thumb.jpg"
 *                     isMain: true
 *                     order: 0
 *                   - url: "https://example.com/photo2.jpg"
 *                     order: 1
 *     responses:
 *       201:
 *         description: Bien créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Property created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     property:
 *                       type: object
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (utilisateur n'est pas propriétaire)
 */
router.post(
    '/',
    requireAuth,
    requireOwnerRole,
    validateRequest(createPropertySchema),
    LogementController.createProperty
);

/**
 * @openapi
 * /logements:
 *   get:
 *     tags:
 *       - Logements
 *     summary: Récupérer tous les biens
 *     description: Récupère la liste des biens avec filtres et pagination (route publique)
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filtrer par ville
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filtrer par pays
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [maison, appartement, chambre, hotel]
 *         description: Filtrer par type de logement
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Prix minimum par nuit
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Prix maximum par nuit
 *       - in: query
 *         name: minCapacity
 *         schema:
 *           type: integer
 *         description: Capacité minimale
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [actif, suspendu, archive]
 *           default: actif
 *         description: Statut du bien
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Nombre de résultats par page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, pricePerNight, averageRating, title]
 *           default: createdAt
 *         description: Trier par
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Ordre de tri
 *     responses:
 *       200:
 *         description: Liste des biens récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     properties:
 *                       type: array
 *                       items:
 *                         type: object
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 */
router.get('/', LogementController.getAllProperties);

/**
 * @openapi
 * /logements/my:
 *   get:
 *     tags:
 *       - Logements
 *     summary: Récupérer mes biens
 *     description: Récupère tous les biens appartenant à l'utilisateur connecté
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [actif, suspendu, archive]
 *         description: Filtrer par statut
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, pricePerNight, averageRating, title]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Liste des biens récupérée avec succès
 *       401:
 *         description: Non authentifié
 */
router.get('/my', requireAuth, LogementController.getMyProperties);

/**
 * @openapi
 * /logements/my/statistics:
 *   get:
 *     tags:
 *       - Logements
 *     summary: Récupérer mes statistiques
 *     description: Récupère les statistiques des biens de l'utilisateur connecté
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         totalProperties:
 *                           type: integer
 *                           example: 5
 *                         activeProperties:
 *                           type: integer
 *                           example: 4
 *                         totalReservations:
 *                           type: integer
 *                           example: 23
 *                         totalFavorites:
 *                           type: integer
 *                           example: 12
 *                         averageRating:
 *                           type: string
 *                           example: "4.5"
 *       401:
 *         description: Non authentifié
 */
router.get('/my/statistics', requireAuth, LogementController.getMyStatistics);

/**
 * @openapi
 * /logements/{id}:
 *   get:
 *     tags:
 *       - Logements
 *     summary: Récupérer un bien par ID
 *     description: Récupère les détails d'un bien spécifique (route publique)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du bien
 *     responses:
 *       200:
 *         description: Bien récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     property:
 *                       type: object
 *       404:
 *         description: Bien non trouvé
 */
router.get('/:id', LogementController.getPropertyById);

/**
 * @openapi
 * /logements/{id}:
 *   put:
 *     tags:
 *       - Logements
 *     summary: Mettre à jour un bien
 *     description: Permet au propriétaire ou admin de mettre à jour un bien
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du bien
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               country:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [maison, appartement, chambre, hotel]
 *               roomCount:
 *                 type: integer
 *               capacity:
 *                 type: integer
 *               pricePerNight:
 *                 type: number
 *               currency:
 *                 type: string
 *               amenities:
 *                 type: object
 *               houseRules:
 *                 type: object
 *               status:
 *                 type: string
 *                 enum: [actif, suspendu, archive]
 *     responses:
 *       200:
 *         description: Bien mis à jour avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Bien non trouvé
 */
router.put(
    '/:id',
    requireAuth,
    verifyPropertyOwnership,
    validateRequest(updatePropertySchema),
    LogementController.updateProperty
);

/**
 * @openapi
 * /logements/{id}:
 *   delete:
 *     tags:
 *       - Logements
 *     summary: Supprimer un bien
 *     description: Permet au propriétaire ou admin de supprimer un bien (impossible si réservations actives)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du bien
 *     responses:
 *       200:
 *         description: Bien supprimé avec succès
 *       400:
 *         description: Impossible de supprimer (réservations actives)
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Bien non trouvé
 */
router.delete('/:id', requireAuth, verifyPropertyOwnership, LogementController.deleteProperty);

/**
 * @openapi
 * /logements/{id}/photos:
 *   post:
 *     tags:
 *       - Logements
 *     summary: Ajouter une photo à un bien
 *     description: Permet au propriétaire d'ajouter une photo à son bien
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du bien
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/photo.jpg"
 *               thumbnailUrl:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/photo-thumb.jpg"
 *               isMain:
 *                 type: boolean
 *                 default: false
 *               order:
 *                 type: integer
 *                 default: 0
 *     responses:
 *       201:
 *         description: Photo ajoutée avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Bien non trouvé
 */
router.post(
    '/:id/photos',
    requireAuth,
    verifyPropertyOwnership,
    validateRequest(addPhotoSchema),
    LogementController.addPhoto
);

/**
 * @openapi
 * /logements/{id}/photos/{photoId}:
 *   delete:
 *     tags:
 *       - Logements
 *     summary: Supprimer une photo d'un bien
 *     description: Permet au propriétaire de supprimer une photo de son bien
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du bien
 *       - in: path
 *         name: photoId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la photo
 *     responses:
 *       200:
 *         description: Photo supprimée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Photo non trouvée
 */
router.delete('/:id/photos/:photoId', requireAuth, verifyPropertyOwnership, LogementController.deletePhoto);

/**
 * @openapi
 * /logements/{id}/photos/{photoId}/main:
 *   put:
 *     tags:
 *       - Logements
 *     summary: Définir une photo comme photo principale
 *     description: Permet au propriétaire de définir une photo comme photo principale du bien
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du bien
 *       - in: path
 *         name: photoId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la photo
 *     responses:
 *       200:
 *         description: Photo principale mise à jour avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Photo non trouvée
 */
router.put('/:id/photos/:photoId/main', requireAuth, verifyPropertyOwnership, LogementController.setMainPhoto);

export default router;
