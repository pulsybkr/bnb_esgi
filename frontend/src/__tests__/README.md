# Tests d'intégration - Frontend

Ce dossier contient les tests d'intégration pour le frontend de l'application BnB ESGI.

## Structure

```
src/__tests__/
├── integration/          # Tests d'intégration par fonctionnalité
│   ├── auth.integration.test.ts
│   ├── reservation.integration.test.ts
│   ├── property.integration.test.ts
│   ├── messaging.integration.test.ts
│   ├── search.integration.test.ts
│   ├── payment.integration.test.ts
│   └── reviews.integration.test.ts
├── mocks/                # Mocks et serveurs de test
│   ├── server.ts
│   └── handlers.ts
├── setup.ts              # Configuration globale des tests
└── README.md            # Ce fichier
```

## Prérequis

- Node.js 20+ installé
- Dépendances installées : `npm install`

## Exécution des tests

### Tous les tests
```bash
npm test
```

### Tests d'intégration uniquement
```bash
npm run test:integration
```

### Mode watch (développement)
```bash
npm test -- --watch
```

### Interface graphique
```bash
npm run test:ui
```

### Avec couverture de code
```bash
npm run test:coverage
```

## Technologies utilisées

- **Vitest** : Framework de test
- **Vue Test Utils** : Utilitaires pour tester les composants Vue
- **MSW (Mock Service Worker)** : Mocking des requêtes HTTP
- **jsdom** : Environnement DOM pour les tests

## Fonctionnalités testées

### 1. Authentification (`auth.integration.test.ts`)
- Connexion utilisateur
- Inscription
- Déconnexion
- Chargement du profil
- Mise à jour du profil

### 2. Réservations (`reservation.integration.test.ts`)
- Création de réservation
- Calcul du montant total
- Vérification de disponibilité
- Acceptation/Rejet (propriétaire)
- Annulation
- Chargement des réservations

### 3. Gestion des logements (`property.integration.test.ts`)
- Upload de photos (Cloudinary)
- Création de logement
- Validation des données
- Mise à jour de logement
- Récupération des logements

### 4. Messagerie (`messaging.integration.test.ts`)
- Envoi de messages
- Réception en temps réel (WebSocket)
- Chargement des conversations
- Indicateurs de frappe
- Marquage des messages comme lus

### 5. Recherche (`search.integration.test.ts`)
- Recherche de base
- Filtres avancés
- Recherche géolocalisée
- Tri et pagination
- Recherche avec dates

### 6. Paiements (`payment.integration.test.ts`)
- Paiement par carte bancaire
- Paiement Mobile Money
- Paiement PayPal
- Historique des paiements
- Remboursement

### 7. Avis et notations (`reviews.integration.test.ts`)
- Création d'avis
- Récupération des avis
- Mise à jour d'avis
- Suppression d'avis
- Filtrage et tri

## Mocking

Les tests utilisent MSW (Mock Service Worker) pour mocker les requêtes HTTP vers l'API backend. Les handlers sont définis dans chaque fichier de test.

### Exemple de mock

```typescript
server.use(
  http.post('http://localhost:3333/auth/login', async ({ request }) => {
    const body = await request.json() as any
    return HttpResponse.json({
      success: true,
      data: { user: {...}, accessToken: '...' }
    })
  })
)
```

## Bonnes pratiques

1. **Isolation** : Chaque test est indépendant et nettoie son état
2. **Mocks** : Utilisez MSW pour mocker les API, pas les services directement
3. **Composants** : Testez le comportement, pas l'implémentation
4. **Async** : Utilisez `await` et `nextTick()` pour les opérations asynchrones
5. **Assertions** : Vérifiez les résultats attendus, pas les détails d'implémentation

## Dépannage

### Les tests échouent avec des erreurs de module
```bash
# Réinstallez les dépendances
rm -rf node_modules package-lock.json
npm install
```

### Erreurs de timeout
Augmentez le timeout dans `vitest.config.ts` :
```typescript
test: {
  testTimeout: 10000
}
```

### Problèmes avec MSW
Assurez-vous que le serveur MSW est correctement configuré dans `setup.ts`.

