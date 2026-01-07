import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
import { initSentry } from './plugins/sentry'
import './index.css'

try {
  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)

  const app = createApp(App)
  app.use(pinia)
  app.use(router)

  // Initialize Sentry/GlitchTip error tracking
  initSentry({ app, router })

  app.mount('#app')
} catch (error) {
  console.error('Erreur lors du démarrage de l\'application:', error)
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1>Erreur de démarrage</h1>
      <p>Une erreur s'est produite lors du chargement de l'application.</p>
      <pre>${error instanceof Error ? error.message : String(error)}</pre>
      <p>Veuillez vérifier la console pour plus de détails.</p>
    </div>
  `
}
