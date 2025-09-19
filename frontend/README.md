# Frontend BnB ESGI

Interface utilisateur pour l'application BnB ESGI, plateforme de location de biens immobiliers développée avec Vue.js 3.

## Technologies utilisées

- **Framework** : Vue.js 3 (Composition API)
- **Langage** : TypeScript
- **Styling** : TailwindCSS 4
- **Outil de build** : Vite
- **UI Components** : shadcn-vue, Lucide Icons
- **Linting** : ESLint
- **Formatage** : Prettier

## Prérequis

- Node.js 20+ ou 22+
- npm ou yarn

## Installation

```bash
# Installation des dépendances
npm install
```

## Configuration

### Variables d'environnement

Copiez le fichier d'exemple et configurez vos variables :

```bash
cp env.example .env
```

Variables importantes :

- `VITE_API_URL` : URL de l'API backend (par défaut : <http://localhost:3333>)
- `VITE_APP_NAME` : Nom de l'application
- `VITE_APP_VERSION` : Version de l'application

## Lancement

### Mode développement

```bash
npm run dev
```

L'application sera disponible sur <http://localhost:5173> avec rechargement à chaud.

### Mode production

```bash
# Build de l'application
npm run build

# Prévisualisation du build
npm run preview
```

## Scripts disponibles

```bash
npm run dev          # Démarrage développement avec HMR
npm run build        # Build pour la production
npm run preview      # Prévisualisation du build de production
npm run type-check   # Vérification des types TypeScript
npm run lint         # Vérification et correction ESLint
npm run format       # Formatage avec Prettier
```

## Structure du projet

```text
frontend/
├── src/
│   ├── components/   # Composants réutilisables
│   ├── views/        # Pages/Vues de l'application
│   ├── lib/          # Utilitaires et configurations
│   ├── assets/       # Ressources statiques
│   └── types/        # Définitions TypeScript
├── public/           # Fichiers publics
└── dist/             # Build de production (généré)
```

## Fonctionnalités

- 🔐 Authentification utilisateur (login/register)
- 🏠 Gestion des annonces de location
- 👤 Profils utilisateurs
- 📱 Interface responsive
- 🎨 Design moderne avec TailwindCSS

## Développement

### Configuration IDE recommandée

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (désactivez Vetur si installé).

### Support TypeScript pour les imports `.vue`

TypeScript ne gère pas nativement les imports `.vue`. Nous utilisons `vue-tsc` pour la vérification des types et l'extension Volar pour l'IDE.

### Créer un nouveau composant

```bash
# Structure recommandée dans src/components/
# Utilisez la Composition API de Vue 3
```

### Configuration Vite

Voir [Vite Configuration Reference](https://vite.dev/config/) pour personnaliser la configuration.

## Docker

Pour lancer uniquement le frontend avec Docker :

```bash
docker build -t bnb-frontend .
docker run -p 5173:5173 bnb-frontend
```

Ou utiliser Docker Compose depuis la racine du projet :

```bash
docker-compose up frontend
```

## Tests

Les tests peuvent être ajoutés avec Vitest (à configurer selon les besoins).

## Déploiement

1. Build de l'application :

   ```bash
   npm run build
   ```

2. Les fichiers de production seront dans le dossier `dist/`

3. Déployez le contenu du dossier `dist/` sur votre serveur web

## API Integration

L'application communique avec l'API backend via des appels HTTP. La configuration se fait dans les variables d'environnement.

Endpoints principaux :

- `/api/auth/*` - Authentification
- `/api/users/*` - Gestion des utilisateurs
- `/api/properties/*` - Gestion des biens (à implémenter)

## Support

Pour toute question concernant Vue.js, consultez :

- [Documentation Vue.js](<https://vuejs.org/>)
- [Documentation Vite](<https://vite.dev/>)
- [Documentation TailwindCSS](<https://tailwindcss.com/>)
