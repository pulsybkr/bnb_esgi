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
    upload.array('images'),
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
            const files = req.files as Express.Multer.File[] || [];
            const body = req.body;

            // Parser les JSON stringifiés
            let amenities: any = null;
            let tags: string[] = [];
            let services: string[] = [];

            if (body.amenities) {
                try {
                    amenities = JSON.parse(body.amenities);
                } catch (e) {
                    amenities = body.amenities;
                }
            }

            if (body.tags) {
                try {
                    tags = JSON.parse(body.tags);
                } catch (e) {
                    tags = Array.isArray(body.tags) ? body.tags : [];
                }
            }

            if (body.services) {
                try {
                    services = JSON.parse(body.services);
                } catch (e) {
                    services = Array.isArray(body.services) ? body.services : [];
                }
            }

            // Parser les informations sur les images (ordre et isMain)
            let imagesInfo: Array<{ index: number; isMain: boolean }> = [];
            if (body.imagesInfo) {
                try {
                    imagesInfo = JSON.parse(body.imagesInfo);
                } catch (e) {
                    // Si le parsing échoue, utiliser l'ordre par défaut
                    imagesInfo = [];
                }
            }

            // Les fichiers sont maintenant sauvegardés sur le disque par multer.diskStorage
            // file.filename contient le nom unique généré par multer
            const photos = files.map((file, index) => {
                // Chercher l'information pour cette image
                const imageInfo = imagesInfo.find(info => info.index === index);
                const isMain = imageInfo?.isMain || (imagesInfo.length === 0 && index === 0);
                
                return {
                    url: `/uploads/logements/${file.filename}`,
                    thumbnailUrl: `/uploads/logements/${file.filename}`, // Pour l'instant, même image (pas de génération de thumbnail)
                    isMain,
                    order: index,
                };
            });

            // Mapper les services du frontend vers les services à créer
            const servicesToCreate = services
                .filter((serviceId: string) => SERVICE_MAP[serviceId])
                .map((serviceId: string) => {
                    const service = SERVICE_MAP[serviceId];
                    return {
                        serviceId,
                        name: service.name,
                        description: service.description,
                        price: service.price,
                        priceType: service.priceType,
                    };
                });

            // Mapping des types depuis le format frontend (anglais) vers le format backend (français)
            const propertyTypeMapping: Record<string, 'maison' | 'appartement' | 'chambre' | 'hotel' | 'villa' | 'studio' | 'loft'> = {
                'house': 'maison',
                'apartment': 'appartement',
                'room': 'chambre',
                'hotel': 'hotel',
                'villa': 'villa',
                'studio': 'studio',
                'loft': 'loft',
                // Support des valeurs françaises aussi (au cas où)
                'maison': 'maison',
                'appartement': 'appartement',
                'chambre': 'chambre',
            };

            const rawType = body.propertyType || body.type;
            const mappedType = propertyTypeMapping[rawType?.toLowerCase()] || rawType;

            // Construire l'objet CreatePropertyData
            const propertyData: CreatePropertyData = {
                title: body.title,
                description: body.description || undefined,
                address: body.address,
                city: body.city,
                country: body.country,
                latitude: body.latitude ? parseFloat(body.latitude) : undefined,
                longitude: body.longitude ? parseFloat(body.longitude) : undefined,
                type: mappedType as 'maison' | 'appartement' | 'chambre' | 'hotel' | 'villa' | 'studio' | 'loft',
                roomCount: parseInt(body.roomCount || body.maxGuests) || 1,
                capacity: parseInt(body.maxGuests || body.capacity) || 1,
                bedrooms: parseInt(body.bedrooms) || 0,
                bathrooms: parseFloat(body.bathrooms) || 0,
                pricePerNight: parseFloat(body.price) || parseFloat(body.pricePerNight) || 0,
                currency: body.currency || 'EUR',
                amenities: amenities,
                tags: tags.length > 0 ? tags : undefined,
                checkIn: body.checkIn || '15:00',
                checkOut: body.checkOut || '11:00',
                services: servicesToCreate.length > 0 ? servicesToCreate : undefined,
                photos: photos.length > 0 ? photos : undefined,
            };

            // Ajouter les fichiers à req pour traitement ultérieur
            (req as any).uploadedFiles = files;
            
            // Remplacer req.body par les données parsées
            req.body = propertyData as any;

            next();
        } catch (error) {
            next(error);
        }
    },
];

