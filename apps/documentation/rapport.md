# Rapport de projet — Kirona (CinéConnect)

---

## 1. Introduction

### Contexte et problème à résoudre

CinéConnect est un projet scolaire du programme Web2 de l'HETIC, réalisé tout au long du premier semestre. Le cahier des charges demande une plateforme collaborative autour du cinéma permettant aux utilisateurs d'explorer films et séries, de les noter et de communiquer avec leurs amis en temps réel.

Les plateformes de streaming existantes (Netflix, Disney+, etc.) sont avant tout des outils de consommation : elles offrent peu d'interactions communautaires autour des contenus. CinéConnect comble ce manque en ajoutant une couche sociale par-dessus un catalogue cinématographique : les utilisateurs peuvent gérer une liste de visionnage, noter des contenus, envoyer des demandes d'amis et discuter en temps réel.

Notre implémentation de ce cahier des charges se nomme **Kirona**.

### Objectif principal

Livrer une application web full-stack complète en TypeScript couvrant l'ensemble du cycle de développement : modélisation de la base de données, API REST, messagerie temps réel et interface SPA responsive — le tout au sein d'une équipe de trois personnes.

### Public cible et valeur apportée

**Public cible** : les passionnés de cinéma et de séries qui souhaitent :
- Explorer un catalogue riche (films + séries) filtré par genre ou type.
- Suivre ce qu'ils regardent, ont terminé ou prévoient de voir.
- Partager leurs goûts et recommandations avec leurs amis.
- Discuter avec leurs amis sans quitter la plateforme.

**Valeur apportée** : un espace unique pour découvrir, suivre, noter et discuter des contenus — remplaçant les workflows fragmentés entre tableurs, fils de discussion et sites de critiques distincts.

---

## 2. Cahier des charges

### Fonctionnalités essentielles (MVP)

| Fonctionnalité | Description |
|----------------|-------------|
| Authentification | Inscription, connexion, déconnexion, rafraîchissement JWT, vérification e-mail, réinitialisation du mot de passe |
| Exploration des contenus | Parcourir et rechercher films et séries par genre, données issues de l'API TMDB |
| Liste de visionnage | Ajouter/supprimer des contenus, suivre un statut (en cours / terminé / abandonné / à voir) |
| Notes | Score de 1 à 5 étoiles par contenu |
| Amitiés | Envoyer, accepter et refuser des demandes d'amis |
| Messagerie temps réel | Messages directs entre amis via WebSocket (Socket.IO) |
| Gestion du profil | Modifier le nom d'utilisateur, l'avatar, la bio et le mot de passe |

### Fonctionnalités complémentaires

Les fonctionnalités suivantes sont définies dans le schéma de base de données mais pas encore exposées dans l'interface :

- **Watchparty** — sessions de visionnage synchronisé entre utilisateurs
- **Notifications** — alertes in-app pour les demandes d'amis, les messages, etc.
- **Statistiques utilisateur** (`user_stats`) — temps de visionnage, répartition par genre, historique d'activité
- **Listes personnalisées** (`lists`, `list_items`) — collections curatoriales au-delà de la liste de visionnage standard
- **Journal d'activité** (`user_activity_logs`) — trace des actions utilisateur

### Contraintes techniques

- **Stack** : monorepo pnpm, TypeScript 5.9 partout, React 19, Express 5, PostgreSQL, Drizzle ORM, Socket.IO
- **Sécurité** : JWT double jeton (access 15 min + refresh 7 jours httpOnly), révocation côté serveur
- **Outillage** : Biome (lint/format), Vitest 4, Docker Compose, Swagger/OpenAPI
- **Date de rendu** : 25 mars 2026 à 00h00

### Répartition des rôles

| Domaine | Contributeurs |
|---------|--------------|
| UX / UI | Callista, Mathieu |
| Backend | Mathieu |
| Frontend | Callista, Mathieu |
| Base de données | Mathieu |
| Tests | Mathieu, Soufiane |
| DevOps | Mathieu |

---

## 3. Architecture et choix techniques

### Vue d'ensemble

Le projet est un monorepo (pnpm workspaces + Turborepo) composé de deux applications principales et de quatre packages partagés :

```
apps/
  api/            – API REST + WebSocket (Express 5 + Socket.IO)
  front/          – SPA React 19
  documentation/  – Artefacts de documentation

packages/
  api-sdk/        – SDK Axios typé, auto-généré par Orval depuis la spec OpenAPI
  config/         – Configuration d'environnement isomorphe (Node + navigateur)
  logger/         – Logger isomorphe colorisé
  vitest-presets/ – Configuration Vitest partagée
```

Pour les détails : [Vue d'ensemble de l'architecture](https://mathieusouflis.gitbook.io/kinora.tv/architecture/architecture).

### Stack globale

| Couche | Technologies |
|--------|-------------|
| Backend | Express 5, Socket.IO, Drizzle ORM, PostgreSQL 18, Zod |
| Frontend | React 19, Vite 7, TanStack Router, TanStack Query, Zustand, TailwindCSS 4, Radix UI (Shadcn) |
| Packages partagés | SDK Axios généré (Orval), config isomorphe, logger |
| Outillage | Biome (lint/format), Vitest 4, Docker Compose, Phase (secrets), Husky + lint-staged |

### Frontend — React + TanStack Router

Le routing est **basé sur les fichiers** via TanStack Router (arbre de routes auto-généré dans `routeTree.gen.ts`). Les routes protégées sont regroupées sous le layout `_main.tsx` qui impose l'authentification.

Chaque fonctionnalité est encapsulée dans un module sous `src/features/` (composants UI, hooks, stores, services). Les services API suivent un **pattern de double export** : `query*Service` pour les hooks React (TanStack Query) et `*Service` pour les appels impératifs hors composants. L'état global est géré par des stores Zustand.

Pour les détails : [Architecture frontend](https://mathieusouflis.gitbook.io/kinora.tv/architecture/frontend).

### Backend — Node.js + Express + Clean Architecture

Chaque fonctionnalité est un module isolé dans `apps/api/src/modules/`, organisé en trois couches strictement séparées :

- **Domain** — entités, interfaces de repositories, erreurs métier. Aucune dépendance vers l'infrastructure.
- **Application** — cas d'utilisation (une classe par opération métier), DTOs. Dépend uniquement des interfaces du domaine.
- **Infrastructure** — implémentations Drizzle ORM, routes Express, adaptateurs externes.

L'injection de dépendances est manuelle, réalisée au bootstrap. 12 modules sont enregistrés : `auth`, `users`, `categories`, `contents`, `movies`, `series`, `watchlist`, `peoples`, `watchparties`, `friendships`, `conversations`, `messages`.

Pour les détails : [pattern module](https://mathieusouflis.gitbook.io/kinora.tv/architecture-deep-dives/module-pattern) et [système de décorateurs](https://mathieusouflis.gitbook.io/kinora.tv/architecture-deep-dives/decorator-system).

### Base de données — PostgreSQL + Drizzle ORM

Le schéma principal (`schema.ts`) définit l'ensemble des tables, relations et index. Drizzle génère des migrations SQL versionnées (14 migrations depuis février 2026). Les index sont optimisés pour les requêtes fréquentes (messages par conversation, recherche de contenus, activité utilisateur).

Pour les détails : [Vue d'ensemble de la base de données](https://mathieusouflis.gitbook.io/kinora.tv/database-and-api/database).

### Choix techniques et justifications

**Monorepo avec Turborepo** : le pipeline Turborepo orchestre les tâches en respectant les dépendances inter-packages. Le cache de build évite de recompiler les packages non modifiés.

**SDK API auto-généré (Orval)** : l'API expose une spec OpenAPI (auto-générée depuis les schémas Zod via `@asteasolutions/zod-to-openapi`). Orval en dérive un client Axios typé dans `packages/api-sdk`. Cohérence de types entre backend et frontend sans duplication manuelle.

**JWT double jeton** : access token (15 min) porté en mémoire (Zustand + `sessionStorage`), refresh token (7 jours) dans un cookie `httpOnly`. À chaque rafraîchissement, l'ancien token est révoqué en base (`revoked_at`) — rotation avec invalidation. La déconnexion révoque également côté serveur.

**Zod comme couche de validation et source de vérité OpenAPI** : la validation des entrées et la génération de la documentation OpenAPI reposent sur les mêmes schémas Zod, éliminant tout décalage entre les deux.

**Biome (lint + format)** : remplace ESLint + Prettier. Règles strictes : `const` obligatoire, `import type` explicite, pas de `console`. Combiné avec Husky + lint-staged, chaque commit déclenche lint + vérification de types + tests + build. Voir le [guide de style de code](https://mathieusouflis.gitbook.io/kinora.tv/team-conventions/code-style).

**Docker Compose** : en développement, PostgreSQL uniquement via `docker-compose.dev.yaml` ; en production, API + frontend (nginx) via `docker-compose.prod.yaml` avec health checks et injection des secrets Phase. Voir le [pipeline CI/CD](https://mathieusouflis.gitbook.io/kinora.tv/architecture/ci-cd).

---

## 4. Conception

### Maquettes des écrans principaux (Figma)

Les maquettes couvrent les principaux parcours utilisateur :

- **Écrans d'authentification** : formulaire de connexion, inscription, vérification e-mail, réinitialisation du mot de passe
- **Accueil / Exploration** : grille de contenus avec filtres par genre et barre de recherche
- **Page de détail d'un contenu** : affiche, métadonnées, widget de notation, section casting, bouton « Ajouter à la liste »
- **Liste de visionnage** : vue à onglets par statut (En cours / Terminé / Abandonné / À voir)
- **Communauté** : panneau à trois onglets — Amis, Demandes (reçues/envoyées), Découvrir
- **Messages** : layout en panneau divisé — liste des conversations à gauche, vue du chat à droite
- **Paramètres** : informations du compte, changement de mot de passe, bascule de thème

### Conception API

L'API est versionnée sous `/api/v1`. Les routes respectent les conventions REST :

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/v1/auth/login` | Obtenir les tokens access + refresh |
| POST | `/api/v1/auth/register` | Créer un compte |
| POST | `/api/v1/auth/refresh` | Rotation du refresh token |
| POST | `/api/v1/auth/logout` | Révoquer le refresh token |
| GET | `/api/v1/contents` | Lister/rechercher des contenus (film ou série) |
| GET | `/api/v1/contents/:id` | Détail d'un contenu |
| GET/POST/DELETE | `/api/v1/watchlist` | Gérer les entrées de la liste de visionnage |
| POST | `/api/v1/ratings` | Soumettre ou mettre à jour une note |
| GET/POST/DELETE | `/api/v1/friendships` | Gérer les relations d'amitié |
| GET/POST | `/api/v1/conversations` | Lister ou créer des conversations |
| GET/POST | `/api/v1/conversations/:id/messages` | Lire ou envoyer des messages |

La documentation Swagger complète est disponible sur `/api/v1/docs` quand le serveur est lancé. Voir aussi la [référence API](https://mathieusouflis.gitbook.io/kinora.tv/database-and-api/api).

### Modèle de données

Entités principales et leurs relations :

```
users ──< refresh_tokens
users ──< watchlist_entries >── contents
users ──< ratings >── contents
users ──< friendships >── users
users ──< conversation_participants >── conversations
conversations ──< messages >── users
contents >── categories
contents >── movies | series
contents ──< content_credits >── peoples
contents ──< content_platforms >── platforms
```

Tables supplémentaires définies mais pas encore exposées dans l'UI : `watchparties`, `watchparty_participants`, `notifications`, `user_stats`, `lists`, `list_items`, `user_activity_logs`.

---

## 5. Développement

### Organisation du projet

```
apps/api/src/
  modules/          – Un dossier par module métier (structure DDD)
  database/
    schema.ts       – Source de vérité unique pour le schéma BDD
    migrations.ts   – Runner de migrations
  lib/              – Utilitaires partagés (JWT, mailer, gestionnaire d'erreurs)
  app.ts            – Factory de l'application Express
  server.ts         – Point d'entrée

apps/front/src/
  app/              – Routes file-based TanStack Router
  features/         – Modules fonctionnels (UI, hooks, stores, services)
  components/ui/    – Primitives UI partagées (style shadcn)
  lib/api/          – Services wrappers du SDK et parseur d'erreurs
  lib/socket/       – Singleton client Socket.IO
```

### Frontend : pages, composants, état, responsive

Les routes sous `src/app/` correspondent directement aux chemins de fichiers. Le layout `_main.tsx` enveloppe toutes les pages authentifiées et fournit la barre de navigation et le `SearchProvider`.

Pages principales : `index.tsx` (Exploration), `search/index.tsx`, `contents/$contentId/index.tsx`, `watchlist/index.tsx`, `community/index.tsx`, `messages/$conversationId/index.tsx`, `settings/index.tsx`.

Gestion de l'état :
- **Store `auth`** (Zustand + `sessionStorage`) : `user`, `accessToken` — persisté entre les rechargements de page dans la session.
- **Store `theme`** (Zustand + `localStorage`) : `dark` / `light` — persisté indéfiniment.
- **Store `typing`** (Zustand, éphémère) : `typingByConversation` — indicateurs de saisie en temps réel.

Le layout responsive est réalisé avec TailwindCSS 4. Le mode sombre/clair est piloté par le store `theme`.

### Backend : routes, logique métier, CRUD

Chaque module suit le même pattern : les routes déclarent les endpoints HTTP (`@Get`, `@Post`, `@Patch`, `@Delete`), qui appellent des classes de cas d'utilisation injectées au bootstrap du module. Les cas d'utilisation n'interagissent qu'avec des interfaces de repository — aucun appel ORM direct.

Les opérations CRUD sont couvertes pour les 12 modules. Les opérations complexes comprennent :
- La recherche de contenus combinant la BDD locale (données watchlist/notation des utilisateurs) avec la pagination TMDB
- La machine à états des amitiés (en attente → accepté / refusé)
- La pagination des messages par curseur

### Authentification et sécurité

- **Inscription** : vérification d'unicité de l'e-mail, mot de passe haché avec bcrypt (10 rounds), token de vérification envoyé par e-mail.
- **Connexion** : comparaison bcrypt, émission d'un access token (JWT, 15 min, RS256) et d'un refresh token (UUID opaque, 7 jours, stocké en BDD).
- **Rafraîchissement du token** : le serveur valide le refresh token en BDD, émet une nouvelle paire, révoque l'ancien (`revoked_at`).
- **Protection des routes** : `authMiddleware` valide l'access token et attache `req.user`.
- **Socket.IO** : handshake authentifié via le cookie httpOnly `accessToken` ; la connexion est rejetée si le token est invalide.

---

## 6. Démonstration

### Parcours utilisateur principal (de A à Z)

1. **Inscription** : l'utilisateur renseigne nom d'utilisateur, e-mail, mot de passe → reçoit un e-mail de vérification → clique sur le lien → compte activé.
2. **Connexion** : saisit ses identifiants → access token stocké dans Zustand, refresh token posé en cookie httpOnly.
3. **Exploration** : arrive sur la page d'accueil → grille de contenus alimentée par TMDB → filtre par genre → clique sur un film.
4. **Détail du contenu** : consulte l'affiche, le synopsis, le casting, la répartition des notes → ajoute à la liste (statut : À voir) → note 4/5.
5. **Liste de visionnage** : navigue vers l'onglet Liste → voit le film sous « À voir » → change le statut en « En cours ».
6. **Communauté** : envoie une demande d'ami à un autre utilisateur → l'autre accepte → les deux apparaissent dans la liste d'amis de chacun.
7. **Messages** : ouvre une conversation avec l'ami → saisit et envoie un message → l'ami voit l'indicateur de saisie et le message en temps réel.
8. **Paramètres** : modifie le nom d'affichage → change le mot de passe.
9. **Déconnexion** : refresh token révoqué côté serveur → session effacée.

### Exemple d'appel API

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "s3cur3P@ssw0rd"
}
```

Réponse :
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiJ9...",
  "user": {
    "id": "01HXYZ...",
    "username": "alice",
    "email": "alice@example.com"
  }
}
```

Le `refreshToken` est posé par le serveur en cookie httpOnly (en-tête `Set-Cookie`) et n'est jamais exposé dans le corps de la réponse.

### Vérification en base de données

Après que l'utilisateur a ajouté un film à sa liste, la table `watchlist_entries` contient :

```sql
SELECT we.status, c.title
FROM watchlist_entries we
JOIN contents c ON c.id = we.content_id
WHERE we.user_id = '01HXYZ...';
-- Résultat : planning | Inception
```

### Résultat visible côté interface

La page de liste de visionnage affiche la carte du film sous l'onglet « À voir » avec l'affiche et le titre corrects, confirmant le flux complet UI → API → BDD → UI.

---

## 7. Tests et qualité

### Tests unitaires

Les tests de cas d'utilisation injectent des repositories mock créés via des fonctions factory dans les fichiers `domain/interfaces/*.mock.*`. Chaque cas d'utilisation est testé indépendamment de la base de données.

Les tests de composants frontend utilisent Vitest en environnement `node` (sans DOM). Les composants sont appelés comme des fonctions ordinaires et l'arbre JSX est inspecté directement, `@testing-library` n'étant pas installé.

### Tests fonctionnels (intégration)

Les tests de middleware backend construisent des objets `req`/`res` partiels et vérifient les codes de statut et la propagation des erreurs. Le flux d'authentification (inscription → connexion → rafraîchissement → déconnexion) est testé de bout en bout contre la base de données de test en conditions réelles.

### Points vérifiés manuellement

- Expiration et rotation du token JWT : vérifiés en attendant l'expiration de l'access token et en confirmant le rafraîchissement automatique.
- Temps réel WebSocket : vérifié en ouvrant deux onglets navigateur et en confirmant la livraison des messages et les indicateurs de saisie.
- Transitions d'état des amitiés : vérifiées en testant tous les états (en attente, accepté, refusé, bloqué) via l'interface.
- Layout responsive : vérifié sur mobile (375px), tablette (768px) et bureau (1280px).

### Outillage

- **Vitest 4** — runner de tests pour le frontend et le backend (voir le [guide d'écriture des tests](https://mathieusouflis.gitbook.io/kinora.tv/step-by-step-guides/writing-tests))
- **Biome** — lint et format à chaque commit (via Husky + lint-staged, voir le [guide de style de code](https://mathieusouflis.gitbook.io/kinora.tv/team-conventions/code-style))
- **TypeScript** — `pnpm check-types` s'exécute sur tous les packages
- Les rapports de couverture sont générés avec `pnpm test` (couverture intégrée Vitest via v8)

---

## 8. Bilan

### Difficultés rencontrées

- **Intégration des données TMDB** : combiner les résultats paginés de TMDB avec les données locales (notes, liste de visionnage) a nécessité la construction d'une couche de repository composite qui fusionne les deux sources de manière transparente. Voir [intégration TMDB](https://mathieusouflis.gitbook.io/kinora.tv/architecture-deep-dives/tmdb-integration) et [ingestion de contenus](https://mathieusouflis.gitbook.io/kinora.tv/architecture-deep-dives/content-ingestion).
- **JWT double jeton avec révocation côté serveur** : implémenter la rotation du refresh token avec invalidation en BDD a ajouté de la complexité, mais était nécessaire pour une déconnexion sécurisée.
- **Authentification Socket.IO** : authentifier les connexions WebSocket via des cookies httpOnly a nécessité une gestion soigneuse au niveau du handshake (et non via les query params, qui exposeraient le token).
- **Pipeline de génération du SDK monorepo** : s'assurer qu'Orval régénère le SDK après chaque modification du schéma API a requis un ordonnancement précis des tâches Turborepo.

### Solutions mises en place

- **Repository composite** : le pattern `CompositeMovieRepository` / `CompositeSeriesRepository` fusionne les résultats TMDB avec les données BDD locales en un seul appel, gardant les cas d'utilisation ignorants des sources de données.
- **Table `refresh_tokens`** : stocke les tokens hachés avec `revoked_at` et les timestamps d'expiration. La rotation crée une nouvelle ligne et marque l'ancienne comme révoquée de façon atomique.
- **Middleware de handshake Socket** : lit le cookie `accessToken` depuis les en-têtes de handshake et valide le JWT avant d'autoriser la connexion.
- **Pipeline Turborepo** : la tâche `generate-sdk` dépend de la tâche `build` de `apps/api`, garantissant que la spec OpenAPI est toujours à jour avant qu'Orval s'exécute.

### Compétences acquises

- Développement TypeScript full-stack dans un contexte monorepo
- Domain-Driven Design appliqué à un backend Node.js/Express
- Routing basé sur les fichiers et layouts imbriqués avec TanStack Router
- Communication temps réel avec Socket.IO (namespaces, authentification, événements)
- Génération automatisée de SDK API (Orval + OpenAPI)
- Authentification JWT double jeton avec révocation côté serveur
- Tests avec Vitest sans environnement DOM

### Axes d'amélioration

- **Couverture de tests** : la couverture de tests unitaires côté frontend pourrait être significativement augmentée, notamment pour les composants fortement dépendants de hooks.
- **Fonctionnalité Watchparty** : le schéma de base de données est complet ; la couche UI et les événements Socket.IO pour le visionnage synchronisé restent à implémenter.
- **Notifications** : le schéma et la couche service existent ; le centre de notifications frontend n'est pas encore construit.
- **Performance** : les requêtes de recherche de contenus pourraient bénéficier de la recherche plein texte (PostgreSQL `tsvector`) pour remplacer l'approche `ILIKE` actuelle.
- **Accessibilité** : la navigation au clavier et les rôles ARIA nécessitent un audit dédié.

---

## 9. Conclusion

### Résumé du projet

Kirona est une plateforme sociale de cinéma full-stack construite en TypeScript dans un monorepo pnpm. Au cours du semestre, l'équipe a livré l'authentification, l'exploration de contenus (TMDB), la gestion de liste de visionnage, les notes, un système d'amis et la messagerie temps réel — le tout adossé à une base de données PostgreSQL et exposé via une API REST typée avec SDK auto-généré.

Les choix d'architecture (backend DDD, routing basé sur les fichiers, SDK auto-généré, JWT double jeton) ont été guidés par un souci de maintenabilité et de sécurité des types sur l'ensemble de la stack.

### Évolutions possibles

- Compléter la fonctionnalité **Watchparty** pour le visionnage synchronisé avec des amis
- Ajouter un système de **notifications in-app** (demandes d'amis, nouveaux messages)
- Implémenter la **recherche plein texte** pour des requêtes plus rapides et pertinentes
- Construire un **moteur de recommandations** basé sur les notes et l'historique de genres
- Ajouter la **connexion OAuth** (Google, GitHub) comme alternative à l'e-mail/mot de passe
- Publier une **application mobile** en React Native utilisant le SDK API existant

### Références et ressources

**Documentation interne**

| Article | Contenu |
|---------|---------|
| [Vue d'ensemble de l'architecture](https://mathieusouflis.gitbook.io/kinora.tv/architecture/architecture) | Structure monorepo, applications et packages |
| [Architecture backend](https://mathieusouflis.gitbook.io/kinora.tv/architecture/backend) | Flux des requêtes HTTP, couches middleware |
| [Architecture frontend](https://mathieusouflis.gitbook.io/kinora.tv/architecture/frontend) | Routing basé sur les fichiers, modules fonctionnels |
| [Architecture temps réel](https://mathieusouflis.gitbook.io/kinora.tv/architecture/realtime) | Configuration Socket.IO et événements |
| [Pipeline CI/CD](https://mathieusouflis.gitbook.io/kinora.tv/architecture/ci-cd) | GitHub Actions, Turborepo, déploiement Docker |
| [Base de données](https://mathieusouflis.gitbook.io/kinora.tv/database-and-api/database) | Schéma, tables, migrations |
| [Choix techniques](https://mathieusouflis.gitbook.io/kinora.tv/technical-reference/technical-choices) | Sélection des outils et justifications |
| [Spécification du projet](https://mathieusouflis.gitbook.io/kinora.tv/technical-reference/spec) | Spécification complète des fonctionnalités |
| [Référence API](https://mathieusouflis.gitbook.io/kinora.tv/database-and-api/api) | Endpoints REST et Swagger |
| [Pattern module](https://mathieusouflis.gitbook.io/kinora.tv/architecture-deep-dives/module-pattern) | Structure et cycle de vie des modules DDD |
| [Système de décorateurs](https://mathieusouflis.gitbook.io/kinora.tv/architecture-deep-dives/decorator-system) | Décorateurs TypeScript pour les routes |
| [Gestion des erreurs](https://mathieusouflis.gitbook.io/kinora.tv/architecture-deep-dives/error-handling) | Hiérarchie des erreurs et middleware |
| [Intégration TMDB](https://mathieusouflis.gitbook.io/kinora.tv/architecture-deep-dives/tmdb-integration) | Utilisation de l'API externe et mise en cache |
| [Ingestion de contenus](https://mathieusouflis.gitbook.io/kinora.tv/architecture-deep-dives/content-ingestion) | Alimentation BDD à la demande depuis TMDB |
| [Écriture des tests](https://mathieusouflis.gitbook.io/kinora.tv/step-by-step-guides/writing-tests) | Patterns Vitest pour le backend et le frontend |
| [Guide de style de code](https://mathieusouflis.gitbook.io/kinora.tv/team-conventions/code-style) | Règles Biome et conventions |
| [Conventions de commit](https://mathieusouflis.gitbook.io/kinora.tv/team-conventions/commit-conventions) | Format Conventional Commits |
| [Guide développeur](https://mathieusouflis.gitbook.io/kinora.tv/architecture-deep-dives/developer-guide) | Onboarding des contributeurs |
