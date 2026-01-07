import { Request, Response, NextFunction } from 'express';
import { FavoriService } from '../../services/favori/favori.service';

export class FavoriController {
    /**
     * Get user favorites
     */
    static async getFavorites(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const favorites = await FavoriService.getUserFavorites(userId);

            res.status(200).json({
                success: true,
                data: {
                    favorites
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Add to favorites
     */
    static async addFavorite(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const { accommodationId } = req.body;

            if (!accommodationId) {
                return res.status(400).json({
                    success: false,
                    message: 'accommodationId is required'
                });
            }

            const favorite = await FavoriService.addFavorite(userId, accommodationId);

            res.status(201).json({
                success: true,
                message: 'Added to favorites',
                data: {
                    favorite
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Remove from favorites
     */
    static async removeFavorite(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const { accommodationId } = req.params;

            await FavoriService.removeFavorite(userId, accommodationId);

            res.status(200).json({
                success: true,
                message: 'Removed from favorites'
            });
        } catch (error) {
            next(error);
        }
    }
}
