import { Request, Response, NextFunction } from 'express';

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     AdminAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT token avec rôle admin requis
 */

/**
 * Middleware pour vérifier que l'utilisateur est un administrateur
 */
export const requireAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // @ts-ignore - req.user est ajouté par le middleware d'authentification
        const user = req.user;

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Authentification requise',
            });
            return;
        }

        if (user.userType !== 'admin') {
            res.status(403).json({
                success: false,
                message: 'Accès réservé aux administrateurs',
            });
            return;
        }

        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la vérification des permissions',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

/**
 * Middleware pour vérifier que l'utilisateur est admin ou propriétaire
 */
export const requireAdminOrOwner = (ownerIdField: string = 'userId') => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // @ts-ignore
            const user = req.user;

            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentification requise',
                });
                return;
            }

            // Si admin, autoriser
            if (user.userType === 'admin') {
                next();
                return;
            }

            // Sinon, vérifier que c'est le propriétaire
            const ownerId = req.params[ownerIdField] || req.body[ownerIdField];

            if (user.id !== ownerId) {
                res.status(403).json({
                    success: false,
                    message: 'Accès non autorisé',
                });
                return;
            }

            next();
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la vérification des permissions',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    };
};
