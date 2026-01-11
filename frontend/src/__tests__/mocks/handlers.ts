import { http, HttpResponse } from 'msw'

// Handlers communs pour les tests
// Ces handlers peuvent être surchargés dans les tests individuels

export const handlers = [
  // Handler par défaut pour les routes non mockées
  http.all('*', async ({ request }) => {
    console.warn(`Unhandled request: ${request.method} ${request.url}`)
    return HttpResponse.json(
      { error: 'Unhandled request' },
      { status: 404 }
    )
  })
]

