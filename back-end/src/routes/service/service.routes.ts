import { Router } from 'express';
import { ServiceController } from '../../controllers/service';
import { requireAuth, verifyPropertyOwnership } from '../../middlewares';

const router = Router();

/**
 * @openapi
 * /logements/{id}/services:
 *   post:
 *     tags:
 *       - Services
 *     summary: Créer un service pour un logement
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/services', requireAuth, verifyPropertyOwnership, ServiceController.createService);

/**
 * @openapi
 * /logements/{id}/services:
 *   get:
 *     tags:
 *       - Services
 *     summary: Récupérer tous les services d'un logement
 */
router.get('/:id/services', ServiceController.getServices);

/**
 * @openapi
 * /logements/{id}/services/{serviceId}:
 *   get:
 *     tags:
 *       - Services
 *     summary: Récupérer un service par ID
 */
router.get('/:id/services/:serviceId', ServiceController.getServiceById);

/**
 * @openapi
 * /logements/{id}/services/{serviceId}:
 *   put:
 *     tags:
 *       - Services
 *     summary: Mettre à jour un service
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id/services/:serviceId', requireAuth, verifyPropertyOwnership, ServiceController.updateService);

/**
 * @openapi
 * /logements/{id}/services/{serviceId}:
 *   delete:
 *     tags:
 *       - Services
 *     summary: Supprimer un service
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id/services/:serviceId', requireAuth, verifyPropertyOwnership, ServiceController.deleteService);

export default router;

