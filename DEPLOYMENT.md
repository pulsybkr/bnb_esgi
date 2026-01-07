# Guide de Déploiement - BnB Afriq

Ce guide détaille le déploiement de l'application sur un serveur VPS avec Docker, Docker Compose et Docker Context.

## Prérequis

- Un VPS avec Ubuntu 22.04+ ou Debian 12+
- Docker et Docker Compose installés sur le serveur
- Un nom de domaine pointant vers l'IP du serveur
- Docker installé en local

---

## 1. Configuration du Serveur

### 1.1 Créer un utilisateur non-privilégié

> ⚠️ **Important** : Ne jamais déployer en tant que root !

```bash
# Sur le serveur, en tant que root
adduser deployer
usermod -aG docker deployer
usermod -aG sudo deployer

# Configurer SSH pour cet utilisateur
su - deployer
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Copiez votre clé publique (depuis votre machine locale)
# ssh-copy-id deployer@votre-serveur.com
```

### 1.2 Sécuriser SSH

```bash
# Désactiver la connexion root
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart sshd
```

---

## 2. Configuration Docker Context

Docker Context permet de déployer directement depuis votre machine locale vers le serveur.

### 2.1 Créer le contexte

```bash
# Sur votre machine locale
docker context create bnb-production \
  --docker "host=ssh://deployer@votre-serveur.com"

# Vérifier la création
docker context ls
```

### 2.2 Utiliser le contexte

```bash
# Basculer sur le contexte production
docker context use bnb-production

# Toutes les commandes Docker s'exécutent maintenant sur le serveur
docker ps

# Revenir au contexte local
docker context use default
```

---

## 3. Configuration SSL avec Let's Encrypt

### 3.1 Installer Certbot sur le serveur

```bash
sudo apt update
sudo apt install certbot
```

### 3.2 Obtenir le certificat

```bash
# Arrêter temporairement Nginx si actif
docker compose down nginx

# Obtenir le certificat
sudo certbot certonly --standalone -d votre-domaine.com -d www.votre-domaine.com

# Les certificats sont dans /etc/letsencrypt/live/votre-domaine.com/
```

### 3.3 Copier les certificats pour Docker

```bash
sudo mkdir -p /home/deployer/bnb_esgi/nginx/ssl
sudo cp /etc/letsencrypt/live/votre-domaine.com/fullchain.pem /home/deployer/bnb_esgi/nginx/ssl/
sudo cp /etc/letsencrypt/live/votre-domaine.com/privkey.pem /home/deployer/bnb_esgi/nginx/ssl/
sudo chown -R deployer:deployer /home/deployer/bnb_esgi/nginx/ssl/
```

### 3.4 Configurer le renouvellement automatique

```bash
# Ajouter au crontab
sudo crontab -e

# Ajouter cette ligne (renouvellement quotidien à 3h du matin)
0 3 * * * certbot renew --quiet --post-hook "docker compose -f /home/deployer/bnb_esgi/docker-compose.yml restart nginx"
```

---

## 4. Déploiement

### 4.1 Variables d'environnement

Créer le fichier `.env` sur le serveur :

```bash
# Sur le serveur
cd /home/deployer/bnb_esgi
cp .env.example .env
nano .env  # Modifier les valeurs pour la production
```

**Variables importantes pour la production :**
```env
NODE_ENV=production
JWT_SECRET=<clé-secrète-longue-et-aléatoire>
CORS_ORIGIN=https://votre-domaine.com

# GlitchTip
GLITCHTIP_SECRET_KEY=<clé-secrète-32-caractères>
GLITCHTIP_DOMAIN=https://votre-domaine.com/glitchtip

# Sentry DSN (obtenu après configuration de GlitchTip)
SENTRY_DSN=https://xxx@votre-domaine.com/glitchtip/1
VITE_SENTRY_DSN=https://xxx@votre-domaine.com/glitchtip/1
```

### 4.2 Déployer avec Docker Context

```bash
# Depuis votre machine locale
docker context use bnb-production

# Transférer les fichiers (première fois seulement)
rsync -avz --exclude node_modules --exclude .git ./ deployer@votre-serveur.com:/home/deployer/bnb_esgi/

# Construire et démarrer
docker compose up -d --build

# Vérifier les logs
docker compose logs -f

# Revenir au contexte local
docker context use default
```

### 4.3 Migrations de base de données

```bash
docker context use bnb-production
docker compose exec backend npx prisma migrate deploy
docker context use default
```

---

## 5. Commandes Utiles

```bash
# Voir les logs
docker compose logs -f [service]

# Redémarrer un service
docker compose restart [service]

# Mettre à jour un service
docker compose up -d --build [service]

# Voir l'état des conteneurs
docker compose ps

# Accéder à un conteneur
docker compose exec [service] sh

# Sauvegarder la base de données
docker compose exec postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup.sql
```

---

## 6. Architecture Réseau

```
Internet
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│                     NGINX (ports 80, 443)                   │
│                     Seul point d'entrée public              │
└─────────────────────────────────────────────────────────────┘
    │           │           │           │           │
    ▼           ▼           ▼           ▼           ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────────┐
│Frontend│ │Backend │ │ Matomo │ │Adminer │ │ GlitchTip  │
│ :4173  │ │ :3333  │ │  :80   │ │ :8080  │ │   :8000    │
└────────┘ └────────┘ └────────┘ └────────┘ └────────────┘
                │                                   │
                ▼                                   ▼
          ┌──────────┐                       ┌──────────┐
          │ Postgres │                       │  Redis   │
          │  :5432   │                       │  :6379   │
          └──────────┘                       └──────────┘
```

> **Note** : Tous les services internes communiquent via le réseau Docker `bnb_network` et ne sont pas accessibles depuis l'extérieur.

---

## 7. Checklist de Sécurité

- [ ] Connexion SSH par clé uniquement (pas de mot de passe)
- [ ] Utilisateur non-root pour le déploiement
- [ ] Certificat SSL valide
- [ ] Variables d'environnement sécurisées
- [ ] Ports internes non exposés
- [ ] Firewall configuré (ufw)
- [ ] Mises à jour automatiques activées
