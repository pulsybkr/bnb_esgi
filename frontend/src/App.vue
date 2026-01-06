<template>
  <RouterView />
  <ToastContainer />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import { useAuth } from '@/composables/useAuth'

const { loadProfile } = useAuth()

// Load user profile on app mount (restore session from cookies)
onMounted(async () => {
  console.log('🔄 Attempting to restore user session from cookies...')
  try {
    const success = await loadProfile()
    if (success) {
      console.log('✅ User session restored successfully')
    } else {
      console.log('⚠️ Failed to restore user session')
    }
  } catch (error) {
    console.log('❌ Error restoring session:', error)
  }
})
</script>
