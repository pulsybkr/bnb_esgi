# Documentation des APIs - BnB ESGI

## 📋 Résumé des APIs disponibles

Toutes les APIs demandées sont **déjà implémentées** et fonctionnelles.

---

## 🏠 APIs Logements

### 1. API Détail Logement
- **Endpoint**: `GET /logements/:id`
- **Description**: Récupère les détails d'un logement spécifique
- **Authentification**: Non requise (route publique)
- **Paramètres**: 
  - `id` (path) - ID du logement
- **Réponse**: 
  ```json
  {
    "success": true,
    "data": {
      "property": { ... }
    }
  }
  ```

### 2. API Liste Logements (avec pagination)
- **Endpoint**: `GET /logements`
- **Description**: Récupère la liste des logements avec filtres et pagination
- **Authentification**: Non requise (route publique)
- **Paramètres de requête**:
  - `city` (string) - Filtrer par ville
  - `country` (string) - Filtrer par pays
  - `type` (string) - Type de logement (maison, appartement, chambre, hotel)
  - `minPrice` (number) - Prix minimum
  - `maxPrice` (number) - Prix maximum
  - `minCapacity` (integer) - Capacité minimale
  - `status` (string) - Statut (actif, suspendu, archive) - défaut: actif
  - `page` (integer) - Numéro de page (défaut: 1)
  - `limit` (integer) - Résultats par page (défaut: 20, max: 100)
  - `sortBy` (string) - Trier par (createdAt, pricePerNight, averageRating, title)
  - `sortOrder` (string) - Ordre (asc, desc) - défaut: desc
- **Réponse**:
  ```json
  {
    "success": true,
    "data": {
      "properties": [...],
      "total": 50,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
  ```

### 3. API Création Logement
- **Endpoint**: `POST /logements`
- **Description**: Crée un nouveau logement
- **Authentification**: Requise (propriétaire ou admin)
- **Body**: FormData ou JSON avec les champs du logement
  - `title`, `description`, `address`, `city`, `country`
  - `type`, `roomCount`, `capacity`, `bedrooms`, `bathrooms`
  - `pricePerNight` ou `price`, `currency`
  - `amenities`, `houseRules`, `tags`, `services`
  - `checkIn`, `checkOut`
  - `images` (fichiers)
- **Réponse**: 
  ```json
  {
    "success": true,
    "message": "Property created successfully",
    "data": {
      "property": { ... }
    }
  }
  ```

### 4. API Modification Logement
- **Endpoint**: `PUT /logements/:id`
- **Description**: Met à jour un logement existant
- **Authentification**: Requise (propriétaire du logement ou admin)
- **Paramètres**:
  - `id` (path) - ID du logement
- **Body**: JSON avec les champs à mettre à jour
- **Réponse**:
  ```json
  {
    "success": true,
    "message": "Property updated successfully",
    "data": {
      "property": { ... }
    }
  }
  ```

### 5. API Suppression Logement
- **Endpoint**: `DELETE /logements/:id`
- **Description**: Supprime un logement (impossible si réservations actives)
- **Authentification**: Requise (propriétaire du logement ou admin)
- **Paramètres**:
  - `id` (path) - ID du logement
- **Réponse**:
  ```json
  {
    "success": true,
    "message": "Property deleted successfully"
  }
  ```

### 6. API Mes Logements
- **Endpoint**: `GET /logements/my`
- **Description**: Récupère tous les logements de l'utilisateur connecté
- **Authentification**: Requise
- **Paramètres de requête**:
  - `status` (string) - Filtrer par statut
  - `sortBy` (string) - Trier par
  - `sortOrder` (string) - Ordre de tri

---

## 📅 APIs Disponibilités (CRUD complet)

### 1. API Créer Disponibilité / Blocage
- **Endpoint**: `POST /logements/:id/availabilities`
- **Description**: Crée une période de disponibilité ou de blocage
- **Authentification**: Requise (propriétaire du logement)
- **Paramètres**:
  - `id` (path) - ID du logement
- **Body**:
  ```json
  {
    "startDate": "2026-02-01",
    "endDate": "2026-02-28",
    "status": "disponible" | "reserve" | "bloque",
    "customPrice": 60000,
    "note": "Haute saison"
  }
  ```
- **Pour bloquer des dates**: Utiliser `status: "bloque"`

### 2. API Lire Disponibilités
- **Endpoint**: `GET /logements/:id/availabilities`
- **Description**: Récupère toutes les disponibilités d'un logement
- **Authentification**: Non requise (route publique)
- **Paramètres**:
  - `id` (path) - ID du logement
- **Paramètres de requête**:
  - `startDate` (date) - Filtrer à partir de cette date
  - `endDate` (date) - Filtrer jusqu'à cette date
  - `status` (string) - Filtrer par statut
- **Réponse**:
  ```json
  {
    "success": true,
    "data": {
      "availabilities": [...]
    }
  }
  ```

### 3. API Dates Disponibles
- **Endpoint**: `GET /logements/:id/available-dates`
- **Description**: Récupère uniquement les dates disponibles dans une plage
- **Authentification**: Non requise (route publique)
- **Paramètres**:
  - `id` (path) - ID du logement
- **Paramètres de requête**:
  - `startDate` (date, requis) - Date de début
  - `endDate` (date, requis) - Date de fin
- **Réponse**:
  ```json
  {
    "success": true,
    "data": {
      "availableDates": [...]
    }
  }
  ```

### 4. API Mettre à jour Disponibilité
- **Endpoint**: `PUT /availabilities/:id`
- **Description**: Met à jour une période de disponibilité
- **Authentification**: Requise
- **Paramètres**:
  - `id` (path) - ID de la disponibilité
- **Body**: Même structure que pour la création (champs optionnels)

### 5. API Supprimer Disponibilité
- **Endpoint**: `DELETE /availabilities/:id`
- **Description**: Supprime une période de disponibilité (impossible si réservée)
- **Authentification**: Requise
- **Paramètres**:
  - `id` (path) - ID de la disponibilité
- **Réponse**:
  ```json
  {
    "success": true,
    "message": "Availability period deleted successfully"
  }
  ```

### 6. API Création en Masse
- **Endpoint**: `POST /logements/:id/availabilities/bulk`
- **Description**: Crée plusieurs périodes de disponibilité en une seule requête
- **Authentification**: Requise (propriétaire du logement)
- **Body**:
  ```json
  {
    "periods": [
      {
        "startDate": "2026-02-01",
        "endDate": "2026-02-28",
        "status": "disponible"
      },
      {
        "startDate": "2026-03-01",
        "endDate": "2026-03-31",
        "customPrice": 70000
      }
    ]
  }
  ```

---

## 📝 Notes importantes

1. **Toutes les APIs sont déjà implémentées** et fonctionnelles
2. **Documentation Swagger**: Disponible sur `/api-docs`
3. **Format de dates**: Utiliser le format ISO (YYYY-MM-DD)
4. **Authentification**: Bearer token dans le header `Authorization: Bearer <token>` ou cookie `accessToken`
5. **Validation**: Toutes les routes utilisent la validation Joi
6. **Gestion d'erreurs**: Format standardisé avec `success: false` et message d'erreur

---

## 🔗 Base URL

- **Développement**: `http://localhost:3333`
- **Production**: À configurer dans les variables d'environnement

---

---

## 🔍 APIs Recherche et Suggestions

### 1. API Suggestions Auto-complétion
- **Endpoint**: `GET /search/suggestions`
- **Description**: Fournit des suggestions pour villes, pays ou tags pour l'auto-complétion
- **Authentification**: Non requise (route publique)
- **Paramètres de requête**:
  - `type` (string, requis) - Type de suggestion: `city`, `country`, ou `tag`
  - `q` (string) - Terme de recherche (minimum 2 caractères pour villes/pays, 1 pour tags)
  - `limit` (integer, défaut: 10, max: 50) - Nombre maximum de suggestions
- **Réponse**:
  ```json
  {
    "success": true,
    "data": {
      "type": "city",
      "query": "par",
      "suggestions": ["Paris", "Parme", "Pardubice"]
    }
  }
  ```
- **Exemples**:
  - Villes: `GET /search/suggestions?type=city&q=par&limit=5`
  - Pays: `GET /search/suggestions?type=country&q=fran`
  - Tags: `GET /search/suggestions?type=tag&q=rom`

### 2. API Tags et Catégories
- **Endpoint**: `GET /search/tags`
- **Description**: Récupère tous les tags disponibles groupés par catégorie
- **Authentification**: Non requise (route publique)
- **Réponse**:
  ```json
  {
    "success": true,
    "data": {
      "categories": {
        "style": [...],
        "location": [...],
        "feature": [...],
        "audience": [...],
        "special": [...]
      },
      "allTags": [...]
    }
  }
  ```

---

## 📸 APIs Images

### 1. API Upload Multiple Images
- **Endpoint**: `POST /logements/:id/photos/upload`
- **Description**: Uploader plusieurs photos à la fois pour un logement (max 20 fichiers)
- **Authentification**: Requise (propriétaire du logement)
- **Paramètres**:
  - `id` (path) - ID du logement
- **Body**: FormData avec le champ `images` (array de fichiers)
  - Chaque fichier: max 10MB
  - Formats acceptés: images uniquement (image/*)
  - Maximum: 20 fichiers par requête
- **Réponse**:
  ```json
  {
    "success": true,
    "message": "5 photos uploaded successfully",
    "data": {
      "photos": [...]
    }
  }
  ```

### 2. API Suppression Image
- **Endpoint**: `DELETE /logements/:id/photos/:photoId`
- **Description**: Supprime une photo d'un logement
- **Authentification**: Requise (propriétaire du logement)
- **Paramètres**:
  - `id` (path) - ID du logement
  - `photoId` (path) - ID de la photo à supprimer
- **Réponse**:
  ```json
  {
    "success": true,
    "message": "Photo deleted successfully"
  }
  ```

### 3. API Ajout Photo Unique
- **Endpoint**: `POST /logements/:id/photos`
- **Description**: Ajoute une seule photo via JSON (URL)
- **Authentification**: Requise (propriétaire du logement)
- **Body**:
  ```json
  {
    "url": "https://example.com/photo.jpg",
    "thumbnailUrl": "https://example.com/photo-thumb.jpg",
    "isMain": false,
    "order": 0
  }
  ```

---

## 🔒 API Blocage Dates Spécifiques

### Endpoint pour Bloquer des Dates
- **Endpoint**: `POST /logements/:id/availabilities`
- **Description**: Créer une période de blocage (ou disponibilité)
- **Authentification**: Requise (propriétaire du logement)
- **Body**:
  ```json
  {
    "startDate": "2026-02-15",
    "endDate": "2026-02-20",
    "status": "bloque",
    "note": "Maintenance programmée"
  }
  ```
- **Statuts disponibles**:
  - `disponible` - Période disponible pour réservation
  - `reserve` - Période déjà réservée
  - `bloque` - Période bloquée (maintenance, indisponibilité, etc.)

---

## 🔎 API Recherche par Critères Simples

L'API de recherche est déjà disponible via l'endpoint de liste avec filtres :
- **Endpoint**: `GET /logements`
- **Description**: Recherche avec critères multiples et pagination
- **Critères disponibles**:
  - `city` - Ville
  - `country` - Pays
  - `type` - Type de logement
  - `minPrice` / `maxPrice` - Fourchette de prix
  - `minCapacity` - Capacité minimale
  - `status` - Statut du logement
  - `page` / `limit` - Pagination
  - `sortBy` / `sortOrder` - Tri
- **Exemple**: 
  ```
  GET /logements?city=Paris&minPrice=50&maxPrice=200&type=appartement&page=1&limit=20
  ```

---

## 📚 Documentation complète

Pour la documentation interactive complète avec exemples, accéder à:
- **Swagger UI**: `http://localhost:3333/api-docs`
- **Swagger JSON**: `http://localhost:3333/api-docs.json`

