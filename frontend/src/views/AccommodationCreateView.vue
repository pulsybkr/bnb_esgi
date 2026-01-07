<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20">
          <!-- Logo -->
          <router-link to="/" class="flex items-center gap-2">
            <h1 class="text-3xl font-bold text-african-green flex items-center gap-2">
              <Home class="w-8 h-8" />
              <span>bnb</span>
            </h1>
          </router-link>

          <!-- Title -->
          <div class="hidden md:block">
            <h2 class="text-xl font-semibold text-gray-800">Ajouter un logement</h2>
          </div>

          <!-- Close Button -->
          <router-link
            to="/"
            class="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X class="w-5 h-5" />
            <span class="hidden sm:inline">Annuler</span>
          </router-link>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Message (shown only once) -->
      <Transition name="fade">
        <div v-if="showWelcome" class="mb-8 bg-gradient-to-r from-african-green to-african-green-light rounded-2xl p-6 text-white shadow-lg">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles class="w-6 h-6" />
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold mb-2">Bienvenue dans l'ajout de logement !</h3>
              <p class="text-green-50 text-sm mb-4">
                Suivez les étapes pour créer votre annonce. Vous pourrez la modifier à tout moment.
              </p>
              <button
                @click="showWelcome = false"
                type="button"
                class="px-4 py-2 bg-white text-african-green rounded-lg font-medium hover:bg-green-50 transition-colors text-sm"
              >
                Commencer
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Wizard -->
      <PropertyCreationWizard @submit="handlePropertyCreated" />
    </main>

    <!-- Success Modal -->
    <Transition name="modal">
      <div
        v-if="showSuccessModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="closeSuccessModal"
      >
        <div class="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
          <div class="text-center">
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 class="w-12 h-12 text-african-green" />
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Logement publié !</h3>
            <p class="text-gray-600 mb-6">
              Votre logement a été publié avec succès. Il est maintenant visible par tous les voyageurs.
            </p>
            <div class="flex flex-col sm:flex-row gap-3">
              <button
                @click="viewProperty"
                type="button"
                class="flex-1 px-6 py-3 bg-african-green text-white rounded-full font-medium hover:bg-african-green-dark transition-colors"
              >
                Voir le logement
              </button>
              <button
                @click="addAnother"
                type="button"
                class="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full font-medium hover:border-african-green hover:text-african-green transition-colors"
              >
                Ajouter un autre
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Home, X, Sparkles, CheckCircle2 } from 'lucide-vue-next'
import PropertyCreationWizard from '@/components/property/PropertyCreationWizard.vue'
import { usePropertyCreation } from '@/composables/usePropertyCreation'

const router = useRouter()
const { resetForm } = usePropertyCreation()

onMounted(() => {
  resetForm()
})

const showWelcome = ref(true)
const showSuccessModal = ref(false)
const createdPropertyId = ref<string | null>(null)

function handlePropertyCreated(propertyId: string) {
  createdPropertyId.value = propertyId
  showSuccessModal.value = true
}

function viewProperty() {
  if (createdPropertyId.value) {
    router.push({ name: 'accommodation-detail', params: { id: createdPropertyId.value } })
  }
}

function addAnother() {
  showSuccessModal.value = false
  createdPropertyId.value = null
  window.location.reload() // Reload to reset the wizard
}

function closeSuccessModal() {
  router.push({ name: 'home' })
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .animate-scale-in,
.modal-leave-active .animate-scale-in {
  transition: transform 0.3s ease;
}

.modal-enter-from .animate-scale-in,
.modal-leave-to .animate-scale-in {
  transform: scale(0.95);
}
</style>
