import { Router } from 'express';
import { SearchController } from '../../controllers/search/search.controller';

const router = Router();

/**
 * @openapi
 * /search/suggestions:
 *   get:
 *     tags:
 *       - Recherche
 *     summary: Obtenir des suggestions d'auto-complétion
 *     description: Fournit des suggestions pour villes, pays ou tags
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [city, country, tag]
 *         description: Type de suggestion (ville, pays ou tag)
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Terme de recherche
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 50
 *         description: Nombre maximum de suggestions
 *     responses:
 *       200:
 *         description: Suggestions récupérées avec succès
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
 *                     type:
 *                       type: string
 *                     query:
 *                       type: string
 *                     suggestions:
 *                       type: array
 *                       items:
 *                         oneOf:
 *                           - type: string
 *                           - type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               label:
 *                                 type: string
 *                               category:
 *                                 type: string
 *       400:
 *         description: Paramètres invalides
 */
router.get('/suggestions', SearchController.getSuggestions);

/**
 * @openapi
 * /search/tags:
 *   get:
 *     tags:
 *       - Recherche
 *     summary: Obtenir tous les tags et catégories
 *     description: Récupère tous les tags disponibles groupés par catégorie
 *     responses:
 *       200:
 *         description: Tags récupérés avec succès
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
 *                     categories:
 *                       type: object
 *                       description: Tags groupés par catégorie
 *                     allTags:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           label:
 *                             type: string
 *                           category:
 *                             type: string
 */
router.get('/tags', SearchController.getTags);

export default router;

