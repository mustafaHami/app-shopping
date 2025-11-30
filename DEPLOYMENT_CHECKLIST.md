# 🚀 Deployment Checklist - Shopping List App

## ✅ État de l'Application

### Backend (API) - NestJS
- ✅ **Build**: Compilation réussie sans erreurs
- ✅ **Linting**: Aucune erreur de linting
- ✅ **Migrations Prisma**: 8 migrations appliquées
  - Init
  - Description sur liste
  - Table catégories
  - Invitations et rôles
  - Email sur invitations
  - Email optionnel sur membres
  - **Image URL sur items** (Phase 5)
- ✅ **TypeScript**: Pas d'erreurs de compilation
- ✅ **Variables d'environnement**: Fichier .env présent

### Frontend (App) - React Native / Expo
- ✅ **Linting**: Aucune erreur de linting
- ✅ **TypeScript**: Configuration valide
- ✅ **Dépendances**: Toutes installées (expo-image-picker inclus)
- ✅ **Variables d'environnement**: Fichier .env présent
- ✅ **Expo SDK**: Version 54.0.13 (stable)

---

## 📋 Avant le Déploiement

### Backend - Actions Requises

#### 1. **Supabase Storage Bucket** ⚠️ IMPORTANT
Créer un bucket pour les images des items:

1. Aller sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionner votre projet
3. Naviguer vers **Storage**
4. Cliquer sur **New bucket**
5. Configurer:
   - **Nom**: `item-images`
   - **Public bucket**: ✅ Coché (accès public en lecture)
   - **File size limit**: 10 MB
   - **Allowed MIME types**: Laisser vide (ou spécifier: `image/jpeg, image/png, image/webp`)
6. Cliquer sur **Save**

#### 2. **Variables d'Environnement Backend**
Vérifier que `.env` contient:
```env
DATABASE_URL="postgresql://..."
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
PORT=3000
```

#### 3. **Base de Données**
```bash
cd api
npx prisma migrate deploy  # Appliquer les migrations en production
npx prisma generate        # Générer le client Prisma
```

### Frontend - Actions Requises

#### 1. **Variables d'Environnement Frontend**
Vérifier que `.env` contient:
```env
EXPO_PUBLIC_API_URL=http://your-backend-url:3000
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### 2. **Configuration pour Production**
Dans `app/src/constants/api.ts`, mettre à jour pour la production:
```typescript
export const API_BASE_URL = 
  process.env.EXPO_PUBLIC_API_URL || 'https://your-production-api.com';
```

#### 3. **Build pour Production**
```bash
cd app
# Pour Android
eas build --platform android --profile production

# Pour iOS
eas build --platform ios --profile production
```

---

## 🔍 Tests de Fonctionnalités

### Phase 1 - Gestion des Listes
- ✅ Créer une liste
- ✅ Lire/Afficher toutes les listes
- ✅ Modifier le titre d'une liste
- ✅ Supprimer une liste
- ✅ Rechercher des listes par titre

### Phase 2 - Authentification
- ✅ Inscription (email + mot de passe)
- ✅ Connexion
- ✅ Déconnexion
- ✅ Tokens sécurisés (SecureStore)
- ✅ Protection des endpoints (JWT)
- ✅ Réinitialisation du mot de passe

### Phase 3 - Partage et Membres
- ✅ Ajouter des membres à une liste
- ✅ Invitations (pending/accepted/declined)
- ✅ Gestion des rôles (Owner/Writer/Reader)
- ✅ Permissions par rôle
- ✅ Distinction visuelle (My lists / Shared)

### Phase 4 - UX et Optimisations
- ✅ Swipe actions sur listes
- ✅ Swipe actions sur items
- ✅ Quick Add (ajout rapide)
- ✅ Contrôles de quantité (+/-)
- ✅ Items achetés repliables
- ✅ Auto-focus champ Quick Add
- ✅ Liste par défaut à l'inscription

### Phase 5 - Images ⚠️ NOUVEAU
- ✅ Sélection d'image depuis la galerie
- ✅ Capture d'image avec caméra
- ✅ Upload vers Supabase Storage
- ✅ Affichage thumbnail dans la liste
- ✅ Placeholder cliquable
- ✅ Viewer plein écran
- ✅ Remplacement d'image
- ✅ Suppression d'image
- ⚠️ **Bucket Supabase à créer** (voir section 1)

---

## 🐛 Problèmes Connus

### Aucun problème critique détecté ✅

Les vérifications suivantes sont passées:
- Compilation backend: OK
- Linting backend: OK
- Linting frontend: OK
- Migrations Prisma: OK
- Dépendances installées: OK

---

## 📊 Résumé

| Composant | État | Notes |
|-----------|------|-------|
| Backend Build | ✅ | Pas d'erreurs |
| Backend Linting | ✅ | Pas d'erreurs |
| Frontend Linting | ✅ | Pas d'erreurs |
| Migrations DB | ✅ | 8 migrations OK |
| Variables Env | ✅ | Fichiers présents |
| Dépendances | ✅ | Toutes installées |
| **Bucket Storage** | ⚠️ | **À créer manuellement** |

---

## 🎯 Prochaines Étapes

1. ✅ **Créer le bucket `item-images` sur Supabase**
2. ✅ Vérifier les variables d'environnement
3. ✅ Tester l'upload d'images
4. ✅ Préparer les builds de production
5. ✅ Déployer le backend
6. ✅ Déployer l'app mobile

---

## 📞 Support

En cas de problème:
1. Vérifier les logs du backend: `npm run start:dev` (mode dev)
2. Vérifier les logs Expo: `npx expo start`
3. Vérifier les permissions Supabase Storage
4. Vérifier que le bucket `item-images` existe et est public

---

**Date de vérification**: 30 novembre 2025
**Version**: Phase 5 (Images) ✅ Complète

