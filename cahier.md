# CAHIER DE CHARGES
## Plateforme AirBnbAfriq

---

## 📋 SOMMAIRE

1. [Présentation générale](#1-présentation-générale)
2. [Contexte et justification](#2-contexte-et-justification)
3. [Objectifs stratégiques](#3-objectifs-stratégiques)
4. [Public cible](#4-public-cible)
5. [Périmètre fonctionnel](#5-périmètre-fonctionnel)
6. [Spécifications techniques](#6-spécifications-techniques)
7. [Exigences non fonctionnelles](#7-exigences-non-fonctionnelles)
8. [Modèle de données](#8-modèle-de-données)
9. [Livrables attendus](#9-livrables-attendus)
10. [Répartition des tâches par développeur](#10-répartition-des-tâches-par-développeur)

---

## 1. PRÉSENTATION GÉNÉRALE

**Nom du projet :** AirBnbAfriq

**Nature du projet :** Application mobile et web dédiée à la **réservation de logements courte durée en Afrique sub-saharienne**.

**Mission :** Faciliter la mise en relation entre propriétaires et voyageurs en rendant visibles des logements souvent méconnus, tout en garantissant une réservation et un paiement sécurisés.

---

## 2. CONTEXTE ET JUSTIFICATION

### Problématique identifiée
En Afrique sub-saharienne, trouver un logement temporaire représente un défi majeur, particulièrement pour :
- Les touristes
- Les travailleurs en déplacement
- Les étudiants
- Les expatriés

### Limites des solutions existantes
- **Couverture insuffisante** des plateformes internationales (Airbnb, Booking)
- **Manque de visibilité** des propriétaires locaux
- **Inadéquation** des solutions aux réalités locales

### Notre réponse
AirBnbAfriq propose une **plateforme adaptée aux spécificités locales** avec :
- Intégration du **mobile money**
- Support des **langues locales**
- **Ergonomie mobile-first**

---

## 3. OBJECTIFS STRATÉGIQUES

### Objectifs principaux
- ✅ **Simplicité** : Offrir une plateforme intuitive et sécurisée pour la réservation
- 🏠 **Visibilité** : Donner de l'exposition aux propriétaires locaux
- 💳 **Adaptation locale** : Intégrer des solutions de paiement contextualisées
- ⭐ **Confiance** : Développer un écosystème de confiance via avis et notations
- 🌍 **Impact économique** : Stimuler le tourisme et la mobilité régionale

---

## 4. PUBLIC CIBLE

### Utilisateurs finaux

#### 👥 **Voyageurs**
- Touristes locaux et internationaux
- Étudiants en mobilité
- Expatriés et travailleurs en déplacement
- Professionnels en mission

#### 🏡 **Hébergeurs**
- **Propriétaires indépendants** : particuliers avec logement ou chambre disponible
- **Structures hôtelières locales** : hôtels, auberges, guest-houses, résidences

---

## 5. PÉRIMÈTRE FONCTIONNEL

### 5.1 Gestion des utilisateurs
- Inscription/connexion multi-profils (locataire, propriétaire, admin)
- Gestion des profils personnalisés
- Système de vérification d'identité

### 5.2 Gestion des biens
- **CRUD complet** : ajout, modification, suppression d'annonces
- **Descriptifs détaillés** : description, prix, photos, équipements
- **Calendrier de disponibilité** : gestion automatisée des créneaux

### 5.3 Recherche & réservation
- **Moteur de recherche avancé** par :
  - Localisation géographique
  - Type d'hébergement
  - Dates de séjour
  - Fourchette de prix
- **Système de réservation instantanée**

### 5.4 Solutions de paiement
- **Mobile money** (intégration des opérateurs locaux)
- **Cartes bancaires locales**
- **PayPal** (pour l'international)
- **Paiement sécurisé** avec escrow

### 5.5 Communication
- **Messagerie instantanée** (WebSocket)
- **Notifications push**
- **Support multilingue**

### 5.6 Système de confiance
- **Avis et notations** bidirectionnels
- **Système de signalement**
- **Modération des contenus**

### 5.7 Administration
- **Dashboard complet** pour la gestion :
  - Utilisateurs et validations
  - Annonces et modération
  - Gestion des litiges
  - Analytics et reporting

### 5.8 Fonctionnalités transversales
- **Multilingue** : français, anglais + langues locales prioritaires
- **Géolocalisation** : recherche par proximité
- **Favoris** : sauvegarde des logements préférés

---

## 6. SPÉCIFICATIONS TECHNIQUES

### 6.1 Architecture applicative
- **Front-end :** Vue.js (approche mobile-first, responsive design)
- **Back-end :** Node.js avec framework AdonisJS
- **Base de données :** PostgreSQL
- **API :** RESTful + WebSocket pour la messagerie

### 6.2 DevOps & Outils de développement
- **Containerisation :** Docker & Docker Compose
- **Gestion de version :** GitHub (workflow GitFlow)
- **CI/CD :** GitHub Actions
- **Documentation :** README détaillé + Wiki GitHub

### 6.3 Sécurité
- **Authentification :** JSON Web Tokens (JWT)
- **Chiffrement :** Données sensibles chiffrées
- **HTTPS obligatoire** sur toutes les communications
- **Validation des données** côté client et serveur

### 6.4 Infrastructure
- **Hébergement :** VPS dédié
- **Domaine :** Nom de domaine personnalisé
- **CDN :** Distribution de contenu pour les images
- **Sauvegarde :** Stratégie de backup automatisée

---

## 7. EXIGENCES NON FONCTIONNELLES

### 7.1 Performance
- ⚡ **Temps de chargement** : < 3 secondes
- 📱 **Optimisation mobile** : pages légères adaptées aux connexions limitées
- 🔄 **Cache intelligent** pour les données fréquemment consultées

### 7.2 Utilisabilité
- 🎨 **Interface intuitive** : navigation simple et claire
- 📱 **Responsive design** : adaptation parfaite mobile/tablette/desktop
- 🌐 **Accessibilité** : respect des standards WCAG

### 7.3 Fiabilité
- ⏰ **Disponibilité** : uptime garanti à 99%
- 🔒 **Sécurité des données** : conformité aux standards de protection
- 📊 **Monitoring** : surveillance continue des performances

### 7.4 Évolutivité
- 🔧 **Architecture modulaire** : facilité d'ajout de nouvelles fonctionnalités
- 🌍 **Scalabilité** : capacité d'extension géographique
- 🔌 **Intégrations futures** : préparation aux APIs tierces

---

## 8. MODÈLE DE DONNÉES

### 8.1 Entités principales

#### **👤 Users**
```
- id (PK)
- nom, prénom
- email (unique)
- téléphone
- adresse
- type_utilisateur (enum: locataire, propriétaire, admin)
- date_inscription
- statut_verification
```

#### **🏠 Logements**
```
- id (PK)
- titre
- description
- localisation (adresse + coordonnées GPS)
- type (enum: maison, appartement, chambre, hôtel)
- nombre_pieces
- capacite_accueil
- prix_par_nuit
- equipements (JSON)
- photos (array)
- statut (enum: actif, suspendu, archivé)
- id_proprietaire (FK Users)
```

#### **📅 Disponibilités**
```
- id (PK)
- date_debut
- date_fin
- statut (enum: disponible, réservé, bloqué)
- id_logement (FK)
```

#### **💳 Paiements**
```
- id (PK)
- montant
- devise
- statut (enum: réussi, échec, en_attente, remboursé)
- moyen_paiement (enum: mobile_money, carte, paypal)
- date_transaction
- reference_externe
- id_reservation (FK)
- id_utilisateur (FK)
```

#### **📋 Réservations**
```
- id (PK)
- date_debut
- date_fin
- nombre_voyageurs
- montant_total
- statut (enum: confirmée, annulée, en_attente, terminée)
- date_creation
- id_logement (FK)
- id_locataire (FK)
```

#### **💬 Messages**
```
- id (PK)
- expediteur_id (FK Users)
- destinataire_id (FK Users)
- contenu
- date_envoi
- lu (boolean)
- id_reservation (FK, optionnel)
```

#### **⭐ Avis**
```
- id (PK)
- note (1-5)
- commentaire
- date_creation
- type (enum: logement, voyageur)
- id_auteur (FK Users)
- id_reservation (FK)
```

#### **❤️ Favoris**
```
- id (PK)
- id_utilisateur (FK Users)
- id_logement (FK Logements)
- date_ajout
```

---

## 9. LIVRABLES ATTENDUS

- 📱 **Application mobile** (PWA compatible iOS/Android)
- 💻 **Interface web responsive**
- 🛠️ **Panel d'administration**
- 📚 **Documentation technique**
- 🧪 **Tests automatisés**
- 🚀 **Environnement de déploiement**

---

## 10. RÉPARTITION DES TÂCHES PAR DÉVELOPPEUR

### 👨‍💻 **Développeur C - Module Authentification & Utilisateurs**

#### **🎯 Responsabilités principales**
- Gestion complète des utilisateurs et de l'authentification
- Système de profils et préférences
- Sécurité et validation des données

#### **🖥️ Front-end (Vue.js)**
- **Pages d'authentification**
  - Inscription (locataire/propriétaire)
  - Connexion/déconnexion
  - Mot de passe oublié
  - Vérification email/téléphone
- **Gestion de profil**
  - Édition profil utilisateur
  - Upload photo de profil
  - Préférences utilisateur
  - Historique des activités
- **Composants partagés**
  - Header/Navigation principal
  - Footer
  - Composants de formulaires réutilisables

#### **⚙️ Back-end (AdonisJS)**
- **API Authentification**
  - Système JWT complet
  - Middleware d'authentification
  - Gestion des rôles (locataire/propriétaire/admin)
- **API Utilisateurs**
  - CRUD utilisateurs
  - Validation des données
  - Upload et gestion des fichiers
  - Système de notifications
- **Configuration projet**
  - Setup initial AdonisJS
  - Configuration base de données
  - Middleware de sécurité
  - Docker setup

---

### 👩‍💻 **Développeur D - Module Logements & Recherche**

#### **🎯 Responsabilités principales**
- Gestion complète des logements
- Moteur de recherche et filtres
- Géolocalisation et cartes

#### **🖥️ Front-end (Vue.js)**
- **Pages logements**
  - Liste des logements (avec filtres)
  - Détail d'un logement
  - Galerie photos avec zoom
  - Carte interactive (Google Maps/OpenStreetMap)
- **Gestion propriétaire**
  - Ajout/édition de logement
  - Upload multiple d'images
  - Calendrier de disponibilité
  - Gestion des prix
- **Recherche avancée**
  - Barre de recherche intelligente
  - Filtres par critères
  - Recherche géolocalisée
  - Sauvegarde de recherches

#### **⚙️ Back-end (AdonisJS)**
- **API Logements**
  - CRUD logements complet
  - Upload et optimisation d'images
  - Système de catégories et tags
- **API Recherche**
  - Moteur de recherche full-text
  - Filtres complexes
  - Géolocalisation (calcul distances)
  - Système de recommandations
- **API Disponibilités**
  - Gestion calendrier
  - Vérification conflits de dates
  - Tarification dynamique

---

### 👨‍💻 **Développeur P - Module Réservations & Paiements**

#### **🎯 Responsabilités principales**
- Processus de réservation complet
- Intégration des systèmes de paiement
- Communication entre utilisateurs

#### **🖥️ Front-end (Vue.js)**
- **Processus de réservation**
  - Sélection de dates
  - Récapitulatif réservation
  - Formulaire de paiement
  - Confirmation de réservation
- **Gestion des réservations**
  - Dashboard locataire (mes réservations)
  - Dashboard propriétaire (demandes)
  - Historique complet
  - Statuts en temps réel
- **Communication**
  - Messagerie instantanée (WebSocket)
  - Chat en temps réel
  - Système d'avis et notes
  - Notifications push
- **Module paiement**
  - Interface Mobile Money
  - Intégration cartes bancaires
  - PayPal checkout
  - Gestion des remboursements

#### **⚙️ Back-end (AdonisJS)**
- **API Réservations**
  - Logique de réservation complète
  - Gestion des conflits
  - Système de statuts
  - Calculs de prix automatiques
- **API Paiements**
  - Intégration Mobile Money (Orange, MTN, etc.)
  - Gateway cartes bancaires
  - PayPal API
  - Système d'escrow/séquestre
  - Gestion des remboursements
- **API Communication**
  - WebSocket server pour chat temps réel
  - Système de notifications
  - API avis et évaluations
  - Modération de contenu
- **API Admin**
  - Dashboard administration
  - Gestion des litiges
  - Analytics et statistiques
  - Modération des annonces

---

### 🤝 **Tâches communes et collaboration**

#### **🔧 DevOps partagé**
- **Développeur C :** Configuration initiale Docker + GitHub Actions
- **Développeur D :** Optimisation performance + SEO
- **Développeur P :** Monitoring + déploiement production

#### **🧪 Tests**
- Chaque développeur responsable des tests unitaires de son module
- Tests d'intégration collaboratifs
- Tests end-to-end partagés

#### **📱 Responsive & Mobile**
- Approche mobile-first pour tous
- Tests cross-browser partagés
- Optimisation PWA collaborative

#### **🌐 Multilingue**
- **Développeur C :** Setup i18n + langues auth
- **Développeur D :** Traductions logements/recherche  
- **Développeur P :** Traductions réservations/paiements

---

### 📅 **Planning de développement suggéré**

#### **Phase 1 - Fondations (Semaines 1-2)**
- **Dev C :** Setup projet + authentification de base
- **Dev D :** Modèle de données + API logements de base
- **Dev P :** Architecture WebSocket + API réservations

#### **Phase 2 - Développement core (Semaines 3-6)**
- Développement parallèle des modules principaux
- Intégrations progressives entre modules
- Tests unitaires continus

#### **Phase 3 - Intégration (Semaines 7-8)**
- Tests d'intégration complets
- Debug cross-modules
- Optimisations performance

#### **Phase 4 - Finalisation (Semaines 9-10)**
- Tests utilisateurs
- Corrections bugs
- Documentation finale
- Déploiement production