import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Handlers par défaut pour les routes communes
export const server = setupServer(
  // Handlers seront ajoutés dans les fichiers de test individuels
  // ou peuvent être définis ici pour des routes communes
)

