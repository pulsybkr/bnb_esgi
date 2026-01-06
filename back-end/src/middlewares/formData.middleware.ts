import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { SERVICE_MAP } from '../data/services';
import { CreatePropertyData } from '../services/logement/logement.service';

// Configuration de multer pour les fichiers en mémoire
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max par fichier
    },
});

/**
 * Middleware pour parser FormData et convertir en format attendu par le service
 */
export const parseAccommodationFormData = [
    upload.array('images'),
    (req: Request, res: Response, next: NextFunction): void => {
        try {
            const files = req.files as Express.Multer.File[];
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

            // Convertir les images en URLs (pour l'instant, on stocke juste les infos du fichier)
            // Dans un vrai projet, il faudrait uploader les fichiers vers S3, Cloudinary, etc.
            const photos = files.map((file, index) => ({
                url: `/uploads/${file.originalname}`, // URL temporaire, à remplacer par un vrai upload
                thumbnailUrl: `/uploads/thumb_${file.originalname}`,
                isMain: index === 0,
                order: index,
                // Stocker le buffer pour l'upload ultérieur si nécessaire
                buffer: file.buffer,
                originalname: file.originalname,
            }));

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

            // Construire l'objet CreatePropertyData
            const propertyData: CreatePropertyData = {
                title: body.title,
                description: body.description || undefined,
                address: body.address,
                city: body.city,
                country: body.country,
                latitude: body.latitude ? parseFloat(body.latitude) : undefined,
                longitude: body.longitude ? parseFloat(body.longitude) : undefined,
                type: body.propertyType || body.type,
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
                photos: photos.length > 0 ? photos.map(({ buffer, originalname, ...photo }) => photo) : undefined,
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

