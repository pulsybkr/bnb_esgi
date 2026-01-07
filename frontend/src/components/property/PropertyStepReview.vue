<template>
  <div class="space-y-6 animate-slide-up">
    <div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Récapitulatif</h2>
      <p class="text-gray-600">Vérifiez les informations avant de publier votre logement</p>
    </div>

    <!-- Photos Preview -->
    <div class="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
      <div class="aspect-video relative">
        <img
          v-if="mainPhoto"
          :src="mainPhoto"
          alt="Photo principale"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full bg-gray-100 flex items-center justify-center">
          <ImageIcon class="w-16 h-16 text-gray-300" />
        </div>
        
        <!-- Photos Count Badge -->
        <div v-if="formData.photos.length > 0" class="absolute bottom-4 right-4 px-3 py-1.5 bg-black bg-opacity-70 text-white text-sm font-medium rounded-full flex items-center gap-2">
          <ImageIcon class="w-4 h-4" />
          <span>{{ formData.photos.length }} photo{{ formData.photos.length > 1 ? 's' : '' }}</span>
        </div>
      </div>
    </div>

    <!-- Property Info Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Basic Info -->
      <div class="bg-gray-50 rounded-xl p-5 border border-gray-200">
        <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <FileText class="w-4 h-4 text-african-green" />
          Informations de base
        </h3>
        <dl class="space-y-2">
          <div>
            <dt class="text-xs text-gray-600">Titre</dt>
            <dd class="text-sm font-medium text-gray-900">{{ formData.title }}</dd>
          </div>
          <div>
            <dt class="text-xs text-gray-600">Type</dt>
            <dd class="text-sm font-medium text-gray-900 capitalize">{{ formData.type }}</dd>
          </div>
          <div>
            <dt class="text-xs text-gray-600">Description</dt>
            <dd class="text-sm text-gray-700 line-clamp-2">{{ formData.description }}</dd>
          </div>
        </dl>
      </div>

      <!-- Location -->
      <div class="bg-gray-50 rounded-xl p-5 border border-gray-200">
        <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <MapPin class="w-4 h-4 text-african-green" />
          Localisation
        </h3>
        <dl class="space-y-2">
          <div>
            <dt class="text-xs text-gray-600">Adresse</dt>
            <dd class="text-sm font-medium text-gray-900">{{ formData.address }}</dd>
          </div>
          <div>
            <dt class="text-xs text-gray-600">Ville</dt>
            <dd class="text-sm font-medium text-gray-900">{{ formData.city }}</dd>
          </div>
          <div>
            <dt class="text-xs text-gray-600">Pays</dt>
            <dd class="text-sm font-medium text-gray-900">{{ formData.country }}</dd>
          </div>
        </dl>
      </div>

      <!-- Details -->
      <div class="bg-gray-50 rounded-xl p-5 border border-gray-200">
        <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Home class="w-4 h-4 text-african-green" />
          Détails
        </h3>
        <dl class="space-y-2">
          <div>
            <dt class="text-xs text-gray-600">Capacité</dt>
            <dd class="text-sm font-medium text-gray-900">{{ formData.capacity }} personne{{ formData.capacity > 1 ? 's' : '' }}</dd>
          </div>
          <div>
            <dt class="text-xs text-gray-600">Pièces</dt>
            <dd class="text-sm font-medium text-gray-900">{{ formData.roomCount }} pièce{{ formData.roomCount > 1 ? 's' : '' }}</dd>
          </div>
          <div>
            <dt class="text-xs text-gray-600">Équipements</dt>
            <dd class="text-sm text-gray-700">{{ amenitiesCount }} équipement{{ amenitiesCount > 1 ? 's' : '' }}</dd>
          </div>
        </dl>
      </div>

      <!-- Pricing -->
      <div class="bg-gray-50 rounded-xl p-5 border border-gray-200">
        <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <DollarSign class="w-4 h-4 text-african-green" />
          Tarification
        </h3>
        <div class="flex items-baseline gap-2">
          <span class="text-3xl font-bold text-african-green">{{ formatPrice(formData.pricePerNight) }}</span>
          <span class="text-sm text-gray-600">{{ formData.currency }} / nuit</span>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div class="bg-green-50 rounded-xl p-5 border-2 border-african-green">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 bg-african-green rounded-full flex items-center justify-center flex-shrink-0">
          <CheckCircle2 class="w-6 h-6 text-white" />
        </div>
        <div class="flex-1">
          <h4 class="text-base font-semibold text-african-green-dark mb-1">Prêt à publier !</h4>
          <p class="text-sm text-gray-700">
            Votre logement sera visible par tous les voyageurs après publication. 
            Vous pourrez le modifier à tout moment depuis votre tableau de bord.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FileText, MapPin, Home, DollarSign, ImageIcon, CheckCircle2 } from 'lucide-vue-next'
import { usePropertyCreation } from '@/composables/usePropertyCreation'
import { CloudinaryService } from '@/services/cloudinary'

const { formData } = usePropertyCreation()

const mainPhoto = computed(() => {
  if (formData.photos.length === 0) return null
  const photo = formData.photos[formData.mainPhotoIndex]
  return CloudinaryService.getOptimizedUrl(photo.public_id, {
    width: 800,
    height: 450,
    crop: 'fill',
    quality: 'auto',
    format: 'auto'
  })
})

const amenitiesCount = computed(() => {
  return Object.values(formData.amenities).filter(Boolean).length
})

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR').format(price)
}
</script>
