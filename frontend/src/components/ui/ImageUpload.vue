<template>
  <div class="w-full">
    <!-- Zone de drag & drop -->
    <div
      ref="dropZoneRef"
      @drop.prevent="handleDrop"
      @dragover.prevent="isDragging = true"
      @dragenter.prevent="isDragging = true"
      @dragleave.prevent="handleDragLeave"
      @click="triggerFileInput"
      :class="[
        'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200',
        isDragging
          ? 'border-red-500 bg-red-50'
          : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
      ]"
    >
      <input
        ref="fileInputRef"
        type="file"
        multiple
        accept="image/*"
        @change="handleFileSelect"
        class="hidden"
      />
      
      <div class="flex flex-col items-center justify-center space-y-4">
        <Upload class="w-12 h-12 text-gray-400" />
        <div>
          <p class="text-sm font-medium text-gray-700">
            Glissez-déposez vos images ici, ou
            <span class="text-red-600 hover:text-red-700 underline">cliquez pour parcourir</span>
          </p>
          <p class="text-xs text-gray-500 mt-1">
            PNG, JPG, WEBP jusqu'à 10MB (max {{ maxFiles }} images)
          </p>
        </div>
      </div>
    </div>

    <!-- Liste des images avec prévisualisation -->
    <div v-if="images.length > 0" class="mt-6">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="(image, index) in images"
          :key="image.id"
          :data-index="index"
          :draggable="reorderable"
          @dragstart="handleDragStart($event, index)"
          @dragover.prevent="handleDragOver($event, index)"
          @dragenter.prevent="handleDragEnter($event, index)"
          @dragleave="handleDragLeaveReorder($event)"
          @drop.prevent="handleDropReorder($event, index)"
          @dragend="handleDragEnd"
          :class="[
            'relative group aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-move',
            draggingIndex === index
              ? 'border-red-500 bg-red-50 opacity-50 scale-95'
              : dragOverIndex === index
              ? 'border-blue-500 bg-blue-50 scale-105'
              : 'border-gray-200 bg-gray-50'
          ]"
        >
          <!-- Image preview -->
          <img
            :src="image.preview"
            :alt="`Preview ${index + 1}`"
            class="w-full h-full object-cover pointer-events-none"
            draggable="false"
          />
          
          <!-- Overlay avec actions -->
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center space-x-2 pointer-events-none">
            <!-- Bouton supprimer -->
            <button
              @click.stop="removeImage(index)"
              class="opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-all duration-200 transform hover:scale-110 z-10 pointer-events-auto"
              :aria-label="`Supprimer l'image ${index + 1}`"
              type="button"
            >
              <X class="w-4 h-4" />
            </button>
            
            <!-- Bouton réorganiser (si activé) -->
            <div
              v-if="reorderable"
              class="opacity-0 group-hover:opacity-100 flex flex-col space-y-1 z-10 pointer-events-auto"
            >
              <button
                v-if="index > 0"
                @click.stop="moveImage(index, index - 1)"
                class="bg-gray-700 hover:bg-gray-600 text-white rounded-full p-1.5 transition-all duration-200 transform hover:scale-110"
                :aria-label="`Déplacer l'image ${index + 1} vers le haut`"
                type="button"
              >
                <ChevronUp class="w-3 h-3" />
              </button>
              <button
                v-if="index < images.length - 1"
                @click.stop="moveImage(index, index + 1)"
                class="bg-gray-700 hover:bg-gray-600 text-white rounded-full p-1.5 transition-all duration-200 transform hover:scale-110"
                :aria-label="`Déplacer l'image ${index + 1} vers le bas`"
                type="button"
              >
                <ChevronDown class="w-3 h-3" />
              </button>
            </div>
          </div>

          <!-- Badge numéro -->
          <div class="absolute top-2 left-2 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded z-10">
            {{ index + 1 }}
          </div>

          <!-- Icône de drag (en bas à droite) -->
          <div
            v-if="reorderable"
            class="absolute bottom-2 right-2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none"
          >
            <GripVertical class="w-3 h-3" />
          </div>

          <!-- Indicateur de chargement -->
          <div
            v-if="image.uploading"
            class="absolute inset-0 bg-black/50 flex items-center justify-center"
          >
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>

          <!-- Barre de progression -->
          <div
            v-if="image.uploadProgress !== undefined && image.uploadProgress < 100"
            class="absolute bottom-0 left-0 right-0 h-1 bg-gray-200"
          >
            <div
              class="h-full bg-red-500 transition-all duration-300"
              :style="{ width: `${image.uploadProgress}%` }"
            ></div>
          </div>

          <!-- Erreur -->
          <div
            v-if="image.error"
            class="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-xs p-2"
          >
            {{ image.error }}
          </div>
        </div>
      </div>

      <!-- Bouton pour ajouter plus d'images -->
      <button
        v-if="images.length < maxFiles"
        @click="triggerFileInput"
        type="button"
        class="mt-4 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
      >
        <Plus class="w-4 h-4" />
        <span>Ajouter des images</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { Upload, X, GripVertical, Plus, ChevronUp, ChevronDown } from 'lucide-vue-next'

export interface UploadImage {
  id: string
  file: File
  preview: string
  uploading?: boolean
  uploadProgress?: number
  error?: string
}

interface Props {
  modelValue?: File[]
  maxFiles?: number
  maxSize?: number // en MB
  reorderable?: boolean
  autoUpload?: boolean
  autoResize?: boolean // Redimensionner automatiquement
  maxWidth?: number // Largeur max en px (défaut: 1920)
  maxHeight?: number // Hauteur max en px (défaut: 1920)
  quality?: number // Qualité JPEG/WebP (0-1, défaut: 0.9)
}

const props = withDefaults(defineProps<Props>(), {
  maxFiles: 10,
  maxSize: 10,
  reorderable: true,
  autoUpload: false,
  autoResize: true,
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.9,
})

const emit = defineEmits<{
  'update:modelValue': [files: File[]]
  'upload': [files: File[]]
  'remove': [index: number]
  'error': [error: string]
}>()

const dropZoneRef = ref<HTMLElement>()
const fileInputRef = ref<HTMLInputElement>()
const isDragging = ref(false)
const images = ref<UploadImage[]>([])
const dragOverCounter = ref(0)
const draggingIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

// Générer un ID unique
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Validation du fichier
const validateFile = (file: File): string | null => {
  // Vérifier le type
  if (!file.type.startsWith('image/')) {
    return 'Le fichier doit être une image'
  }

  // Vérifier la taille (en MB)
  const maxSizeBytes = props.maxSize * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return `L'image ne doit pas dépasser ${props.maxSize}MB`
  }

  return null
}

// Redimensionner et compresser une image
const resizeImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Calculer les nouvelles dimensions en gardant le ratio
        // Redimensionner seulement si nécessaire
        if (width > props.maxWidth || height > props.maxHeight) {
          const ratio = Math.min(props.maxWidth / width, props.maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Impossible de créer le contexte canvas'))
          return
        }

        // Dessiner l'image redimensionnée
        ctx.drawImage(img, 0, 0, width, height)

        // Convertir en blob puis en File
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Erreur lors de la compression'))
              return
            }

            // Créer un nouveau File avec le blob compressé
            const resizedFile = new File(
              [blob],
              file.name,
              {
                type: file.type === 'image/png' ? 'image/png' : 'image/jpeg',
                lastModified: Date.now()
              }
            )
            resolve(resizedFile)
          },
          file.type === 'image/png' ? 'image/png' : 'image/jpeg',
          props.quality
        )
      }

      img.onerror = () => {
        reject(new Error('Erreur lors du chargement de l\'image'))
      }

      img.src = e.target?.result as string
    }

    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'))
    }

    reader.readAsDataURL(file)
  })
}

// Créer un objet UploadImage à partir d'un File
const createUploadImage = async (file: File): Promise<UploadImage> => {
  const error = validateFile(file)
  if (error) {
    return {
      id: generateId(),
      file,
      preview: URL.createObjectURL(file),
      error,
    }
  }

  try {
    // Redimensionner si activé
    let processedFile = file
    if (props.autoResize && file.type !== 'image/gif') {
      // Ne pas redimensionner les GIFs (pour préserver l'animation)
      // Pour les autres formats, on redimensionne toujours pour optimiser
      processedFile = await resizeImage(file)
    }

    return {
      id: generateId(),
      file: processedFile,
      preview: URL.createObjectURL(processedFile),
    }
  } catch (err) {
    return {
      id: generateId(),
      file,
      preview: URL.createObjectURL(file),
      error: 'Erreur lors du traitement de l\'image',
    }
  }
}

// Gérer la sélection de fichiers
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    processFiles(Array.from(target.files))
  }
  // Reset l'input pour permettre de sélectionner les mêmes fichiers
  if (target) {
    target.value = ''
  }
}

// Gérer le drop
const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  dragOverCounter.value = 0
  
  const files = event.dataTransfer?.files
  if (files) {
    processFiles(Array.from(files))
  }
}

// Gérer le drag leave
const handleDragLeave = (event: DragEvent) => {
  dragOverCounter.value--
  if (dragOverCounter.value <= 0) {
    isDragging.value = false
    dragOverCounter.value = 0
  }
}

// Traiter les fichiers
const processFiles = async (files: File[]) => {
  const remainingSlots = props.maxFiles - images.value.length
  
  if (remainingSlots <= 0) {
    emit('error', `Vous ne pouvez pas ajouter plus de ${props.maxFiles} images`)
    return
  }

  const filesToAdd = files.slice(0, remainingSlots)
  
  if (files.length > remainingSlots) {
    emit('error', `Seulement ${remainingSlots} image(s) supplémentaire(s) autorisée(s)`)
  }

  // Traiter les images de manière asynchrone
  const processingPromises = filesToAdd.map(file => createUploadImage(file))
  const newImages = await Promise.all(processingPromises)
  
  images.value.push(...newImages)
  
  updateModelValue()

  if (props.autoUpload) {
    uploadImages(newImages.map(img => img.file))
  }
}

// Déclencher le sélecteur de fichiers
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

// Supprimer une image
const removeImage = (index: number) => {
  const image = images.value[index]
  // Libérer l'URL de l'objet
  URL.revokeObjectURL(image.preview)
  images.value.splice(index, 1)
  updateModelValue()
  emit('remove', index)
}

// Mettre à jour la valeur du modèle
const updateModelValue = () => {
  const files = images.value.map(img => img.file)
  emit('update:modelValue', files)
}

// Gérer le début du drag (HTML5 Drag & Drop)
const handleDragStart = (event: DragEvent, index: number) => {
  if (!props.reorderable) {
    event.preventDefault()
    return
  }

  draggingIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', index.toString())
    // Créer une image personnalisée pour le drag (optionnel)
    if (event.target instanceof HTMLElement) {
      const dragImage = event.target.cloneNode(true) as HTMLElement
      dragImage.style.opacity = '0.5'
      document.body.appendChild(dragImage)
      event.dataTransfer.setDragImage(dragImage, 0, 0)
      setTimeout(() => document.body.removeChild(dragImage), 0)
    }
  }
}

// Gérer le survol pendant le drag
const handleDragOver = (event: DragEvent, index: number) => {
  if (!props.reorderable || draggingIndex.value === null) return
  if (draggingIndex.value !== index) {
    dragOverIndex.value = index
  }
}

// Gérer l'entrée dans une zone de drop
const handleDragEnter = (event: DragEvent, index: number) => {
  if (!props.reorderable || draggingIndex.value === null) return
  if (draggingIndex.value !== index) {
    dragOverIndex.value = index
  }
}

// Gérer la sortie d'une zone de drop lors du réordonnancement
const handleDragLeaveReorder = (event: DragEvent) => {
  // Vérifier si on quitte vraiment l'élément (pas juste un enfant)
  const target = event.target as HTMLElement
  const relatedTarget = event.relatedTarget as HTMLElement
  if (!target.contains(relatedTarget)) {
    dragOverIndex.value = null
  }
}

// Gérer le drop pour réorganiser
const handleDropReorder = (event: DragEvent, dropIndex: number) => {
  if (!props.reorderable || draggingIndex.value === null) return

  const dragIndex = draggingIndex.value

  if (dragIndex !== dropIndex && dragIndex >= 0 && dropIndex >= 0 && dragIndex < images.value.length && dropIndex < images.value.length) {
    // Réorganiser les images
    const dragElement = images.value[dragIndex]
    images.value.splice(dragIndex, 1)
    images.value.splice(dropIndex, 0, dragElement)
    updateModelValue()
  }

  draggingIndex.value = null
  dragOverIndex.value = null
}

// Gérer la fin du drag
const handleDragEnd = () => {
  draggingIndex.value = null
  dragOverIndex.value = null
}

// Déplacer une image (boutons haut/bas)
const moveImage = (fromIndex: number, toIndex: number) => {
  if (!props.reorderable) return
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= images.value.length || toIndex >= images.value.length) return
  if (fromIndex === toIndex) return

  const dragElement = images.value[fromIndex]
  images.value.splice(fromIndex, 1)
  images.value.splice(toIndex, 0, dragElement)
  updateModelValue()
}

// Upload des images (pour intégration future avec API)
const uploadImages = async (files: File[]) => {
  // Cette fonction peut être étendue pour uploader vers un serveur
  // Pour l'instant, on simule juste l'upload
  files.forEach((file, index) => {
    const imageIndex = images.value.findIndex(img => img.file === file)
    if (imageIndex !== -1) {
      images.value[imageIndex].uploading = true
      images.value[imageIndex].uploadProgress = 0
      
      // Simulation d'upload (à remplacer par un vrai upload)
      const interval = setInterval(() => {
        if (images.value[imageIndex].uploadProgress !== undefined) {
          images.value[imageIndex].uploadProgress! += 10
          if (images.value[imageIndex].uploadProgress! >= 100) {
            clearInterval(interval)
            images.value[imageIndex].uploading = false
            images.value[imageIndex].uploadProgress = undefined
          }
        }
      }, 200)
    }
  })

  emit('upload', files)
}

// Nettoyage des URLs d'objets lors de la destruction du composant
onUnmounted(() => {
  images.value.forEach(img => URL.revokeObjectURL(img.preview))
})

// Exposer des méthodes pour le parent
defineExpose({
  upload: uploadImages,
  clear: () => {
    images.value.forEach(img => URL.revokeObjectURL(img.preview))
    images.value = []
    updateModelValue()
  },
  getFiles: () => images.value.map(img => img.file),
})
</script>

