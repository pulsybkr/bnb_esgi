import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Créer le dossier de destination s'il n'existe pas
const uploadDir = 'uploads/verifications';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration du stockage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // @ts-ignore
        const userId = req.user?.id || 'unknown';
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const fieldName = file.fieldname;
        cb(null, `${userId}_${fieldName}_${timestamp}${ext}`);
    },
});

// Filtre pour n'accepter que certains types de fichiers
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'application/pdf',
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Type de fichier non autorisé. Formats acceptés: JPEG, PNG, WEBP, PDF'));
    }
};

// Configuration de multer pour les documents de vérification
export const uploadVerificationDocuments = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
    },
}).fields([
    { name: 'documentFile', maxCount: 1 },
    { name: 'selfieFile', maxCount: 1 },
]);

// Middleware pour gérer les erreurs d'upload
export const handleUploadError = (err: any, req: any, res: any, next: any) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'Fichier trop volumineux. Taille maximale: 10MB',
            });
        }
        return res.status(400).json({
            success: false,
            message: `Erreur d'upload: ${err.message}`,
        });
    } else if (err) {
        return res.status(400).json({
            success: false,
            message: err.message || 'Erreur lors de l\'upload du fichier',
        });
    }
    next();
};
