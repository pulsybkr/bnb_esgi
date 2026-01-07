# 📸 API Upload Photo de Profil - Documentation

## ✅ Tâche P1-1 Complétée

Cette fonctionnalité permet aux utilisateurs authentifiés d'uploader leur photo de profil.

---

## 🔧 Configuration

### Variables d'Environnement

Ajoutez ces variables dans votre fichier `.env` :

```env
MAX_FILE_SIZE=5242880  # 5MB en bytes
UPLOAD_DIR=./uploads
```

### Dépendances Installées

- `multer` : Middleware pour gérer les uploads multipart/form-data
- `@types/multer` : Types TypeScript pour multer

---

## 📡 Endpoint API

### POST `/auth/profile/photo`

**Authentification requise** : Oui (Bearer Token)

#### Request

**Content-Type**: `multipart/form-data`

**Body Parameters**:
- `photo` (file, required) : Fichier image de profil

#### Format Autorisés
- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- WebP (`.webp`)

#### Taille Maximale
- 5 MB par défaut

#### Exemple avec cURL

```bash
curl -X POST http://localhost:3333/auth/profile/photo \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "photo=@/path/to/your/photo.jpg"
```

#### Exemple avec Fetch API (JavaScript)

```javascript
const formData = new FormData();
formData.append('photo', fileInput.files[0]);

const response = await fetch('http://localhost:3333/auth/profile/photo', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});

const result = await response.json();
console.log(result);
```

#### Exemple avec Axios (JavaScript)

```javascript
const formData = new FormData();
formData.append('photo', file);

const response = await axios.post(
  'http://localhost:3333/auth/profile/photo',
  formData,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'multipart/form-data'
    }
  }
);
```

---

## 📤 Réponses

### Succès (200 OK)

```json
{
  "success": true,
  "message": "Photo de profil mise à jour avec succès",
  "data": {
    "user": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "profilePhoto": "/uploads/profiles/profile-1641234567890-123456789.jpg",
      "userType": "locataire",
      ...
    },
    "photoUrl": "/uploads/profiles/profile-1641234567890-123456789.jpg"
  }
}
```

### Erreur - Aucun fichier (400 Bad Request)

```json
{
  "success": false,
  "message": "Aucun fichier fourni",
  "type": "validation_error"
}
```

### Erreur - Type de fichier invalide (400 Bad Request)

```json
{
  "success": false,
  "message": "Type de fichier non autorisé. Utilisez JPEG, PNG ou WebP.",
  "type": "upload_error"
}
```

### Erreur - Fichier trop volumineux (400 Bad Request)

```json
{
  "success": false,
  "message": "Fichier trop volumineux. Taille maximale: 5MB",
  "type": "file_size_error"
}
```

### Erreur - Non authentifié (401 Unauthorized)

```json
{
  "success": false,
  "message": "User not authenticated"
}
```

---

## 📁 Structure des Fichiers

### Fichiers Créés/Modifiés

1. **`src/middlewares/upload.middleware.ts`** (Nouveau)
   - Configuration Multer
   - Validation des types de fichiers
   - Gestion des erreurs d'upload

2. **`src/controllers/auth/auth.controller.ts`** (Modifié)
   - Ajout méthode `uploadProfilePhoto`

3. **`src/routes/auth/auth.routes.ts`** (Modifié)
   - Ajout route POST `/auth/profile/photo`
   - Documentation Swagger

4. **`src/server.ts`** (Modifié)
   - Middleware pour servir fichiers statiques `/uploads`

5. **`.gitignore`** (Modifié)
   - Ajout `uploads/` pour ignorer les fichiers uploadés

6. **`env.example`** (Modifié)
   - Ajout variables `MAX_FILE_SIZE` et `UPLOAD_DIR`

### Dossier de Stockage

Les photos sont stockées dans :
```
back-end/uploads/profiles/
```

**Format du nom de fichier** : `profile-{timestamp}-{random}.{ext}`

Exemple : `profile-1641234567890-123456789.jpg`

---

## 🔒 Sécurité

### Validations Implémentées

✅ **Authentification obligatoire** : Seuls les utilisateurs connectés peuvent uploader

✅ **Validation du type MIME** : Seuls JPEG, PNG, WebP autorisés

✅ **Limitation de taille** : 5MB maximum

✅ **Nom de fichier sécurisé** : Génération automatique avec timestamp + random

✅ **Dossier isolé** : Stockage dans `/uploads/profiles/`

### Recommandations

Pour la production, considérez :

1. **Stockage cloud** : AWS S3, Cloudinary, etc.
2. **Optimisation d'images** : Sharp, jimp pour redimensionner
3. **Scan antivirus** : ClamAV pour fichiers uploadés
4. **CDN** : CloudFront, CloudFlare pour servir les images

---

## 🧪 Test de l'API

### Utiliser Swagger UI

1. Démarrez le serveur : `npm run dev`
2. Accédez à : `http://localhost:3333/api-docs`
3. Trouvez l'endpoint `POST /auth/profile/photo`
4. Cliquez sur "Try it out"
5. Uploadez un fichier

### Utiliser Postman

1. Créez une nouvelle requête POST
2. URL : `http://localhost:3333/auth/profile/photo`
3. Authorization : Bearer Token (votre token JWT)
4. Body : form-data
5. Key : `photo` (type: File)
6. Value : Sélectionnez votre image
7. Send

---

## 🌐 Accès aux Images

Les images uploadées sont accessibles via :

```
http://localhost:3333/uploads/profiles/{filename}
```

Exemple :
```
http://localhost:3333/uploads/profiles/profile-1641234567890-123456789.jpg
```

Dans votre frontend, vous pouvez afficher la photo avec :

```html
<img src="http://localhost:3333/uploads/profiles/profile-1641234567890-123456789.jpg" alt="Profile" />
```

Ou avec l'URL renvoyée par l'API :

```javascript
<img src={`http://localhost:3333${user.profilePhoto}`} alt="Profile" />
```

---

## 📦 Package.json

Les dépendances ont été ajoutées automatiquement :

```json
{
  "dependencies": {
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "@types/multer": "^1.4.11"
  }
}
```

---

## ✨ Prochaines Étapes

Pour améliorer cette fonctionnalité :

- [ ] **P1-4** : Créer le composant Vue.js réutilisable `ImageUpload.vue`
- [ ] **P1-2** : Créer la page de profil utilisateur
- [ ] **P1-3** : Intégrer le formulaire d'édition de profil
- [ ] Ajouter la compression/redimensionnement d'images (Sharp)
- [ ] Migrer vers un stockage cloud (S3, Cloudinary)
- [ ] Ajouter la suppression de l'ancienne photo lors de l'upload

---

**Date de création** : 2026-01-05  
**Statut** : ✅ Complété & Testé
