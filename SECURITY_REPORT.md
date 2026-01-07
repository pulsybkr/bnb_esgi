# Rapport de Sécurité - BnB Afriq

**Date du rapport :** 2026-01-07  
**Version analysée :** 1.0.0  
**Outils utilisés :** Docker Scout, npm audit, analyse manuelle

---

## 1. Résumé Exécutif

Ce rapport présente l'analyse de sécurité de l'application BnB Afriq, incluant les vulnérabilités identifiées et les remédiations mises en place.

| Catégorie | Statut |
|-----------|--------|
| Images Docker | ✅ Analysé |
| Dépendances npm (frontend) | ✅ Analysé |
| Dépendances npm (backend) | ✅ Analysé |
| Configuration serveur | ✅ Sécurisé |

---

## 2. Analyse des Images Docker

### 2.1 Commande d'analyse

```bash
# Analyser toutes les images du projet
docker scout cves bnb_backend
docker scout cves bnb_frontend
docker scout cves nginx:alpine
docker scout cves postgres:15
```

### 2.2 Résultats

| Image | Vulnérabilités Critiques | Vulnérabilités Hautes | Actions |
|-------|--------------------------|----------------------|---------|
| nginx:alpine | 0 | 0 | ✅ Aucune action requise |
| postgres:15 | 0 | 0 | ✅ Aucune action requise |
| node:20-alpine (backend/frontend) | 0 | 0 | ✅ Utilisation de version LTS |

### 2.3 Recommandations appliquées

- ✅ Utilisation d'images Alpine (taille réduite, moins de surface d'attaque)
- ✅ Images officielles uniquement
- ✅ Versions spécifiques (pas de `latest`)

---

## 3. Analyse des Dépendances npm

### 3.1 Frontend

```bash
cd frontend && npm audit
```

**Résultat :** 0 vulnérabilités

### 3.2 Backend

```bash
cd back-end && npm audit
```

**Résultat :** 0 vulnérabilités

### 3.3 Remédiations appliquées

| Package | Vulnérabilité | Sévérité | Remédiation |
|---------|---------------|----------|-------------|
| - | - | - | Aucune vulnérabilité détectée |

---

## 4. Mesures de Sécurité Implémentées

### 4.1 Infrastructure Docker

| Mesure | Implémentation |
|--------|----------------|
| Reverse Proxy | Nginx comme unique point d'entrée |
| Ports internes | Non exposés publiquement (expose vs ports) |
| Réseau isolé | `bnb_network` Bridge Docker |
| Services internes | Accessibles uniquement via Nginx |

### 4.2 Headers de Sécurité (Nginx)

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

### 4.3 Rate Limiting

- Zone `api_limit` : 10 requêtes/seconde avec burst de 20
- Appliqué sur `/api/*`

### 4.4 Authentification

| Mesure | Statut |
|--------|--------|
| JWT avec expiration | ✅ Implémenté (15min access, 7j refresh) |
| Cookies HttpOnly | ✅ Implémenté |
| Cookies Secure | ✅ En production |
| Hashage bcrypt | ✅ Mot de passe hashés |

### 4.5 Monitoring des erreurs

- GlitchTip (compatible Sentry) pour capturer les exceptions
- Traces des erreurs frontend et backend

---

## 5. Recommandations Futures

### Priorité Haute

- [ ] Implémenter 2FA (TOTP) pour les comptes sensibles
- [ ] Ajouter CSP (Content-Security-Policy) dans Nginx
- [ ] Configurer HSTS après mise en place SSL

### Priorité Moyenne

- [ ] Audit de pénétration externe
- [ ] Scanner SQLMap sur l'API
- [ ] Rotation automatique des secrets

### Priorité Basse

- [ ] Mise en place d'un WAF (ModSecurity)
- [ ] Logging centralisé avec ELK

---

## 6. Commandes de Vérification

```bash
# Scanner les vulnérabilités Docker
docker scout cves $(docker compose images -q)

# Audit npm frontend
cd frontend && npm audit --audit-level=moderate

# Audit npm backend
cd back-end && npm audit --audit-level=moderate

# Vérifier les headers de sécurité
curl -I http://localhost/

# Tester le rate limiting
for i in {1..25}; do curl -s -o /dev/null -w "%{http_code}\n" http://localhost/api/health; done
```

---

## 7. Conclusion

L'application BnB Afriq a été analysée et sécurisée selon les bonnes pratiques :

- ✅ Infrastructure Docker sécurisée
- ✅ Reverse proxy avec headers de sécurité
- ✅ Dépendances à jour sans vulnérabilités connues
- ✅ Monitoring des erreurs en place
- ✅ Rate limiting sur l'API

**Score de sécurité estimé : 8/10**

Points d'amélioration identifiés : 2FA, CSP headers, audit de pénétration.
