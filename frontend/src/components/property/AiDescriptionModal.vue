<template>
  <Transition name="modal-backdrop">
    <div
      v-if="isOpen"
      @click="close"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    >
      <div
        @click.stop
        class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-african-green/5 to-transparent">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-african-green/10 rounded-lg">
              <Sparkles class="w-6 h-6 text-african-green" />
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900">Génération par IA</h2>
              <p v-if="step === 'input'" class="text-sm text-gray-500">Décrivez brièvement votre logement</p>
              <p v-else-if="step === 'generating'" class="text-sm text-gray-500">Gemini rédige votre annonce...</p>
              <p v-else class="text-sm text-gray-500">Voici la proposition de l'IA</p>
            </div>
          </div>
          <button
            @click="close"
            class="p-2 hover:bg-gray-100 rounded-full transition-colors"
            type="button"
          >
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 overflow-y-auto flex-1">
          <!-- Step 1: Input -->
          <div v-if="step === 'input'" class="space-y-4">
            <p class="text-sm text-gray-600">
              Saisissez quelques points clés (ex: 3 chambres, vue mer, terrasse, proche commerces) ou une description brute. L'IA se chargera de rédiger un texte professionnel et captivant.
            </p>
            <textarea
              v-model="rawInput"
              rows="8"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-african-green focus:border-transparent transition-all resize-none"
              placeholder="Ex: Villa spacieuse à Dakar, quartier Almadies, 4 chambres, piscine privée, gardien 24/7, wifi haut débit..."
            ></textarea>
            <div class="flex justify-between items-center">
              <p v-if="validationError" class="text-xs text-red-500">{{ validationError }}</p>
              <p class="text-xs text-gray-400 ml-auto">{{ rawInput.length }}/1000</p>
            </div>
          </div>

          <!-- Step 2: Generating -->
          <div v-if="step === 'generating'" class="flex flex-col items-center justify-center py-12 space-y-4">
            <div class="relative">
              <div class="w-16 h-16 border-4 border-african-green/20 border-t-african-green rounded-full animate-spin"></div>
              <Sparkles class="w-6 h-6 text-african-green absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <p class="text-gray-600 font-medium">Rédaction en cours...</p>
            <p class="text-sm text-gray-400">Préparez-vous à être ébloui</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="bg-red-50 border-2 border-red-100 rounded-xl p-6 text-center">
            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle class="w-6 h-6 text-red-600" />
            </div>
            <h3 class="text-lg font-bold text-red-900 mb-2">Oups ! Une erreur est survenue</h3>
            <p class="text-red-700 mb-6">{{ error }}</p>
            <button
              @click="step = 'input'"
              class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Modifier ma saisie
            </button>
          </div>

          <!-- Step 3: Result -->
          <div v-else-if="step === 'result'" class="space-y-4">
            <div class="p-4 bg-gray-50 border-2 border-gray-100 rounded-xl">
              <MarkdownContent :content="suggestedDescription" />
            </div>
            <div class="flex items-center gap-2 text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
              <Info class="w-4 h-4 text-blue-500 shrink-0" />
              <span>Vous pouvez encore modifier ce texte après l'avoir accepté.</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <button
            @click="close"
            type="button"
            class="px-6 py-3 text-gray-700 hover:bg-gray-200 rounded-xl transition-colors font-medium"
          >
            Annuler
          </button>
          
          <div class="flex items-center gap-3">
            <button
              v-if="step === 'input'"
              @click="handleGenerate"
              type="button"
              class="px-8 py-3 bg-african-green text-white hover:bg-african-green-dark rounded-xl transition-colors font-medium shadow-lg shadow-african-green/20 flex items-center gap-2"
              :disabled="rawInput.length < 10"
            >
              <Sparkles class="w-5 h-5" />
              <span>Générer l'annonce</span>
            </button>

            <button
              v-if="step === 'result'"
              @click="step = 'input'"
              type="button"
              class="px-6 py-3 text-african-green border-2 border-african-green hover:bg-african-green/5 rounded-xl transition-colors font-medium flex items-center gap-2"
            >
              <ChevronLeft class="w-4 h-4" />
              <span>Modifier</span>
            </button>
            <button
              v-if="step === 'result'"
              @click="handleAccept"
              type="button"
              class="px-8 py-3 bg-african-green text-white hover:bg-african-green-dark rounded-xl transition-colors font-medium shadow-lg shadow-african-green/20 flex items-center gap-2"
            >
              <Check class="w-5 h-5" />
              <span>Utiliser ce texte</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, Sparkles, Check, ChevronLeft, AlertCircle, Info } from 'lucide-vue-next'
import { AiService } from '@/services/ai/aiService'
import MarkdownContent from '@/components/ui/MarkdownContent.vue'

const props = defineProps<{
  isOpen: boolean
  currentDescription: string
}>()

const emit = defineEmits<{
  close: []
  accept: [description: string]
}>()

const step = ref<'input' | 'generating' | 'result'>('input')
const rawInput = ref('')
const suggestedDescription = ref('')
const error = ref<string | null>(null)
const validationError = ref<string | null>(null)

const handleGenerate = async () => {
  if (rawInput.value.length < 10) {
    validationError.value = "Veuillez saisir au moins 10 caractères."
    return
  }

  step.value = 'generating'
  error.value = null
  validationError.value = null
  
  try {
    const result = await AiService.generateDescription({
      description: rawInput.value
    })
    suggestedDescription.value = result
    step.value = 'result'
  } catch (err: any) {
    error.value = err.response?.data?.message || "Impossible de générer une description pour le moment."
    step.value = 'input'
  }
}

const handleAccept = () => {
  emit('accept', suggestedDescription.value)
  close()
}

const close = () => {
  emit('close')
}

watch(() => props.isOpen, (next) => {
  if (next) {
    step.value = 'input'
    rawInput.value = props.currentDescription
    error.value = null
    validationError.value = null
  }
})
</script>

<style scoped>
.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}

.animate-scale-in {
  animation: scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes scale-in {
  from {
    transform: scale(0.95) translateY(10px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}
</style>
