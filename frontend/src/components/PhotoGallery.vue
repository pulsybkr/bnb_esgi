<template>
  <div class="relative">
    <!-- Galerie principale -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-2 h-96 md:h-80">
      <!-- Image principale -->
      <div 
        class="md:col-span-2 row-span-2 relative cursor-pointer"
        @click="openModal(0)"
      >
        <img 
          :src="images[currentImageIndex]" 
          :alt="`Image ${currentImageIndex + 1}`"
          class="w-full h-full object-cover rounded-l-lg"
        />
        <div class="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
          <ZoomIn class="w-8 h-8 text-white opacity-0 hover:opacity-100 transition-opacity duration-200" />
        </div>
      </div>
      
      <!-- Images secondaires -->
      <div 
        v-for="(image, index) in images.slice(1, 5)" 
        :key="index"
        class="relative cursor-pointer"
        @click="openModal(index + 1)"
      >
        <img 
          :src="image" 
          :alt="`Image ${index + 2}`"
          class="w-full h-full object-cover"
          :class="{
            'rounded-tr-lg': index === 0,
            'rounded-br-lg': index === 3,
            'rounded-none': index > 0 && index < 3
          }"
        />
        <div class="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
          <ZoomIn class="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity duration-200" />
        </div>
      </div>
    </div>

    <!-- Bouton "Voir toutes les photos" -->
    <button 
      v-if="images.length > 5"
      @click="openModal(0)"
      class="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 flex items-center space-x-2"
    >
      <Camera class="w-4 h-4" />
      <span class="text-sm font-medium">Voir toutes les photos</span>
    </button>

    <!-- Modal de zoom -->
    <div 
      v-if="isModalOpen"
      class="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
      @click="closeModal"
    >
      <div class="relative max-w-6xl max-h-full p-4">
        <!-- Bouton fermer -->
        <button 
          @click="closeModal"
          class="absolute top-4 right-4 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all duration-200"
        >
          <X class="w-6 h-6 text-white" />
        </button>

        <!-- Image principale du modal -->
        <div class="relative">
          <img 
            :src="images[modalImageIndex]" 
            :alt="`Image ${modalImageIndex + 1}`"
            class="max-w-full max-h-[80vh] object-contain rounded-lg"
          />
          
          <!-- Navigation -->
          <button 
            v-if="images.length > 1"
            @click.stop="previousImage"
            class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-3 transition-all duration-200"
          >
            <ChevronLeft class="w-6 h-6 text-white" />
          </button>
          
          <button 
            v-if="images.length > 1"
            @click.stop="nextImage"
            class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-3 transition-all duration-200"
          >
            <ChevronRight class="w-6 h-6 text-white" />
          </button>
        </div>

        <!-- Miniatures -->
        <div v-if="images.length > 1" class="flex justify-center mt-4 space-x-2 overflow-x-auto">
          <button 
            v-for="(image, index) in images" 
            :key="index"
            @click.stop="modalImageIndex = index"
            class="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden"
            :class="{
              'ring-2 ring-white': index === modalImageIndex,
              'opacity-60': index !== modalImageIndex
            }"
          >
            <img 
              :src="image" 
              :alt="`Miniature ${index + 1}`"
              class="w-full h-full object-cover"
            />
          </button>
        </div>

        <!-- Compteur d'images -->
        <div class="text-center mt-4 text-white">
          <span class="text-sm">{{ modalImageIndex + 1 }} / {{ images.length }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ZoomIn, Camera, X, ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps<{
  images: string[]
}>()

const isModalOpen = ref(false)
const modalImageIndex = ref(0)
const currentImageIndex = ref(0)

const openModal = (index: number) => {
  modalImageIndex.value = index
  isModalOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  isModalOpen.value = false
  document.body.style.overflow = 'auto'
}

const nextImage = () => {
  modalImageIndex.value = (modalImageIndex.value + 1) % props.images.length
}

const previousImage = () => {
  modalImageIndex.value = modalImageIndex.value === 0 
    ? props.images.length - 1 
    : modalImageIndex.value - 1
}

// Navigation au clavier
const handleKeydown = (event: KeyboardEvent) => {
  if (!isModalOpen.value) return
  
  switch (event.key) {
    case 'Escape':
      closeModal()
      break
    case 'ArrowLeft':
      previousImage()
      break
    case 'ArrowRight':
      nextImage()
      break
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = 'auto'
})
</script>

