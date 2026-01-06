/**
 * Composable pour gérer la création de propriété avec wizard multi-étapes
 * État partagé (singleton) pour que tous les composants utilisent les mêmes données
 */

import { ref, computed, reactive } from 'vue'
import { LogementService } from '@/services/logement'
import { CloudinaryService, type CloudinaryUploadResponse } from '@/services/cloudinary'
import type { CreatePropertyData, PropertyType } from '@/types/logement'

export enum PropertyCreationStep {
    BASIC_INFO = 1,
    LOCATION = 2,
    DETAILS = 3,
    PRICING = 4,
    PHOTOS = 5,
    REVIEW = 6
}

export interface PropertyFormData {
    title: string
    description: string
    type: PropertyType | ''
    address: string
    city: string
    country: string
    latitude?: number
    longitude?: number
    roomCount: number
    capacity: number
    amenities: Record<string, boolean>
    houseRules: Record<string, boolean>
    pricePerNight: number
    currency: string
    photos: CloudinaryUploadResponse[]
    mainPhotoIndex: number
}

export interface StepValidation {
    isValid: boolean
    errors: Record<string, string>
}

// ===== ÉTAT GLOBAL PARTAGÉ (SINGLETON) =====
const currentStep = ref<PropertyCreationStep>(PropertyCreationStep.BASIC_INFO)
const isSubmitting = ref(false)
const error = ref<string | null>(null)
const isUploading = ref(false)
const uploadProgress = ref(0)

const formData = reactive<PropertyFormData>({
    title: '',
    description: '',
    type: '',
    address: '',
    city: '',
    country: '',
    roomCount: 1,
    capacity: 1,
    amenities: {},
    houseRules: {},
    pricePerNight: 0,
    currency: 'XOF',
    photos: [],
    mainPhotoIndex: 0
})

// ===== COMPOSABLE =====
export function usePropertyCreation() {
    // Fonctions de validation
    function validateBasicInfo(): StepValidation {
        const errors: Record<string, string> = {}
        if (!formData.title || formData.title.trim().length < 5) {
            errors.title = 'Le titre doit contenir au moins 5 caractères'
        }
        if (formData.title.length > 200) {
            errors.title = 'Le titre ne doit pas dépasser 200 caractères'
        }
        if (!formData.description || formData.description.trim().length < 20) {
            errors.description = 'La description doit contenir au moins 20 caractères'
        }
        if (formData.description.length > 5000) {
            errors.description = 'La description ne doit pas dépasser 5000 caractères'
        }
        if (!formData.type) {
            errors.type = 'Veuillez sélectionner un type de propriété'
        }
        return { isValid: Object.keys(errors).length === 0, errors }
    }

    function validateLocation(): StepValidation {
        const errors: Record<string, string> = {}
        if (!formData.address || formData.address.trim().length < 5) {
            errors.address = 'L\'adresse doit contenir au moins 5 caractères'
        }
        if (!formData.city || formData.city.trim().length < 2) {
            errors.city = 'La ville doit contenir au moins 2 caractères'
        }
        if (!formData.country || formData.country.trim().length < 2) {
            errors.country = 'Le pays doit contenir au moins 2 caractères'
        }
        return { isValid: Object.keys(errors).length === 0, errors }
    }

    function validateDetails(): StepValidation {
        const errors: Record<string, string> = {}
        if (formData.roomCount < 1 || formData.roomCount > 50) {
            errors.roomCount = 'Le nombre de pièces doit être entre 1 et 50'
        }
        if (formData.capacity < 1 || formData.capacity > 100) {
            errors.capacity = 'La capacité doit être entre 1 et 100'
        }
        return { isValid: Object.keys(errors).length === 0, errors }
    }

    function validatePricing(): StepValidation {
        const errors: Record<string, string> = {}
        if (formData.pricePerNight <= 0) {
            errors.pricePerNight = 'Le prix doit être supérieur à 0'
        }
        return { isValid: Object.keys(errors).length === 0, errors }
    }

    function validatePhotos(): StepValidation {
        const errors: Record<string, string> = {}
        if (formData.photos.length < 5) {
            errors.photos = 'Vous devez ajouter au moins 5 photos'
        }
        if (formData.photos.length > 20) {
            errors.photos = 'Vous ne pouvez pas ajouter plus de 20 photos'
        }
        return { isValid: Object.keys(errors).length === 0, errors }
    }

    const stepValidations = computed<Record<PropertyCreationStep, StepValidation>>(() => ({
        [PropertyCreationStep.BASIC_INFO]: validateBasicInfo(),
        [PropertyCreationStep.LOCATION]: validateLocation(),
        [PropertyCreationStep.DETAILS]: validateDetails(),
        [PropertyCreationStep.PRICING]: validatePricing(),
        [PropertyCreationStep.PHOTOS]: validatePhotos(),
        [PropertyCreationStep.REVIEW]: { isValid: true, errors: {} }
    }))

    const isCurrentStepValid = computed(() => stepValidations.value[currentStep.value].isValid)
    const canGoNext = computed(() => currentStep.value < PropertyCreationStep.REVIEW)
    const canGoPrevious = computed(() => currentStep.value > PropertyCreationStep.BASIC_INFO)

    function goToNextStep() {
        if (!isCurrentStepValid.value) {
            error.value = 'Veuillez corriger les erreurs avant de continuer'
            return false
        }
        if (canGoNext.value) {
            currentStep.value++
            error.value = null
            return true
        }
        return false
    }

    function goToPreviousStep() {
        if (canGoPrevious.value) {
            currentStep.value--
            error.value = null
            return true
        }
        return false
    }

    function goToStep(step: PropertyCreationStep) {
        for (let i = PropertyCreationStep.BASIC_INFO; i < step; i++) {
            if (!stepValidations.value[i].isValid) {
                error.value = `Veuillez compléter l'étape ${i} avant de continuer`
                return false
            }
        }
        currentStep.value = step
        error.value = null
        return true
    }

    async function uploadPhoto(file: File): Promise<CloudinaryUploadResponse | null> {
        try {
            isUploading.value = true
            error.value = null
            const response = await CloudinaryService.uploadImage(file, (progress) => {
                uploadProgress.value = progress.percentage
            })
            formData.photos.push(response)
            uploadProgress.value = 0
            return response
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erreur lors de l\'upload de la photo'
            return null
        } finally {
            isUploading.value = false
        }
    }

    async function uploadMultiplePhotos(files: File[]): Promise<boolean> {
        try {
            isUploading.value = true
            error.value = null
            const responses = await CloudinaryService.uploadMultipleImages(files, (completed, total) => {
                uploadProgress.value = Math.round((completed / total) * 100)
            })
            formData.photos.push(...responses)
            uploadProgress.value = 0
            return true
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erreur lors de l\'upload des photos'
            return false
        } finally {
            isUploading.value = false
        }
    }

    function removePhoto(index: number) {
        formData.photos.splice(index, 1)
        if (formData.mainPhotoIndex >= formData.photos.length) {
            formData.mainPhotoIndex = Math.max(0, formData.photos.length - 1)
        }
    }

    function reorderPhotos(fromIndex: number, toIndex: number) {
        const photo = formData.photos.splice(fromIndex, 1)[0]
        formData.photos.splice(toIndex, 0, photo)
        if (formData.mainPhotoIndex === fromIndex) {
            formData.mainPhotoIndex = toIndex
        } else if (fromIndex < formData.mainPhotoIndex && toIndex >= formData.mainPhotoIndex) {
            formData.mainPhotoIndex--
        } else if (fromIndex > formData.mainPhotoIndex && toIndex <= formData.mainPhotoIndex) {
            formData.mainPhotoIndex++
        }
    }

    function setMainPhoto(index: number) {
        if (index >= 0 && index < formData.photos.length) {
            formData.mainPhotoIndex = index
        }
    }

    async function submitProperty(): Promise<string | null> {
        for (let step = PropertyCreationStep.BASIC_INFO; step <= PropertyCreationStep.PHOTOS; step++) {
            if (!stepValidations.value[step].isValid) {
                error.value = `Veuillez compléter l'étape ${step} correctement`
                return null
            }
        }
        try {
            isSubmitting.value = true
            error.value = null
            const propertyData: CreatePropertyData = {
                title: formData.title,
                description: formData.description,
                type: formData.type as PropertyType,
                address: formData.address,
                city: formData.city,
                country: formData.country,
                latitude: formData.latitude,
                longitude: formData.longitude,
                roomCount: formData.roomCount,
                capacity: formData.capacity,
                pricePerNight: formData.pricePerNight,
                currency: formData.currency,
                amenities: formData.amenities,
                houseRules: formData.houseRules,
                photos: formData.photos.map((photo, index) => ({
                    url: photo.secure_url,
                    thumbnailUrl: CloudinaryService.getThumbnailUrl(photo.public_id),
                    isMain: index === formData.mainPhotoIndex,
                    order: index
                }))
            }
            const createdProperty = await LogementService.createProperty(propertyData)
            return createdProperty.id
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erreur lors de la création de la propriété'
            return null
        } finally {
            isSubmitting.value = false
        }
    }

    function resetForm() {
        currentStep.value = PropertyCreationStep.BASIC_INFO
        formData.title = ''
        formData.description = ''
        formData.type = ''
        formData.address = ''
        formData.city = ''
        formData.country = ''
        formData.latitude = undefined
        formData.longitude = undefined
        formData.roomCount = 1
        formData.capacity = 1
        formData.amenities = {}
        formData.houseRules = {}
        formData.pricePerNight = 0
        formData.currency = 'XOF'
        formData.photos = []
        formData.mainPhotoIndex = 0
        error.value = null
    }

    return {
        currentStep: computed(() => currentStep.value),
        formData,
        isSubmitting: computed(() => isSubmitting.value),
        isUploading: computed(() => isUploading.value),
        uploadProgress: computed(() => uploadProgress.value),
        error: computed(() => error.value),
        stepValidations,
        isCurrentStepValid,
        canGoNext,
        canGoPrevious,
        goToNextStep,
        goToPreviousStep,
        goToStep,
        uploadPhoto,
        uploadMultiplePhotos,
        removePhoto,
        reorderPhotos,
        setMainPhoto,
        submitProperty,
        resetForm,
        clearError: () => { error.value = null }
    }
}
