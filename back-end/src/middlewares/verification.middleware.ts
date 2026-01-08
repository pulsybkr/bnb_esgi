import { Request, Response, NextFunction } from 'express';

/**
 * Middleware pour vérifier que l'utilisateur a une identité vérifiée
 */
export const requireVerifiedIdentity = async (
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

        if (!user.isVerified) {
            res.status(403).json({
                success: false,
                message: 'Vérification d\'identité requise pour accéder à cette ressource',
                code: 'IDENTITY_VERIFICATION_REQUIRED',
            });
            return;
        }

        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la vérification de l\'identité',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

/**
 * Middleware pour vérifier le niveau de vérification minimum requis
 */
export const requireVerificationLevel = (minLevel: number) => {
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

            if (user.verificationLevel < minLevel) {
                res.status(403).json({
                    success: false,
                    message: `Niveau de vérification ${minLevel} requis`,
                    currentLevel: user.verificationLevel,
                    requiredLevel: minLevel,
                });
                return;
            }

            next();
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la vérification du niveau',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    };
};
