import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ============================================
// Configuration pour upload multiple d'images (logements)
// ============================================
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
 * Middleware pour upload multiple d'images (logements)
 */
export const uploadPhotosMiddleware = [
    uploadMultiple.array('images', 20),
    (req: Request, res: Response, next: NextFunction): void => {
        const files = req.files as Express.Multer.File[];
        (req as any).uploadedFiles = files;
        next();
    },
];

// ============================================
// Configuration pour upload photo de profil
// ============================================
const profileStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/profiles');
    
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Générer un nom de fichier unique
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    const filename = `profile-${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

// Filtre pour valider le type de fichier
const profileFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Types MIME autorisés pour les images
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé. Utilisez JPEG, PNG ou WebP.'));
  }
};

// Configuration de multer pour photo de profil
export const uploadProfilePhoto = multer({
  storage: profileStorage,
  fileFilter: profileFileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB par défaut
  }
});

// Middleware pour gérer les erreurs d'upload
export const handleUploadError = (err: any, req: Request, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Fichier trop volumineux. Taille maximale: 5MB',
        type: 'file_size_error'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Erreur d'upload: ${err.message}`,
      type: 'upload_error'
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Erreur lors de l\'upload du fichier',
      type: 'upload_error'
    });
  }
  
  next();
};
