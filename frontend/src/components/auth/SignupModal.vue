<template>
  <Transition name="modal-backdrop">
    <div
      v-if="isOpen"
      @click="close"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in"
    >
      <div
        @click.stop
        class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-2xl font-bold text-gray-900">Créer un compte</h2>
          <button
            @click="close"
            class="p-2 hover:bg-gray-100 rounded-full transition-colors"
            type="button"
          >
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <!-- Stepper -->
        <div class="px-6 pt-6">
          <Stepper :steps="stepLabels" :current-step="currentStep" />
        </div>

        <!-- Body -->
        <form @submit.prevent="handleNext" class="p-6">
          <!-- Step 1: Personal Info -->
          <div v-if="currentStep === 0" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Prénom <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.firstName"
                  type="text"
                  required
                  placeholder="Jean"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-african-green focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Nom <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.lastName"
                  type="text"
                  required
                  placeholder="Dupont"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-african-green focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Email <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.email"
                type="email"
                required
                placeholder="jean.dupont@example.com"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-african-green focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Téléphone (optionnel)
              </label>
              <input
                type="tel"
                placeholder="+33 6 12 34 56 78"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-african-green focus:border-transparent"
              />
            </div>
          </div>

          <!-- Step 2: Security -->
          <div v-if="currentStep === 1" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  placeholder="••••••••"
                  class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-african-green focus:border-transparent"
                  @input="checkPasswordStrength"
                />
                <button
                  @click="showPassword = !showPassword"
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Eye v-if="!showPassword" class="w-5 h-5" />
                  <EyeOff v-else class="w-5 h-5" />
                </button>
              </div>
              
              <!-- Password strength -->
              <div class="mt-2">
                <div class="flex items-center gap-2 mb-1">
                  <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      :class="[
                        'h-full transition-all duration-300',
                        passwordStrength.color
                      ]"
                      :style="{ width: passwordStrength.width }"
                    ></div>
                  </div>
                  <span :class="['text-xs font-medium', passwordStrength.textColor]">
                    {{ passwordStrength.label }}
                  </span>
                </div>
                <p class="text-xs text-gray-500">
                  Minimum 8 caractères
                </p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  v-model="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  required
                  placeholder="••••••••"
                  class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-african-green focus:border-transparent"
                  :class="{ 'border-red-300': passwordMismatch }"
                />
                <button
                  @click="showConfirmPassword = !showConfirmPassword"
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Eye v-if="!showConfirmPassword" class="w-5 h-5" />
                  <EyeOff v-else class="w-5 h-5" />
                </button>
              </div>
              <p v-if="passwordMismatch" class="mt-1 text-xs text-red-600">
                Les mots de passe ne correspondent pas
              </p>
            </div>
          </div>

          <!-- Step 3: Account Type -->
          <div v-if="currentStep === 2" class="space-y-4">
            <p class="text-sm text-gray-600 mb-4">
              Choisissez le type de compte qui correspond à vos besoins
            </p>

            <div class="space-y-3">
              <!-- Guest option -->
              <label
                :class="[
                  'block p-4 border-2 rounded-xl cursor-pointer transition-all',
                  formData.userType === 'locataire'
                    ? 'border-african-green bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                ]"
              >
                <div class="flex items-start gap-3">
                  <input
                    v-model="formData.userType"
                    type="radio"
                    value="locataire"
                    class="mt-1 text-african-green focus:ring-african-green"
                  />
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <User class="w-5 h-5 text-african-green" />
                      <span class="font-semibold text-gray-900">Je cherche un logement</span>
                    </div>
                    <ul class="text-sm text-gray-600 space-y-1 ml-7">
                      <li class="flex items-center gap-2">
                        <Check class="w-4 h-4 text-african-green" />
                        Réservez facilement des logements
                      </li>
                      <li class="flex items-center gap-2">
                        <Check class="w-4 h-4 text-african-green" />
                        Sauvegardez vos favoris
                      </li>
                      <li class="flex items-center gap-2">
                        <Check class="w-4 h-4 text-african-green" />
                        Gérez vos réservations
                      </li>
                    </ul>
                  </div>
                </div>
              </label>

              <!-- Owner option -->
              <label
                :class="[
                  'block p-4 border-2 rounded-xl cursor-pointer transition-all',
                  formData.userType === 'proprietaire'
                    ? 'border-african-green bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                ]"
              >
                <div class="flex items-start gap-3">
                  <input
                    v-model="formData.userType"
                    type="radio"
                    value="proprietaire"
                    class="mt-1 text-african-green focus:ring-african-green"
                  />
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <Home class="w-5 h-5 text-african-green" />
                      <span class="font-semibold text-gray-900">Je veux louer mon logement</span>
                    </div>
                    <ul class="text-sm text-gray-600 space-y-1 ml-7">
                      <li class="flex items-center gap-2">
                        <Check class="w-4 h-4 text-african-green" />
                        Gagnez un revenu passif
                      </li>
                      <li class="flex items-center gap-2">
                        <Check class="w-4 h-4 text-african-green" />
                        Gérez vos annonces facilement
                      </li>
                      <li class="flex items-center gap-2">
                        <Check class="w-4 h-4 text-african-green" />
                        Rejoignez notre communauté
                      </li>
                    </ul>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <!-- Navigation buttons -->
          <div class="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              v-if="currentStep > 0"
              @click="handlePrevious"
              type="button"
              class="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
              :disabled="isLoading"
            >
              <ChevronLeft class="w-5 h-5" />
              <span>Précédent</span>
            </button>
            <div v-else></div>

            <button
              type="submit"
              :disabled="isLoading || !canProceed"
              class="px-6 py-3 text-white bg-african-green rounded-lg hover:bg-african-green-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
              <span v-if="currentStep < 2">Suivant</span>
              <span v-else>{{ isLoading ? 'Inscription...' : 'S\'inscrire' }}</span>
              <ChevronRight v-if="currentStep < 2" class="w-5 h-5" />
            </button>
          </div>

          <!-- Login link -->
          <div class="text-center pt-4">
            <span class="text-sm text-gray-600">Déjà un compte ? </span>
            <button
              @click="switchToLogin"
              type="button"
              class="text-sm text-african-green hover:text-african-green-dark font-medium"
              :disabled="isLoading"
            >
              Se connecter
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, Eye, EyeOff, ChevronLeft, ChevronRight, User, Home, Check, Loader2 } from 'lucide-vue-next'
import Stepper from '../ui/Stepper.vue'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import type { RegisterData } from '@/types/auth'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  'switch-to-login': []
}>()

const { register, isLoading, error } = useAuth()
const toast = useToast()

const currentStep = ref(0)
const stepLabels = ['Informations', 'Sécurité', 'Type de compte']

const formData = ref<RegisterData>({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  userType: 'locataire'
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const confirmPassword = ref('')

const passwordMismatch = computed(() => {
  return confirmPassword.value && formData.value.password !== confirmPassword.value
})

const passwordStrength = computed(() => {
  const password = formData.value.password
  if (!password) return { width: '0%', color: 'bg-gray-300', textColor: 'text-gray-500', label: '' }

  const length = password.length
  
  if (length < 8) return { width: '33%', color: 'bg-red-500', textColor: 'text-red-600', label: 'Trop court' }
  if (length < 12) return { width: '66%', color: 'bg-yellow-500', textColor: 'text-yellow-600', label: 'Moyen' }
  return { width: '100%', color: 'bg-green-500', textColor: 'text-green-600', label: 'Fort' }
})

const canProceed = computed(() => {
  if (currentStep.value === 0) {
    return formData.value.firstName && formData.value.lastName && formData.value.email
  }
  if (currentStep.value === 1) {
    return formData.value.password && confirmPassword.value && !passwordMismatch.value && formData.value.password.length >= 8
  }
  if (currentStep.value === 2) {
    return formData.value.userType
  }
  return false
})

const checkPasswordStrength = () => {
  // Trigger reactivity
}

const handleNext = async () => {
  if (currentStep.value < 2) {
    currentStep.value++
  } else {
    await handleSignup()
  }
}

const handlePrevious = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const handleSignup = async () => {
  const success = await register(formData.value)

  if (success) {
    toast.success('Inscription réussie', 'Bienvenue sur BnB ESGI !')
    close()
  } else if (error.value) {
    toast.error('Erreur d\'inscription', error.value)
  }
}

const close = () => {
  currentStep.value = 0
  formData.value = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    userType: 'locataire'
  }
  confirmPassword.value = ''
  emit('close')
}

const switchToLogin = () => {
  emit('switch-to-login')
}
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
</style>
