<template>
  <div 
    class="host-avatar"
    :class="[sizeClass]"
  >
    <!-- Image avatar si disponible -->
    <img 
      v-if="hasValidAvatar"
      :src="(avatar as string)"
      :alt="name"
      class="avatar-image"
      @error="handleImageError"
    />
    <!-- Initiales si pas d'avatar -->
    <div 
      v-else
      class="avatar-initials"
      :style="{ backgroundColor: backgroundColor }"
    >
      {{ initials }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(defineProps<{
  name: string
  avatar?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
}>(), {
  size: 'md',
  avatar: null
})

// État pour gérer les erreurs d'image
const imageError = ref(false)

// Vérifie si l'avatar est valide
const hasValidAvatar = computed(() => {
  if (imageError.value) return false
  if (!props.avatar) return false
  if (props.avatar === '/placeholder-avatar.jpg') return false
  if (props.avatar.trim() === '') return false
  return true
})

// Calcule les initiales à partir du nom
const initials = computed(() => {
  if (!props.name) return '?'
  
  const parts = props.name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }
  
  // Prendre la première lettre du prénom et du nom
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
})

// Génère une couleur de fond basée sur le nom
const backgroundColor = computed(() => {
  const colors = [
    '#059669', // Emerald
    '#0891B2', // Cyan
    '#7C3AED', // Violet
    '#DB2777', // Pink
    '#EA580C', // Orange
    '#CA8A04', // Yellow
    '#16A34A', // Green
    '#2563EB', // Blue
    '#9333EA', // Purple
    '#DC2626', // Red
  ]
  
  // Hash simple basé sur le nom pour avoir une couleur consistante
  let hash = 0
  for (let i = 0; i < props.name.length; i++) {
    hash = props.name.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
})

// Classe de taille
const sizeClass = computed(() => `size-${props.size}`)

// Gestion des erreurs d'image
const handleImageError = () => {
  imageError.value = true
}
</script>

<style scoped>
.host-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  text-transform: uppercase;
}

/* Tailles */
.size-sm {
  width: 32px;
  height: 32px;
}

.size-sm .avatar-initials {
  font-size: 12px;
}

.size-md {
  width: 48px;
  height: 48px;
}

.size-md .avatar-initials {
  font-size: 16px;
}

.size-lg {
  width: 64px;
  height: 64px;
}

.size-lg .avatar-initials {
  font-size: 20px;
}

.size-xl {
  width: 96px;
  height: 96px;
}

.size-xl .avatar-initials {
  font-size: 28px;
}
</style>
