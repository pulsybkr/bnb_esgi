import { Router } from 'express';
import { PricingController } from '../../controllers/pricing';
import { requireAuth, verifyPropertyOwnership } from '../../middlewares';

const router = Router();

/**
 * @openapi
 * /logements/{id}/pricing:
 *   post:
 *     tags:
 *       - Pricing
 *     summary: Créer ou mettre à jour la configuration de tarification
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/pricing', requireAuth, verifyPropertyOwnership, PricingController.createOrUpdateConfig);

/**
 * @openapi
 * /logements/{id}/pricing:
 *   get:
 *     tags:
 *       - Pricing
 *     summary: Récupérer la configuration de tarification
 */
router.get('/:id/pricing', PricingController.getConfig);

/**
 * @openapi
 * /logements/{id}/pricing/rules:
 *   post:
 *     tags:
 *       - Pricing
 *     summary: Ajouter une règle de tarification
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/pricing/rules', requireAuth, verifyPropertyOwnership, PricingController.addRule);

/**
 * @openapi
 * /logements/{id}/pricing/rules:
 *   get:
 *     tags:
 *       - Pricing
 *     summary: Récupérer toutes les règles de tarification
 */
router.get('/:id/pricing/rules', PricingController.getRules);

/**
 * @openapi
 * /logements/{id}/pricing/rules/{ruleId}:
 *   put:
 *     tags:
 *       - Pricing
 *     summary: Mettre à jour une règle de tarification
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id/pricing/rules/:ruleId', requireAuth, verifyPropertyOwnership, PricingController.updateRule);

/**
 * @openapi
 * /logements/{id}/pricing/rules/{ruleId}:
 *   delete:
 *     tags:
 *       - Pricing
 *     summary: Supprimer une règle de tarification
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id/pricing/rules/:ruleId', requireAuth, verifyPropertyOwnership, PricingController.deleteRule);

export default router;

