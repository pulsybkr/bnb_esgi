/**
 * Composable pour la gestion des disponibilités
 */

import { ref, computed } from 'vue'
import { DisponibiliteService } from '@/services/disponibilite'
import { ErrorHandler } from '@/utils/api/errorHandler'
import type {
    Disponibilite,
    CreateDisponibiliteData,
    UpdateDisponibiliteData,
    DisponibiliteFilters
} from '@/types/disponibilite'

export function useDisponibilites() {
    const disponibilites = ref<Disponibilite[]>([])
    const currentDisponibilite = ref<Disponibilite | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    /**
     * Charger les disponibilités
     */
    const loadDisponibilites = async (filters?: DisponibiliteFilters): Promise<void> => {
        try {
            isLoading.value = true
            error.value = null

            disponibilites.value = await DisponibiliteService.getDisponibilites(filters)
        } catch (err) {
            error.value = ErrorHandler.getErrorMessage(err)
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Charger les disponibilités d'un logement
     */
    const loadPropertyDisponibilites = async (propertyId: string): Promise<void> => {
        try {
            isLoading.value = true
            error.value = null

            disponibilites.value = await DisponibiliteService.getPropertyDisponibilites(propertyId)
        } catch (err) {
            error.value = ErrorHandler.getErrorMessage(err)
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Charger une disponibilité par ID
     */
    const loadDisponibiliteById = async (id: string): Promise<void> => {
        try {
            isLoading.value = true
            error.value = null

            currentDisponibilite.value = await DisponibiliteService.getDisponibiliteById(id)
        } catch (err) {
            error.value = ErrorHandler.getErrorMessage(err)
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Créer une disponibilité
     */
    const createDisponibilite = async (data: CreateDisponibiliteData): Promise<Disponibilite | null> => {
        try {
            isLoading.value = true
            error.value = null

            const disponibilite = await DisponibiliteService.createDisponibilite(data)
            disponibilites.value.unshift(disponibilite)
            return disponibilite
        } catch (err) {
            error.value = ErrorHandler.getErrorMessage(err)
            return null
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Mettre à jour une disponibilité
     */
    const updateDisponibilite = async (
        id: string,
        data: UpdateDisponibiliteData
    ): Promise<boolean> => {
        try {
            isLoading.value = true
            error.value = null

            const updated = await DisponibiliteService.updateDisponibilite(id, data)

            // Mettre à jour dans la liste
            const index = disponibilites.value.findIndex(d => d.id === id)
            if (index !== -1) {
                disponibilites.value[index] = updated
            }

            // Mettre à jour la disponibilité actuelle
            if (currentDisponibilite.value?.id === id) {
                currentDisponibilite.value = updated
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
     * Supprimer une disponibilité
     */
    const deleteDisponibilite = async (id: string): Promise<boolean> => {
        try {
            isLoading.value = true
            error.value = null

            await DisponibiliteService.deleteDisponibilite(id)

            // Retirer de la liste
            disponibilites.value = disponibilites.value.filter(d => d.id !== id)

            // Réinitialiser la disponibilité actuelle
            if (currentDisponibilite.value?.id === id) {
                currentDisponibilite.value = null
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
        disponibilites: computed(() => disponibilites.value),
        currentDisponibilite: computed(() => currentDisponibilite.value),
        isLoading: computed(() => isLoading.value),
        error: computed(() => error.value),

        // Actions
        loadDisponibilites,
        loadPropertyDisponibilites,
        loadDisponibiliteById,
        createDisponibilite,
        updateDisponibilite,
        deleteDisponibilite,
        clearError
    }
}
