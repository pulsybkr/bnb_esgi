# 📋 Tâches Restantes - Projet BnB ESGI

**Date de génération:** 2026-01-05  
**Statut global:** 50% complété (9 tâches complètes, 5 partielles, 8 à faire)

---

## 🔴 P0 - Authentification Core & Configuration (PRIORITÉ HAUTE)

### Tâches à Compléter

| ID | Tâche | Statut | Priorité | Description Détaillée | Fichiers Concernés |
|----|-------|--------|----------|----------------------|-------------------|
| P0-1 | Page connexion front-end | ❌ À faire | 🔴 CRITIQUE | Créer une page Vue.js pour la connexion utilisateur avec formulaire email/password, validation, gestion erreurs, et appel API /auth/login | `/frontend/src/views/LoginView.vue`<br>`/frontend/src/router/index.ts` |
| P0-2 | Page inscription front-end | ❌ À faire | 🔴 CRITIQUE | Créer une page Vue.js pour l'inscription avec formulaire (email, password, firstName, lastName), validation, et appel API /auth/register | `/frontend/src/views/RegisterView.vue`<br>`/frontend/src/router/index.ts` |
| P0-3 | API Logout + blacklist tokens | ⚠️ Partiel | 🔴 CRITIQUE | Implémenter un système de blacklist des tokens JWT pour invalider réellement les tokens lors du logout (actuellement seul le refresh token est supprimé) | `/back-end/src/services/auth/auth.service.ts`<br>`/back-end/src/middlewares/auth.middleware.ts`<br>`/back-end/prisma/schema.prisma` (ajouter table TokenBlacklist) |
| P0-4 | Gestion des erreurs auth front-end | ❌ À faire | 🔴 CRITIQUE | Créer des composants et utils pour afficher les erreurs d'authentification (toast, modal, inline errors) | `/frontend/src/components/ErrorDisplay.vue`<br>`/frontend/src/utils/errorHandler.ts` |
| P0-5 | Store Pinia pour auth state | ❌ À faire | 🔴 CRITIQUE | Installer Pinia et créer un store pour gérer l'état d'authentification (user, tokens, isAuthenticated) avec persistence localStorage | `/frontend/package.json`<br>`/frontend/src/stores/auth.ts`<br>`/frontend/src/main.ts` |

**Progression P0:** 1/6 tâches complètes (17%) ⚠️

---

## 🟠 P1 - Gestion Profils & Configuration

### Tâches à Compléter

| ID | Tâche | Statut | Priorité | Description Détaillée | Fichiers Concernés |
|----|-------|--------|----------|----------------------|-------------------|
| P1-1 | API upload photo de profil | ✅ Complété | 🟠 HAUTE | Endpoint POST /auth/profile/photo avec multer pour upload d'images, validation format/taille, storage local, et mise à jour du champ profilePhoto. **[Voir Documentation](back-end/UPLOAD_PHOTO_API.md)** | `/back-end/src/routes/auth/auth.routes.ts`<br>`/back-end/src/controllers/auth/auth.controller.ts`<br>`/back-end/src/middlewares/upload.middleware.ts`<br>`/back-end/package.json` ✅ |
| P1-2 | Page profil utilisateur front-end | ❌ À faire | 🟠 HAUTE | Créer une page Vue.js pour afficher le profil utilisateur avec toutes les informations (nom, email, téléphone, photo, préférences) | `/frontend/src/views/ProfileView.vue`<br>`/frontend/src/router/index.ts` |
| P1-3 | Édition profil front-end | ❌ À faire | 🟠 HAUTE | Créer un formulaire/modal d'édition du profil avec validation et appel API PUT /auth/profile | `/frontend/src/components/ProfileEditForm.vue`<br>`/frontend/src/views/ProfileView.vue` |
| P1-4 | Component upload image réutilisable | ❌ À faire | 🟠 HAUTE | Créer un composant Vue.js réutilisable pour uploader des images (drag & drop, preview, validation client-side) | `/frontend/src/components/ImageUpload.vue` |

**Progression P1:** 5/8 tâches complètes (62.5%) 🟡

---

## 🟡 P2 - Fonctionnalités Auth Avancées

### Tâches à Compléter

| ID | Tâche | Statut | Priorité | Description Détaillée | Fichiers Concernés |
|----|-------|--------|----------|----------------------|-------------------|
| P2-1 | Page mot de passe oublié front-end | ❌ À faire | 🟡 MOYENNE | Créer une page pour demander la réinitialisation (formulaire email) + page pour réinitialiser avec token (nouveau password) | `/frontend/src/views/ForgotPasswordView.vue`<br>`/frontend/src/views/ResetPasswordView.vue`<br>`/frontend/src/router/index.ts` |
| P2-2 | System de notifications utilisateur | ⚠️ Partiel | 🟡 MOYENNE | Créer API CRUD pour notifications (GET /notifications, PUT /notifications/:id/read, DELETE) + composant front-end pour afficher les notifications (dropdown, badge count) | `/back-end/src/routes/notification/`<br>`/back-end/src/controllers/notification/`<br>`/back-end/src/services/notification/`<br>`/frontend/src/components/NotificationCenter.vue`<br>`/frontend/src/stores/notifications.ts` |
| P2-3 | Historique des connexions | ⚠️ Partiel | 🟡 MOYENNE | Créer table LoginHistory en BDD pour tracker toutes les connexions (IP, user-agent, date, succès/échec) + API pour afficher l'historique + page front-end | `/back-end/prisma/schema.prisma`<br>`/back-end/src/services/auth/login-history.service.ts`<br>`/back-end/src/routes/auth/auth.routes.ts`<br>`/frontend/src/views/LoginHistoryView.vue` |

**Progression P2:** 3/6 tâches complètes (50%) 🟡

---

## 🟢 P3 - Sécurité Avancée

### Tâches à Compléter

| ID | Tâche | Statut | Priorité | Description Détaillée | Fichiers Concernés |
|----|-------|--------|----------|----------------------|-------------------|
| P3-1 | Rate limiting sur auth endpoints | ⚠️ Partiel | 🟢 BASSE | Implémenter et appliquer middleware express-rate-limit sur les routes /auth/login, /auth/register, /auth/password-reset/request | `/back-end/package.json` (ajouter express-rate-limit)<br>`/back-end/src/middlewares/rate-limit.middleware.ts`<br>`/back-end/src/routes/auth/auth.routes.ts` |
| P3-2 | Chiffrement données sensibles | ⚠️ Partiel | 🟢 BASSE | Implémenter chiffrement pour les données sensibles en BDD (téléphone, adresse) avec crypto-js ou similaire | `/back-end/src/utils/encryption.ts`<br>`/back-end/src/services/user/user.service.ts`<br>`/back-end/package.json` |

**Progression P3:** 0/2 tâches complètes (0%) 🔴

---

## 📊 Résumé des Tâches Restantes

### Par Statut
- ❌ **À faire:** 8 tâches
- ⚠️ **Partiellement fait:** 5 tâches
- ✅ **Complété:** 9 tâches
- **Total à finaliser:** 13 tâches

### Par Priorité
- 🔴 **Critique (P0):** 5 tâches
- 🟠 **Haute (P1):** 3 tâches (1 complétée ✅)
- 🟡 **Moyenne (P2):** 3 tâches
- 🟢 **Basse (P3):** 2 tâches

### Par Domaine
- **Frontend:** 7 tâches (pages, composants, stores)
- **Backend:** 3 tâches (API, middlewares, services)
- **Fullstack:** 1 tâche (notifications)

---

## 🎯 Plan d'Action Recommandé

### Sprint 1 - Fondations Auth (Critique) 🔴
1. **P0-5** - Installer et configurer Pinia
2. **P0-1** - Page de connexion
3. **P0-2** - Page d'inscription
4. **P0-4** - Gestion erreurs frontend
5. **P0-3** - Blacklist tokens

### Sprint 2 - Profils & Upload (Haute) 🟠
6. ~~**P1-1** - API upload photo~~ ✅ **COMPLÉTÉ**
7. **P1-4** - Composant upload image
8. **P1-2** - Page profil
9. **P1-3** - Édition profil

### Sprint 3 - Features Avancées (Moyenne) 🟡
10. **P2-1** - Pages mot de passe oublié
11. **P2-2** - Système notifications
12. **P2-3** - Historique connexions

### Sprint 4 - Sécurité (Basse) 🟢
13. **P3-1** - Rate limiting
14. **P3-2** - Chiffrement données

---

## 📝 Notes Techniques

### Dépendances à Installer

**Frontend:**
```json
{
  "pinia": "^2.1.7",
  "pinia-plugin-persistedstate": "^3.2.1"
}
```

**Backend:**
```json
{
  "multer": "^1.4.5-lts.1",
  "@types/multer": "^1.4.11",
  "express-rate-limit": "^7.1.5",
  "crypto-js": "^4.2.0",
  "@types/crypto-js": "^4.2.1"
}
```

### Variables d'Environnement à Ajouter

```env
# Upload
MAX_FILE_SIZE=5242880  # 5MB
UPLOAD_DIR=./uploads
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp

# Email (pour reset password)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@bnb-esgi.com
SMTP_PASS=your_password
EMAIL_FROM=noreply@bnb-esgi.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=5

# Encryption
ENCRYPTION_KEY=your-32-char-encryption-key-here
```

---

**Dernière mise à jour:** 2026-01-05 11:41:03
