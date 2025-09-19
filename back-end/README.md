# Backend BnB ESGI

API REST pour l'application BnB ESGI développée avec AdonisJS.

## Technologies utilisées

- **Framework** : AdonisJS 6
- **Langage** : TypeScript
- **Base de données** : PostgreSQL avec Lucid ORM
- **Authentification** : JWT avec @adonisjs/auth
- **Validation** : VineJS

## Prérequis

- Node.js 20+ ou 22+
- PostgreSQL 15+
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
cp .env.example .env
```

Variables importantes à configurer :

- `APP_KEY` : Clé secrète pour le chiffrement (générez-en une aléatoire)
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE` : Configuration PostgreSQL
- `JWT_SECRET` : Clé secrète pour les tokens JWT
- `CORS_ORIGIN` : URL du frontend (par défaut : <http://localhost:5173>)

### Base de données

Assurez-vous que PostgreSQL est en cours d'exécution, puis :

```bash
# Exécuter les migrations
npm run migration:run

# Optionnel : Alimenter la base avec des données de test
npm run db:seed
```

## Lancement

### Mode développement

```bash
npm run dev
```

Le serveur démarre sur <http://localhost:3333> avec rechargement à chaud (HMR).

### Mode production

```bash
# Build de l'application
npm run build

# Démarrage du serveur
npm run start
```

## Scripts disponibles

```bash
npm run dev              # Démarrage développement avec HMR
npm run build            # Build pour la production
npm run start            # Démarrage production
npm run test             # Exécution des tests
npm run lint             # Vérification ESLint
npm run format           # Formatage avec Prettier
npm run typecheck        # Vérification des types TypeScript
npm run migration:run    # Exécution des migrations
npm run db:seed          # Alimentation de la base de données
```

## Structure du projet

```text
back-end/
├── app/
│   ├── controllers/     # Contrôleurs de l'API
│   ├── models/         # Modèles de données
│   ├── middleware/     # Middlewares personnalisés
│   └── exceptions/     # Gestion des erreurs
├── database/
│   └── migrations/     # Scripts de migration
├── config/             # Configuration de l'application
├── start/              # Routes et configuration de démarrage
├── tests/              # Tests unitaires et d'intégration
└── bin/                # Scripts de démarrage
```

## API Endpoints

### Authentification

- `POST /api/auth/login` - Connexion utilisateur
- `POST /api/auth/register` - Inscription utilisateur
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Informations utilisateur connecté

### Utilisateurs

- `GET /api/users` - Liste des utilisateurs
- `GET /api/users/:id` - Détails d'un utilisateur
- `PUT /api/users/:id` - Mise à jour d'un utilisateur
- `DELETE /api/users/:id` - Suppression d'un utilisateur

## Tests

```bash
# Exécution de tous les tests
npm run test

# Tests avec couverture
npm run test -- --coverage
```

## Développement

### Créer un nouveau contrôleur

```bash
node ace make:controller NomController
```

### Créer un nouveau modèle

```bash
node ace make:model NomModel
```

### Créer une migration

```bash
node ace make:migration nom_migration
```

## Docker

Pour lancer uniquement le backend avec Docker :

```bash
docker build -t bnb-backend .
docker run -p 3333:3333 bnb-backend
```

Ou utiliser Docker Compose depuis la racine du projet :

```bash
docker-compose up backend
```

## Déploiement

1. Build de l'application :

   ```bash
   npm run build
   ```

2. Configuration des variables d'environnement pour la production

3. Démarrage :

   ```bash
   npm run start
   ```

## Support

Pour toute question ou problème, consultez la documentation d'AdonisJS : <https://docs.adonisjs.com/>
