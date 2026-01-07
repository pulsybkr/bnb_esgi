# 📝 Changelog - Projet BnB ESGI

Historique des modifications et tâches complétées.

---

## [2026-01-05] - Upload Photo de Profil ✅

### ✨ Nouvelles Fonctionnalités

#### 📸 P1-1 : API Upload Photo de Profil (COMPLÉTÉ)

**Backend - Endpoint d'Upload**
- ✅ Installation de `multer` et `@types/multer`
- ✅ Création du middleware `upload.middleware.ts` avec :
  - Configuration Multer (storage, fileFilter)
  - Validation des types MIME (JPEG, PNG, WebP)
  - Limite de taille : 5MB
  - Génération de noms de fichiers sécurisés
  - Gestion des erreurs d'upload
  
- ✅ Ajout de la méthode `uploadProfilePhoto` au contrôleur `auth.controller.ts`
- ✅ Création de la route POST `/auth/profile/photo` dans `auth.routes.ts`
- ✅ Documentation Swagger complète de l'endpoint
- ✅ Middleware pour servir les fichiers statiques `/uploads`

**Configuration**
- ✅ Variables d'environnement ajoutées (`MAX_FILE_SIZE`, `UPLOAD_DIR`)
- ✅ Dossier `uploads/` ajouté au `.gitignore`
- ✅ Mise à jour du fichier `env.example`

**Documentation**
- ✅ Fichier `UPLOAD_PHOTO_API.md` créé avec :
  - Guide d'utilisation complet
  - Exemples de requêtes (cURL, Fetch, Axios)
  - Documentation des réponses
  - Instructions de test

### 📊 Progression du Projet

**Avant :** 45% (8/22 tâches)  
**Après :** 50% (9/22 tâches)  

**P1 - Gestion Profils :**
- Progression : 50% → 62.5%
- Tâches complétées : 4/8 → 5/8

### 📂 Fichiers Modifiés

**Nouveaux fichiers :**
- `back-end/src/middlewares/upload.middleware.ts`
- `back-end/UPLOAD_PHOTO_API.md`

**Fichiers modifiés :**
- `back-end/package.json` (ajout multer)
- `back-end/src/middlewares/index.ts`
- `back-end/src/controllers/auth/auth.controller.ts`
- `back-end/src/routes/auth/auth.routes.ts`
- `back-end/src/server.ts`
- `back-end/.gitignore`
- `back-end/env.example`
- `TACHES_RESTANTES.md`

### 🔗 Référence

- **Tâche :** P1-1
- **Priorité :** 🟠 HAUTE
- **Sprint :** Sprint 2 - Profils & Upload
- **Documentation :** [UPLOAD_PHOTO_API.md](back-end/UPLOAD_PHOTO_API.md)

---

## Prochaines Étapes

### 🎯 Sprint 2 (Suite)
- [ ] P1-4 : Component upload image réutilisable (Vue.js)
- [ ] P1-2 : Page profil utilisateur front-end
- [ ] P1-3 : Édition profil front-end

### 🔴 Sprint 1 (P0 - Critique)
- [ ] P0-5 : Install Pinia + Store auth
- [ ] P0-1 : Page connexion
- [ ] P0-2 : Page inscription
- [ ] P0-4 : Gestion erreurs auth frontend
- [ ] P0-3 : Blacklist tokens

---

**Dernière mise à jour :** 2026-01-05 12:11:00
