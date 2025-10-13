# BnB ESGI

Application web de location de biens immobiliers développée avec Vue.js 3 pour le frontend et AdonisJS pour le backend.

## Architecture

Ce projet est organisé en trois parties principales :

- **Frontend** : Interface utilisateur développée avec Vue.js 3, TypeScript et TailwindCSS
- **Backend** : API REST développée avec AdonisJS (Node.js, TypeScript)
- **Base de données** : PostgreSQL

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- [Docker](https://www.docker.com/) et Docker Compose
- [Node.js](https://nodejs.org/) (version 20+ recommandée)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

## Installation et lancement rapide (avec Docker)

La méthode la plus simple pour lancer l'application est d'utiliser Docker Compose :

```bash
# Cloner le repository (si nécessaire)
git clone git@github.com:pulsybkr/bnb_esgi.git
cd bnb_esgi

# Lancer tous les services
docker-compose up --build

# Ou en arrière-plan
docker-compose up -d --build
```

Les services seront disponibles aux adresses suivantes :

- **Frontend** : <http://localhost:5173>
- **Backend API** : <http://localhost:3333>
- **Base de données** : <localhost:5432>
- **Adminer** (interface de gestion BD) : <http://localhost:8080>

## Installation et lancement manuel

Si vous préférez lancer les services manuellement :

### 1. Base de données

```bash
# Démarrer PostgreSQL avec Docker
docker run --name bnb_postgres -e POSTGRES_DB=bnb -e POSTGRES_USER=bnb_user -e POSTGRES_PASSWORD=bnb_password -p 5432:5432 -d postgres:15
```

### 2. Backend

```bash
cd back-end
npm install
npm run migration:run  # Créer les tables
npm run dev            # Lancer en mode développement
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

## Structure du projet

```text
bnb_esgi/
├── frontend/          # Application Vue.js
├── back-end/          # API AdonisJS
├── docker-compose.yml # Configuration Docker
└── README.md         # Ce fichier
```

## Scripts disponibles

### Backend (dans le dossier `back-end/`)

```bash
npm run dev          # Démarrage en mode développement avec HMR
npm run build        # Build pour la production
npm run start        # Démarrage en production
npm run test         # Exécution des tests
npm run lint         # Vérification du code
npm run migration:run # Exécution des migrations de base de données
```

### Frontend (dans le dossier `frontend/`)

```bash
npm run dev         # Démarrage en mode développement
npm run build       # Build pour la production
npm run preview     # Prévisualisation du build
npm run lint        # Vérification du code
npm run type-check  # Vérification des types TypeScript
```

## Variables d'environnement

### Backend

Les variables d'environnement sont configurées dans `back-end/.env`. Un fichier `.env.example` est fourni comme modèle.

### Frontend

Les variables d'environnement sont configurées dans `frontend/.env`. Un fichier `env.example` est fourni comme modèle.

## Développement

Pour contribuer au projet :

1. Fork le repository
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers votre fork
5. Créer une Pull Request

## Technologies utilisées

- **Frontend** : Vue.js 3, TypeScript, TailwindCSS, Vite
- **Backend** : AdonisJS, Node.js, TypeScript, PostgreSQL
- **Base de données** : PostgreSQL
- **Conteneurisation** : Docker & Docker Compose

