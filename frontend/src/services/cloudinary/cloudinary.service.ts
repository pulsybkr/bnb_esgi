/**
 * Service pour gérer l'upload d'images vers Cloudinary
 */

export interface CloudinaryUploadResponse {
    public_id: string
    secure_url: string
    url: string
    thumbnail_url?: string
    width: number
    height: number
    format: string
    resource_type: string
    created_at: string
    bytes: number
}

export interface CloudinaryConfig {
    cloudName: string
    uploadPreset: string
}

export interface UploadProgress {
    loaded: number
    total: number
    percentage: number
}

export class CloudinaryService {
    private static config: CloudinaryConfig = {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || ''
    }

    /**
     * Vérifie si la configuration Cloudinary est valide
     */
    static isConfigured(): boolean {
        return !!(this.config.cloudName && this.config.uploadPreset)
    }

    /**
     * Upload une image vers Cloudinary
     * @param file - Fichier image à uploader
     * @param onProgress - Callback pour suivre la progression
     * @returns Promise avec la réponse Cloudinary
     */
    static async uploadImage(
        file: File,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<CloudinaryUploadResponse> {
        if (!this.isConfigured()) {
            throw new Error('Cloudinary is not configured. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your environment variables.')
        }

        // Validation du fichier
        if (!file.type.startsWith('image/')) {
            throw new Error('Le fichier doit être une image')
        }

        // Limite de taille : 10MB
        const maxSize = 10 * 1024 * 1024
        if (file.size > maxSize) {
            throw new Error('La taille de l\'image ne doit pas dépasser 10MB')
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', this.config.uploadPreset)
        formData.append('folder', 'bnb-properties') // Organiser les uploads dans un dossier

        const uploadUrl = `https://api.cloudinary.com/v1_1/${this.config.cloudName}/image/upload`

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()

            // Suivi de la progression
            if (onProgress) {
                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        onProgress({
                            loaded: event.loaded,
                            total: event.total,
                            percentage: Math.round((event.loaded / event.total) * 100)
                        })
                    }
                })
            }

            // Gestion de la réponse
            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    try {
                        const response = JSON.parse(xhr.responseText)
                        resolve(response)
                    } catch (error) {
                        reject(new Error('Erreur lors du parsing de la réponse Cloudinary'))
                    }
                } else {
                    reject(new Error(`Erreur lors de l'upload: ${xhr.statusText}`))
                }
            })

            // Gestion des erreurs
            xhr.addEventListener('error', () => {
                reject(new Error('Erreur réseau lors de l\'upload'))
            })

            xhr.addEventListener('abort', () => {
                reject(new Error('Upload annulé'))
            })

            // Envoi de la requête
            xhr.open('POST', uploadUrl)
            xhr.send(formData)
        })
    }

    /**
     * Upload plusieurs images en parallèle
     * @param files - Liste de fichiers à uploader
     * @param onProgress - Callback pour suivre la progression globale
     * @returns Promise avec toutes les réponses Cloudinary
     */
    static async uploadMultipleImages(
        files: File[],
        onProgress?: (completed: number, total: number) => void
    ): Promise<CloudinaryUploadResponse[]> {
        const total = files.length
        let completed = 0

        const uploadPromises = files.map(async (file) => {
            try {
                const response = await this.uploadImage(file)
                completed++
                if (onProgress) {
                    onProgress(completed, total)
                }
                return response
            } catch (error) {
                completed++
                if (onProgress) {
                    onProgress(completed, total)
                }
                throw error
            }
        })

        return Promise.all(uploadPromises)
    }

    /**
     * Génère une URL optimisée pour une image Cloudinary
     * @param publicId - ID public de l'image
     * @param transformations - Transformations à appliquer
     * @returns URL optimisée
     */
    static getOptimizedUrl(
        publicId: string,
        transformations?: {
            width?: number
            height?: number
            crop?: 'fill' | 'fit' | 'scale' | 'crop'
            quality?: 'auto' | number
            format?: 'auto' | 'jpg' | 'png' | 'webp'
        }
    ): string {
        if (!this.config.cloudName) {
            return ''
        }

        const baseUrl = `https://res.cloudinary.com/${this.config.cloudName}/image/upload`

        const transformParts: string[] = []

        if (transformations?.width) transformParts.push(`w_${transformations.width}`)
        if (transformations?.height) transformParts.push(`h_${transformations.height}`)
        if (transformations?.crop) transformParts.push(`c_${transformations.crop}`)
        if (transformations?.quality) transformParts.push(`q_${transformations.quality}`)
        if (transformations?.format) transformParts.push(`f_${transformations.format}`)

        const transformString = transformParts.length > 0 ? transformParts.join(',') + '/' : ''

        return `${baseUrl}/${transformString}${publicId}`
    }

    /**
     * Génère une URL de thumbnail
     * @param publicId - ID public de l'image
     * @returns URL du thumbnail
     */
    static getThumbnailUrl(publicId: string): string {
        return this.getOptimizedUrl(publicId, {
            width: 400,
            height: 300,
            crop: 'fill',
            quality: 'auto',
            format: 'auto'
        })
    }

    /**
     * Supprime une image de Cloudinary (nécessite l'API backend)
     * Note: La suppression depuis le frontend n'est pas sécurisée
     * Cette méthode devrait être appelée via le backend
     */
    static async deleteImage(publicId: string): Promise<void> {
        // Cette opération doit être effectuée côté backend pour des raisons de sécurité
        console.warn('Image deletion should be handled by the backend')
        throw new Error('Image deletion must be performed through the backend API')
    }
}
