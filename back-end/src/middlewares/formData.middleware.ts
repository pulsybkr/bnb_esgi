import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { SERVICE_MAP } from '../data/services';
import { CreatePropertyData } from '../services/logement/logement.service';

// Configuration du dossier d'upload pour les logements
function ensureUploadsDir(): string {
    const uploadsDir = path.join(__dirname, '../../uploads/logements');

    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    return uploadsDir;
}

// Configuration de multer pour sauvegarder les fichiers sur le disque
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadsDir = ensureUploadsDir();
            cb(null, uploadsDir);
        },
        filename: (req, file, cb) => {
            // Générer un nom de fichier unique avec timestamp et ID aléatoire
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
            const ext = path.extname(file.originalname);
            // Nettoyer le nom de fichier pour éviter les caractères problématiques
            const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\s+/g, '_');
            const filename = `${uniqueSuffix}-${sanitizedName}`;
            cb(null, filename);
        },
    }),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max par fichier
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
 * Middleware pour parser FormData et convertir en format attendu par le service
 */
export const parseAccommodationFormData = [
    (req: Request, res: Response, next: NextFunction) => {
        // Si c'est du JSON, on laisse multer tranquille
        if (req.is('json')) {
            return next();
        }
        // Sinon on utilise multer
        upload.array('images')(req, res, next);
    },
    // Middleware de gestion d'erreur pour multer
    (err: any, req: Request, res: Response, next: NextFunction) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        success: false,
                        message: 'Fichier trop volumineux. Taille maximale: 10MB',
                        type: 'file_size_error'
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: `Erreur d'upload: ${err.message}`,
                    type: 'upload_error'
                });
            }
            return res.status(400).json({
                success: false,
                message: err.message || 'Erreur lors de l\'upload du fichier',
                type: 'upload_error'
            });
        }
        next();
    },
    (req: Request, res: Response, next: NextFunction): void => {
        try {
            const isJson = req.is('json');
            const files = req.files as Express.Multer.File[] || [];
            const body = req.body;

            // Si c'est du JSON, on a déjà les données dans le format presque final
            // On fait juste quelques mappings de sécurité si nécessaire

            // Parser les JSON stringifiés (seulement si c'est du FormData, car en JSON ils sont déjà des objets)
            let amenities = body.amenities;
            let tags = body.tags || [];
            let services = body.services || [];

            if (!isJson) {
                if (typeof body.amenities === 'string') {
                    try { amenities = JSON.parse(body.amenities); } catch (e) { }
                }
                if (typeof body.tags === 'string') {
                    try { tags = JSON.parse(body.tags); } catch (e) { tags = []; }
                }
                if (typeof body.services === 'string') {
                    try { services = JSON.parse(body.services); } catch (e) { services = []; }
                }
            }

            // Parser les informations sur les images (ordre et isMain) pour FormData
            let photos = [];

            if (isJson && body.photos) {
                // Si JSON, on utilise les photos envoyées (ex: Cloudinary)
                photos = body.photos;
            } else if (files.length > 0) {
                // Si FormData, on utilise les fichiers uploadés
                let imagesInfo: Array<{ index: number; isMain: boolean }> = [];
                if (body.imagesInfo) {
                    try {
                        imagesInfo = typeof body.imagesInfo === 'string' ? JSON.parse(body.imagesInfo) : body.imagesInfo;
                    } catch (e) {
                        imagesInfo = [];
                    }
                }

                photos = files.map((file, index) => {
                    const imageInfo = imagesInfo.find(info => info.index === index);
                    const isMain = imageInfo?.isMain || (imagesInfo.length === 0 && index === 0);

                    return {
                        url: `/uploads/logements/${file.filename}`,
                        thumbnailUrl: `/uploads/logements/${file.filename}`,
                        isMain,
                        order: index,
                    };
                });
            }

            // Mapper les services
            let servicesToCreate: CreatePropertyData['services'] = [];
            if (Array.isArray(services)) {
                servicesToCreate = services
                    .map((s: any) => {
                        const serviceId = typeof s === 'string' ? s : (s.id || s.serviceId);
                        if (!serviceId || !SERVICE_MAP[serviceId]) return null;

                        const service = SERVICE_MAP[serviceId];
                        return {
                            serviceId,
                            name: service.name,
                            description: service.description,
                            price: service.price,
                            priceType: service.priceType as any,
                        };
                    })
                    .filter((s): s is NonNullable<typeof s> => s !== null);
            }

            // Mapping des types
            const propertyTypeMapping: Record<string, string> = {
                'house': 'maison',
                'apartment': 'appartement',
                'room': 'chambre',
                'hotel': 'hotel',
                'villa': 'villa',
                'studio': 'studio',
                'loft': 'loft',
                'maison': 'maison',
                'appartement': 'appartement',
                'chambre': 'chambre',
            };

            const rawType = body.propertyType || body.type;
            const mappedType = propertyTypeMapping[rawType?.toLowerCase()] || rawType;

            // Construire l'objet final sans écraser les données si elles sont déjà au bon format
            const propertyData: Partial<CreatePropertyData> & Record<string, any> = {
                ...body, // On garde tout le reste (description, etc.)
                type: mappedType as any,
                roomCount: parseInt(body.roomCount) || parseInt(body.maxGuests) || 1,
                capacity: parseInt(body.capacity) || parseInt(body.maxGuests) || 1,
                bedrooms: parseInt(body.bedrooms) || 0,
                bathrooms: parseFloat(body.bathrooms) || 0,
                pricePerNight: parseFloat(body.pricePerNight) || parseFloat(body.price) || 0,
                amenities: amenities,
                tags: Array.isArray(tags) && tags.length > 0 ? tags : undefined,
                services: servicesToCreate.length > 0 ? servicesToCreate : undefined,
                photos: photos.length > 0 ? photos : body.photos,
            };

            // Nettoyage des champs alias pour éviter les doublons ou conflits Prisma
            delete propertyData.propertyType;
            delete propertyData.maxGuests;
            delete propertyData.price;
            delete propertyData.imagesInfo;

            req.body = propertyData;
            (req as any).uploadedFiles = files;

            next();
        } catch (error) {
            next(error);
        }
    },
];

