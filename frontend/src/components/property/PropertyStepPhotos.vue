<template>
  <div class="space-y-6 animate-slide-up">
    <div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Photos du logement</h2>
      <p class="text-gray-600">Ajoutez au moins 5 photos de qualité pour attirer les voyageurs</p>
    </div>

    <!-- Upload Zone -->
    <div
      @drop.prevent="handleDrop"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      :class="[
        'border-2 border-dashed rounded-2xl p-8 transition-all duration-300 text-center',
        isDragging ? 'border-african-green bg-green-50 scale-105' : 'border-gray-300 hover:border-african-green',
        errors.photos ? 'border-red-500' : ''
      ]"
    >
      <input
        ref="fileInput"
        type="file"
        multiple
        accept="image/*"
        @change="handleFileSelect"
        class="hidden"
      />
      
      <div class="flex flex-col items-center gap-4">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <Upload class="w-8 h-8 text-african-green" />
        </div>
        
        <div>
          <p class="text-lg font-semibold text-gray-900 mb-1">
            Glissez vos photos ici ou
            <button
              @click="fileInput?.click()"
              type="button"
              class="text-african-green hover:text-african-green-dark underline"
            >
              parcourez
            </button>
          </p>
          <p class="text-sm text-gray-600">
            JPG, PNG ou WEBP • Maximum 10MB par image • Minimum 5 photos
          </p>
        </div>

        <div v-if="formData.photos.length > 0" class="text-sm font-medium text-african-green">
          {{ formData.photos.length }} photo{{ formData.photos.length > 1 ? 's' : '' }} ajoutée{{ formData.photos.length > 1 ? 's' : '' }}
        </div>
      </div>
    </div>

    <p v-if="errors.photos" class="text-sm text-red-600">{{ errors.photos }}</p>

    <!-- Upload Progress -->
    <Transition name="slide-down">
      <div v-if="isUploading" class="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div class="flex items-center gap-3 mb-2">
          <Loader2 class="w-5 h-5 text-blue-600 animate-spin" />
          <span class="text-sm font-medium text-blue-900">Upload en cours...</span>
        </div>
        <div class="w-full bg-blue-200 rounded-full h-2">
          <div
            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${uploadProgress}%` }"
          ></div>
        </div>
      </div>
    </Transition>

    <!-- Photos Grid -->
    <div v-if="formData.photos.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        v-for="(photo, index) in formData.photos"
        :key="photo.public_id"
        class="relative group aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300"
        :class="index === formData.mainPhotoIndex ? 'border-african-green ring-4 ring-african-green ring-opacity-30' : 'border-gray-200 hover:border-gray-300'"
      >
        <!-- Image -->
        <img
          :src="getThumbnailUrl(photo.public_id)"
          :alt="`Photo ${index + 1}`"
          class="w-full h-full object-cover"
        />

        <!-- Main Photo Badge -->
        <div
          v-if="index === formData.mainPhotoIndex"
          class="absolute top-2 left-2 px-2 py-1 bg-african-green text-white text-xs font-semibold rounded-full flex items-center gap-1"
        >
          <Star class="w-3 h-3 fill-current" />
          <span>Principale</span>
        </div>

        <!-- Actions Overlay -->
        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button
            v-if="index !== formData.mainPhotoIndex"
            @click="setMainPhoto(index)"
            type="button"
            class="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
            title="Définir comme photo principale"
          >
            <Star class="w-4 h-4 text-gray-700" />
          </button>
          
          <button
            @click="removePhoto(index)"
            type="button"
            class="p-2 bg-white rounded-full hover:bg-red-50 transition-colors"
            title="Supprimer"
          >
            <Trash2 class="w-4 h-4 text-red-600" />
          </button>
        </div>

        <!-- Order Number -->
        <div class="absolute bottom-2 right-2 w-6 h-6 bg-white bg-opacity-90 rounded-full flex items-center justify-center text-xs font-semibold text-gray-700">
          {{ index + 1 }}
        </div>
      </div>
    </div>

    <!-- Tips -->
    <div class="bg-amber-50 rounded-xl p-4 border border-amber-200">
      <div class="flex items-start gap-3">
        <Lightbulb class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 class="text-sm font-medium text-amber-900 mb-2">Conseils pour de belles photos</h4>
          <ul class="text-xs text-amber-800 space-y-1">
            <li>• Prenez des photos avec une bonne luminosité naturelle</li>
            <li>• Montrez les différentes pièces et espaces de votre logement</li>
            <li>• Mettez en valeur les équipements et points forts</li>
            <li>• Assurez-vous que les espaces sont propres et bien rangés</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Upload, Loader2, Star, Trash2, Lightbulb } from 'lucide-vue-next'
import { usePropertyCreation } from '@/composables/usePropertyCreation'
import { CloudinaryService } from '@/services/cloudinary'

const { formData, stepValidations, uploadMultiplePhotos, removePhoto: removePhotoFromList, setMainPhoto, isUploading, uploadProgress } = usePropertyCreation()

const errors = computed(() => stepValidations.value[5].errors)

const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)

function getThumbnailUrl(publicId: string): string {
  return CloudinaryService.getThumbnailUrl(publicId)
}

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const files = Array.from(target.files)
    await uploadMultiplePhotos(files)
    target.value = '' // Reset input
  }
}

async function handleDrop(event: DragEvent) {
  isDragging.value = false
  
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    const files = Array.from(event.dataTransfer.files).filter(file => file.type.startsWith('image/'))
    if (files.length > 0) {
      await uploadMultiplePhotos(files)
    }
  }
}

function removePhoto(index: number) {
  removePhotoFromList(index)
}
</script>

<style scoped>
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
