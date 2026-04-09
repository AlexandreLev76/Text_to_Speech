# SpeechCraft - Plateforme de Synthèse Vocale Multi-Fournisseurs

## Membres du groupe
Killian Gascon
Alexandre Levenez

## A développer sur le projet
- Ajout de l'OAuth
- Utilisation No SQL
      - Gestion des tokens JWT
      - Rate limiting
      - Cache
A évoluer

## Eléments
- Ajout de l'OAuth
- Gestion du No SQL pour Cache
- Gestion No SQL Tokens
- Gestion No SQL rate Limit

## Variables d'environnement
### .env
DATABASE_URL
DATABASE_URL_UNPOOLED
NEXTAUTH_SECRET

### .env.local
GOOGLE_TTS_API_KEY


## Technologies principales

### Frontend
- **Framework** :
    - Next.js 14 (App Router) avec React
    - TypeScript pour le typage statique
    - TailwindCSS pour le style et UI Components personnalisés
    - Icônes Lucide

### Backend & API
- **API Routes** :
    - API Routes de Next.js (fonctions serverless)
    - Architecture RESTful

### Base de données
- **SGBD** : SQL (PostgreSQL)
- **ORM** : Prisma
- **Schéma** :
    - **Table User** : `id`, `firstName`, `lastName`, `email`, `password` (hashed), `createdAt`, `updatedAt`
    - **Table ApiKeys** : relation avec `User` pour les clés API personnelles
    - **Table Preferences** : paramètres utilisateur pour les services TTS

## Authentification & Gestion utilisateur

### Système d'authentification
- **Hook personnalisé** : `useAuth` qui gère l'état d'authentification, connexion/déconnexion et informations utilisateur
- **Session** : Gestion de session côté client et serveur
- **Sécurité** : Protection des routes via middleware

### Gestion de profil
- Interface utilisateur pour modifier les informations personnelles
- API endpoints pour la gestion du profil utilisateur

## Intégration multi-fournisseurs TTS

### Services de synthèse vocale
- **ElevenLabs** : Synthèse vocale de pointe
- **Google Cloud Text-to-Speech** : Voix haute qualité avec large support linguistique
- **Amazon Polly** : Synthèse vocale naturelle AWS
- **Microsoft Azure Text-to-Speech** : Voix neurales avancées

### Orchestration des services
- Sélection automatique du meilleur fournisseur selon préférences utilisateur, exigences linguistiques et caractéristiques vocales
- Gestion sécurisée des clés API et rate limiting

## Composants d'interface
- UI Components personnalisés
- Navigation responsive
- Cards modulaires
- Accordions pour la documentation
- Forms avec validations
- Notifications via Sonner (toasts)

## Ressources utilisateur
- Guide utilisateur
- Documentation API
- Tutoriels & Exemples
- FAQ

## Sécurité et gestion d'erreurs
- Hachage des mots de passe
- Protection CSRF
- Validation des entrées
- Gestion d'erreurs et logging

## Structure des répertoires

```
/app
  /account - Gestion du profil utilisateur
  /about - Page d'information
  /api
    /auth - Endpoints d'authentification
    /user - Gestion utilisateur
    /tts - API de synthèse vocale
/components
  /ui - Composants d'interface réutilisables
  /nav - Navigation
  /footer - Pied de page
/hooks
  useAuth.ts - Logique d'authentification
/lib
  /db - Configuration Prisma et helpers BDD
  /tts-providers - Intégrations avec les APIs TTS
/prisma
  schema.prisma - Schéma de base de données
```

SpeechCraft offre une plateforme complète de synthèse vocale multi-fournisseurs avec une architecture moderne, une gestion utilisateur robuste et une expérience utilisateur fluide.
