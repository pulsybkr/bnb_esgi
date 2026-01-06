import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

// Configuration de multer pour les fichiers en mémoire
export const uploadMultiple = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max par fichier
        files: 20, // Maximum 20 fichiers
    },
    fileFilter: (req, file, cb) => {
        // Vérifier que c'est une image
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    },
});

/**
 * Middleware pour upload multiple d'images
 */
export const uploadPhotosMiddleware = [
    uploadMultiple.array('images', 20),
    (req: Request, res: Response, next: NextFunction): void => {
        const files = req.files as Express.Multer.File[];
        (req as any).uploadedFiles = files;
        next();
    },
];

