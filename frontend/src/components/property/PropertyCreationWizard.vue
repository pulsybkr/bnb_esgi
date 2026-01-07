<template>
  <div class="property-creation-wizard">
    <!-- Progress Bar -->
    <div class="mb-8">
      <div class="flex justify-between items-center mb-4">
        <button
          v-for="step in totalSteps"
          :key="step"
          @click="goToStep(step)"
          :disabled="!canAccessStep(step)"
          class="flex-1 flex flex-col items-center relative group"
          :class="{ 'cursor-not-allowed': !canAccessStep(step) }"
          type="button"
        >
          <!-- Step Circle -->
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 mb-2 relative z-10"
            :class="getStepCircleClass(step)"
          >
            <Check v-if="isStepCompleted(step)" class="w-5 h-5" />
            <span v-else>{{ step }}</span>
          </div>
          
          <!-- Step Label -->
          <span
            class="text-xs font-medium text-center transition-colors duration-300"
            :class="getStepLabelClass(step)"
          >
            {{ getStepLabel(step) }}
          </span>
          
          <!-- Connector Line -->
          <div
            v-if="step < totalSteps"
            class="absolute top-5 left-[60%] w-full h-0.5 transition-all duration-300"
            :class="step < currentStep ? 'bg-african-green' : 'bg-gray-200'"
          ></div>
        </button>
      </div>
    </div>

    <!-- Step Content -->
    <div class="bg-white rounded-2xl shadow-lg p-8 mb-6 min-h-[500px]">
      <Transition name="slide-fade" mode="out-in">
        <component :is="currentStepComponent" :key="currentStep" />
      </Transition>
    </div>

    <!-- Navigation Buttons -->
    <div class="flex justify-between items-center">
      <button
        v-if="canGoPrevious"
        @click="handlePrevious"
        type="button"
        class="px-6 py-3 border-2 border-gray-300 rounded-full text-gray-700 font-medium hover:border-african-green hover:text-african-green transition-all duration-300 flex items-center gap-2"
      >
        <ChevronLeft class="w-5 h-5" />
        <span>Précédent</span>
      </button>
      <div v-else></div>

      <button
        v-if="currentStep < totalSteps"
        @click="handleNext"
        :disabled="!isCurrentStepValid"
        type="button"
        class="px-8 py-3 bg-african-green text-white rounded-full font-medium hover:bg-african-green-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"
      >
        <span>Suivant</span>
        <ChevronRight class="w-5 h-5" />
      </button>

      <button
        v-else
        @click="handleSubmit"
        :disabled="isSubmitting || !canSubmit"
        type="button"
        class="px-8 py-3 bg-african-green text-white rounded-full font-medium hover:bg-african-green-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"
      >
        <Loader2 v-if="isSubmitting" class="w-5 h-5 animate-spin" />
        <span v-if="isSubmitting">Publication...</span>
        <span v-else>Publier le logement</span>
      </button>
    </div>

    <!-- Error Message -->
    <Transition name="slide-down">
      <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
        <AlertCircle class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div class="flex-1">
          <p class="text-sm text-red-800 font-medium">{{ error }}</p>
        </div>
        <button @click="clearError" type="button" class="text-red-600 hover:text-red-800">
          <X class="w-5 h-5" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Check, ChevronLeft, ChevronRight, Loader2, AlertCircle, X } from 'lucide-vue-next'
import { usePropertyCreation, PropertyCreationStep } from '@/composables/usePropertyCreation'
import PropertyStepBasicInfo from './PropertyStepBasicInfo.vue'
import PropertyStepLocation from './PropertyStepLocation.vue'
import PropertyStepDetails from './PropertyStepDetails.vue'
import PropertyStepPricing from './PropertyStepPricing.vue'
import PropertyStepPhotos from './PropertyStepPhotos.vue'
import PropertyStepReview from './PropertyStepReview.vue'

const emit = defineEmits<{
  submit: [propertyId: string]
}>()

const {
  currentStep,
  isCurrentStepValid,
  canGoNext,
  canGoPrevious,
  isSubmitting,
  error,
  stepValidations,
  goToNextStep,
  goToPreviousStep,
  goToStep: navigateToStep,
  submitProperty,
  clearError
} = usePropertyCreation()

const totalSteps = 6

const stepComponents = {
  [PropertyCreationStep.BASIC_INFO]: PropertyStepBasicInfo,
  [PropertyCreationStep.LOCATION]: PropertyStepLocation,
  [PropertyCreationStep.DETAILS]: PropertyStepDetails,
  [PropertyCreationStep.PRICING]: PropertyStepPricing,
  [PropertyCreationStep.PHOTOS]: PropertyStepPhotos,
  [PropertyCreationStep.REVIEW]: PropertyStepReview
}

const stepLabels = {
  [PropertyCreationStep.BASIC_INFO]: 'Informations',
  [PropertyCreationStep.LOCATION]: 'Localisation',
  [PropertyCreationStep.DETAILS]: 'Détails',
  [PropertyCreationStep.PRICING]: 'Tarification',
  [PropertyCreationStep.PHOTOS]: 'Photos',
  [PropertyCreationStep.REVIEW]: 'Récapitulatif'
}

const currentStepComponent = computed(() => stepComponents[currentStep.value])

const canSubmit = computed(() => {
  // Vérifier que toutes les étapes sont valides
  for (let step = PropertyCreationStep.BASIC_INFO; step <= PropertyCreationStep.PHOTOS; step++) {
    if (!stepValidations.value[step].isValid) {
      return false
    }
  }
  return true
})

function getStepLabel(step: number): string {
  return stepLabels[step as PropertyCreationStep] || ''
}

function getStepCircleClass(step: number): string {
  if (step < currentStep.value || isStepCompleted(step)) {
    return 'bg-african-green text-white shadow-md'
  } else if (step === currentStep.value) {
    return 'bg-african-green text-white shadow-lg ring-4 ring-african-green ring-opacity-30'
  } else {
    return 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
  }
}

function getStepLabelClass(step: number): string {
  if (step === currentStep.value) {
    return 'text-african-green font-semibold'
  } else if (step < currentStep.value) {
    return 'text-gray-600'
  } else {
    return 'text-gray-400'
  }
}

function isStepCompleted(step: number): boolean {
  return step < currentStep.value && stepValidations.value[step as PropertyCreationStep].isValid
}

function canAccessStep(step: number): boolean {
  // On peut accéder à une étape si toutes les étapes précédentes sont valides
  for (let i = PropertyCreationStep.BASIC_INFO; i < step; i++) {
    if (!stepValidations.value[i as PropertyCreationStep].isValid) {
      return false
    }
  }
  return true
}

function goToStep(step: number) {
  if (canAccessStep(step)) {
    navigateToStep(step as PropertyCreationStep)
  }
}

function handlePrevious() {
  goToPreviousStep()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleNext() {
  if (goToNextStep()) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

async function handleSubmit() {
  const propertyId = await submitProperty()
  if (propertyId) {
    emit('submit', propertyId)
  }
}
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
