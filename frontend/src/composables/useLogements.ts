/**
 * Composable pour la gestion des logements
 */

import { ref, computed } from 'vue'
import { LogementService } from '@/services/logement'
import { ErrorHandler } from '@/utils/api/errorHandler'
import type {
    Logement,
    CreatePropertyData,
    UpdatePropertyData,
    PropertyFilters,
    AddPhotoData,
    PropertyStatistics
} from '@/types/logement'

export function useLogements() {
    const properties = ref<Logement[]>([])
    const currentProperty = ref<Logement | null>(null)
    const statistics = ref<PropertyStatistics | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const pagination = ref({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0
    })

    /**
     * Charger tous les logements
     */
    const loadProperties = async (filters?: PropertyFilters): Promise<void> => {
        try {
            isLoading.value = true
            error.value = null

            const response = await LogementService.getAllProperties(filters)
            properties.value = response.properties
            pagination.value = {
                total: response.total,
                page: response.page,
                limit: response.limit,
                totalPages: response.totalPages
            }
        } catch (err) {
            error.value = ErrorHandler.getErrorMessage(err)
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Charger un logement par ID
     */
    const loadPropertyById = async (id: string): Promise<void> => {
        try {
            isLoading.value = true
            error.value = null

            currentProperty.value = await LogementService.getPropertyById(id)
        } catch (err) {
            error.value = ErrorHandler.getErrorMessage(err)
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Charger mes logements
     */
    const loadMyProperties = async (filters?: Partial<PropertyFilters>): Promise<void> => {
        try {
            isLoading.value = true
            error.value = null

            properties.value = await LogementService.getMyProperties(filters)
        } catch (err) {
            error.value = ErrorHandler.getErrorMessage(err)
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Charger les statistiques
     */
    const loadStatistics = async (): Promise<void> => {
        try {
            isLoading.value = true
            error.value = null

            statistics.value = await LogementService.getMyStatistics()
        } catch (err) {
            error.value = ErrorHandler.getErrorMessage(err)
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Créer un logement
     */
    const createProperty = async (data: CreatePropertyData): Promise<Logement | null> => {
        try {
            isLoading.value = true
            error.value = null

            const property = await LogementService.createProperty(data)
            properties.value.unshift(property)
            return property
        } catch (err) {
            error.value = ErrorHandler.getErrorMessage(err)
            return null
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Mettre à jour un logement
     */
    const updateProperty = async (id: string, data: UpdatePropertyData): Promise<boolean> => {
        try {
            isLoading.value = true
            error.value = null

            const updated = await LogementService.updateProperty(id, data)

            // Mettre à jour dans la liste
            const index = properties.value.findIndex(p => p.id === id)
            if (index !== -1) {
                properties.value[index] = updated
            }

            // Mettre à jour le logement actuel si c'est le même
            if (currentProperty.value?.id === id) {
                currentProperty.value = updated
            }

            return true
        } catch (err) {
            error.value = ErrorHandler.getErrorMessage(err)
            return false
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Supprimer un logement
     */
    const deleteProperty = async (id: string): Promise<boolean> => {
        try {
            isLoading.value = true
            error.value = null

            await LogementService.deleteProperty(id)

            // Retirer de la liste
            properties.value = properties.value.filter(p => p.id !== id)

            // Réinitialiser le logement actuel si c'est le même
            if (currentProperty.value?.id === id) {
                currentProperty.value = null
            }

            return true
        } catch (err) {
            error.value = ErrorHandler.getErrorMessage(err)
            return false
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Ajouter une photo
     */
    const addPhoto = async (propertyId: string, data: AddPhotoData): Promise<boolean> => {
        try {
            isLoading.value = true
            error.value = null

            const photo = await LogementService.addPhoto(propertyId, data)

            // Ajouter la photo au logement actuel
            if (currentProperty.value?.id === propertyId) {
                currentProperty.value.photos.push(photo)
            }

            return true
        } catch (err) {
            error.value = ErrorHandler.getErrorMessage(err)
            return false
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Supprimer une photo
     */
    const deletePhoto = async (propertyId: string, photoId: string): Promise<boolean> => {
        try {
            isLoading.value = true
            error.value = null

            await LogementService.deletePhoto(propertyId, photoId)

            // Retirer la photo du logement actuel
            if (currentProperty.value?.id === propertyId) {
                currentProperty.value.photos = currentProperty.value.photos.filter(p => p.id !== photoId)
            }

            return true
        } catch (err) {
            error.value = ErrorHandler.getErrorMessage(err)
            return false
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Définir une photo comme principale
     */
    const setMainPhoto = async (propertyId: string, photoId: string): Promise<boolean> => {
        try {
            isLoading.value = true
            error.value = null

            await LogementService.setMainPhoto(propertyId, photoId)

            // Mettre à jour les photos du logement actuel
            if (currentProperty.value?.id === propertyId) {
                currentProperty.value.photos = currentProperty.value.photos.map(p => ({
                    ...p,
                    isMain: p.id === photoId
                }))
            }

            return true
        } catch (err) {
            error.value = ErrorHandler.getErrorMessage(err)
            return false
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Effacer l'erreur
     */
    const clearError = () => {
        error.value = null
    }

    return {
        // État
        properties: computed(() => properties.value),
        currentProperty: computed(() => currentProperty.value),
        statistics: computed(() => statistics.value),
        pagination: computed(() => pagination.value),
        isLoading: computed(() => isLoading.value),
        error: computed(() => error.value),

        // Actions
        loadProperties,
        loadPropertyById,
        loadMyProperties,
        loadStatistics,
        createProperty,
        updateProperty,
        deleteProperty,
        addPhoto,
        deletePhoto,
        setMainPhoto,
        clearError
    }
}
