import { Router } from 'express';
import { FavoriController } from '../../controllers/favori/favori.controller';
import { requireAuth } from '../../middlewares';

const router = Router();

/**
 * @openapi
 * /favoris:
 *   get:
 *     tags:
 *       - Favoris
 *     summary: Récupérer les favoris de l'utilisateur
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des favoris
 */
router.get('/', requireAuth, FavoriController.getFavorites);

/**
 * @openapi
 * /favoris:
 *   post:
 *     tags:
 *       - Favoris
 *     summary: Ajouter un logement aux favoris
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
 *             properties:
 *               accommodationId:
 *                 type: string
 */
router.post('/', requireAuth, FavoriController.addFavorite);

/**
 * @openapi
 * /favoris/{accommodationId}:
 *   delete:
 *     tags:
 *       - Favoris
 *     summary: Retirer un logement des favoris
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accommodationId
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/:accommodationId', requireAuth, FavoriController.removeFavorite);

export default router;
