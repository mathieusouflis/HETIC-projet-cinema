-- =====================================================
-- AUTHENTIFICATION & UTILISATEURS
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255), -- NULL si OAuth uniquement
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  -- OAuth providers (Google, GitHub)
  oauth_provider VARCHAR(50), -- 'google', 'github', NULL
  oauth_id VARCHAR(255), -- ID fourni par le provider
  -- Préférences
  theme VARCHAR(20) DEFAULT 'dark', -- 'dark', 'light'
  language VARCHAR(10) DEFAULT 'fr',
  email_notifications BOOLEAN DEFAULT TRUE,
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  -- Contrainte : email OU oauth doit exister
  CONSTRAINT oauth_or_email CHECK (
    (
      oauth_provider IS NOT NULL
      AND oauth_id IS NOT NULL
    )
    OR (
      email IS NOT NULL
      AND password_hash IS NOT NULL
    )
  )
);

CREATE INDEX idx_users_email ON users (email);

CREATE INDEX idx_users_oauth ON users (oauth_provider, oauth_id);

-- Table pour les refresh tokens (système de rotation)
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL, -- Hash du refresh token
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ, -- NULL = actif, sinon révoqué
  -- Métadonnées de sécurité
  ip_address INET,
  user_agent TEXT,
  device_fingerprint VARCHAR(255)
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens (user_id);

CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens (token_hash);

CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens (expires_at);

-- =====================================================
-- RELATIONS SOCIALES
-- =====================================================
-- Table d'amitié
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT no_self_friend CHECK (user_id != friend_id),
  CONSTRAINT unique_friendship UNIQUE (user_id, friend_id)
);

CREATE INDEX idx_friendships_user ON friendships (user_id, status);

CREATE INDEX idx_friendships_friend ON friendships (friend_id, status);

-- =====================================================
-- CONTENU (Films, Séries, Episodes)
-- =====================================================
-- Catégories/genres
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Acteurs/réalisateurs
CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  bio TEXT,
  photo_url TEXT,
  birth_date DATE,
  nationality VARCHAR(100),
  tmdb_id INTEGER UNIQUE, -- ID de The Movie DB
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_people_name ON people (name);

CREATE INDEX idx_people_tmdb ON people (tmdb_id);

-- Table principale pour films ET séries
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL, -- 'movie', 'series'
  -- Métadonnées communes
  title VARCHAR(255) NOT NULL,
  original_title VARCHAR(255),
  slug VARCHAR(255) UNIQUE NOT NULL,
  synopsis TEXT,
  poster_url TEXT,
  backdrop_url TEXT,
  trailer_url TEXT,
  -- Dates
  release_date DATE,
  YEAR INTEGER,
  -- Durée (pour films uniquement)
  duration_minutes INTEGER, -- NULL pour séries
  -- Métadonnées
  tmdb_id INTEGER UNIQUE,
  imdb_id VARCHAR(20) UNIQUE,
  -- Stats agrégées (dénormalisées pour perf)
  average_rating DECIMAL(3, 2) DEFAULT 0, -- 0.00 à 5.00
  total_ratings INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_type CHECK (type IN ('movie', 'series'))
);

CREATE INDEX idx_content_type ON content (type);

CREATE INDEX idx_content_slug ON content (slug);

CREATE INDEX idx_content_year ON content (YEAR);

CREATE INDEX idx_content_rating ON content (average_rating DESC);

CREATE INDEX idx_content_tmdb ON content (tmdb_id);

-- Relation content <-> categories (many-to-many)
CREATE TABLE content_categories (
  content_id UUID NOT NULL REFERENCES content (id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories (id) ON DELETE CASCADE,
  PRIMARY KEY (content_id, category_id)
);

CREATE INDEX idx_content_categories_category ON content_categories (category_id);

-- Relation content <-> people (acteurs, réalisateurs)
CREATE TABLE content_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES content (id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES people (id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- 'actor', 'director', 'writer', 'producer'
  character_name VARCHAR(255), -- Pour les acteurs
  order_index INTEGER, -- Ordre d'apparition au générique
  CONSTRAINT unique_credit UNIQUE (content_id, person_id, role)
);

CREATE INDEX idx_credits_content ON content_credits (content_id);

CREATE INDEX idx_credits_person ON content_credits (person_id, role);

-- Saisons (uniquement pour les séries)
CREATE TABLE seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID NOT NULL REFERENCES content (id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL,
  name VARCHAR(255),
  overview TEXT,
  poster_url TEXT,
  air_date DATE,
  episode_count INTEGER DEFAULT 0,
  CONSTRAINT unique_season UNIQUE (series_id, season_number),
  CONSTRAINT valid_series CHECK (season_number > 0)
);

CREATE INDEX idx_seasons_series ON seasons (series_id, season_number);

-- Épisodes
CREATE TABLE episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES seasons (id) ON DELETE CASCADE,
  episode_number INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  overview TEXT,
  still_url TEXT,
  air_date DATE,
  duration_minutes INTEGER,
  CONSTRAINT unique_episode UNIQUE (season_id, episode_number),
  CONSTRAINT valid_episode CHECK (episode_number > 0)
);

CREATE INDEX idx_episodes_season ON episodes (season_id, episode_number);

-- =====================================================
-- MESSAGING (Chat privé + groupes)
-- =====================================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL, -- 'direct', 'group'
  name VARCHAR(100), -- NULL pour DM, nom pour groupes
  avatar_url TEXT,
  created_by UUID REFERENCES users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Participants d'une conversation
CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ,
  role VARCHAR(20) DEFAULT 'member', -- 'admin', 'member'
  CONSTRAINT unique_participant UNIQUE (conversation_id, user_id)
);

CREATE INDEX idx_conv_participants_user ON conversation_participants (user_id);

CREATE INDEX idx_conv_participants_conv ON conversation_participants (conversation_id);

-- Plateformes de streaming supportées
CREATE TABLE streaming_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL, -- 'Netflix', 'Disney+', 'Prime Video'
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo_url TEXT,
  base_url TEXT,
  is_supported BOOLEAN DEFAULT TRUE, -- Si l'extension peut sync dessus
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Watchparties
CREATE TABLE watchparties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES content (id) ON DELETE CASCADE,
  season_id UUID REFERENCES seasons (id) ON DELETE CASCADE,
  episode_id UUID REFERENCES episodes (id) ON DELETE CASCADE,
  -- Configuration
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  max_participants INTEGER,
  -- Streaming
  platform_id UUID NOT NULL REFERENCES streaming_platforms (id),
  platform_url TEXT NOT NULL, -- URL exacte du film sur la plateforme
  -- Planification
  scheduled_at TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'live', 'completed', 'cancelled'
  -- Synchronisation (pour l'extension)
  current_position_timestamp INTEGER DEFAULT 0, -- Position en secondes
  is_playing BOOLEAN DEFAULT FALSE,
  leader_user_id UUID REFERENCES users (id), -- Qui contrôle la lecture
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_watchparties_creator ON watchparties (created_by);

CREATE INDEX idx_watchparties_content ON watchparties (content_id);

CREATE INDEX idx_watchparties_scheduled ON watchparties (scheduled_at, status);

CREATE INDEX idx_watchparties_status ON watchparties (status);

CREATE INDEX idx_watchparties_season ON watchparties (season_id);

CREATE INDEX idx_watchparties_episode ON watchparties (episode_id);

CREATE INDEX idx_watchparties_content_related ON watchparties (content_id, season_id, episode_id);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'text', -- 'text', 'emoji', 'spoiler', 'system'
  -- Pour les watchparty chats
  watchparty_id UUID REFERENCES watchparties (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ -- Soft delete
);

CREATE INDEX idx_messages_conversation ON messages (conversation_id, created_at DESC);

CREATE INDEX idx_messages_watchparty ON messages (watchparty_id, created_at DESC);

-- =====================================================
-- INTERACTIONS UTILISATEUR <-> CONTENU
-- =====================================================
-- Ratings (notes de 1 à 5)
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES content (id) ON DELETE CASCADE,
  rating DECIMAL(2, 1) NOT NULL, -- 1.0 à 5.0 (demi-étoiles autorisées)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_rating UNIQUE (user_id, content_id),
  CONSTRAINT valid_rating CHECK (
    rating >= 1.0
    AND rating <= 5.0
  )
);

CREATE INDEX idx_ratings_user ON ratings (user_id);

CREATE INDEX idx_ratings_content ON ratings (content_id);

-- Commentaires/reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES content (id) ON DELETE CASCADE,
  title VARCHAR(255),
  content TEXT NOT NULL,
  is_spoiler BOOLEAN DEFAULT FALSE,
  parent_review_id UUID REFERENCES reviews (id) ON DELETE CASCADE,
  -- Stats
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_reviews_content ON reviews (content_id, created_at DESC);

CREATE INDEX idx_reviews_user ON reviews (user_id);

CREATE INDEX idx_reviews_parent ON reviews (parent_review_id);

-- Likes sur reviews
CREATE TABLE review_likes (
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  review_id UUID NOT NULL REFERENCES reviews (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, review_id)
);

-- Watchlist personnelle (films à voir, vus, en cours)
CREATE TABLE user_watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES content (id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'to_watch', -- 'to_watch', 'watching', 'completed'
  -- Progression pour les séries
  current_season INTEGER,
  current_episode INTEGER,
  -- Métadonnées
  added_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  CONSTRAINT unique_watchlist_entry UNIQUE (user_id, content_id)
);

CREATE INDEX idx_watchlist_user ON user_watchlist (user_id, status);

CREATE INDEX idx_watchlist_content ON user_watchlist (content_id);

-- Listes publiques/partagées (collections thématiques)
CREATE TABLE lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  cover_image_url TEXT,
  -- Stats
  likes_count INTEGER DEFAULT 0,
  items_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lists_user ON lists (user_id);

CREATE INDEX idx_lists_public ON lists (is_public, created_at DESC);

-- Items dans les listes
CREATE TABLE list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES lists (id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES content (id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  note TEXT, -- Note personnelle sur pourquoi ce film est dans la liste
  added_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_list_item UNIQUE (list_id, content_id)
);

CREATE INDEX idx_list_items_list ON list_items (list_id, order_index);

-- Likes sur listes
CREATE TABLE list_likes (
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  list_id UUID NOT NULL REFERENCES lists (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, list_id)
);

-- Likes sur acteurs/personnes (communauté)
CREATE TABLE people_likes (
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES people (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, person_id)
);

-- =====================================================
-- WATCHPARTIES
-- =====================================================
-- Participants des watchparties
CREATE TABLE watchparty_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  watchparty_id UUID NOT NULL REFERENCES watchparties (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'invited', -- 'invited', 'confirmed', 'joined', 'left'
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  -- Métadonnées pour analytics
  total_watch_time_seconds INTEGER DEFAULT 0,
  CONSTRAINT unique_watchparty_participant UNIQUE (watchparty_id, user_id)
);

CREATE INDEX idx_watchparty_participants_party ON watchparty_participants (watchparty_id, status);

CREATE INDEX idx_watchparty_participants_user ON watchparty_participants (user_id);

-- Invitations (si watchparty privée)
CREATE TABLE watchparty_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  watchparty_id UUID NOT NULL REFERENCES watchparties (id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  invitee_id UUID REFERENCES users (id) ON DELETE CASCADE, -- NULL si invitation par lien
  invite_token VARCHAR(255) UNIQUE, -- Pour invitation par lien
  expires_at TIMESTAMPTZ,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_invitation UNIQUE (watchparty_id, invitee_id)
);

CREATE INDEX idx_invitations_token ON watchparty_invitations (invite_token);

CREATE INDEX idx_invitations_invitee ON watchparty_invitations (invitee_id);

-- =====================================================
-- ANALYTICS & MÉTRIQUES (Spotify Wrapped-like)
-- =====================================================
-- Log des événements utilisateur (pour analytics détaillées)
CREATE TABLE user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- 'watch_started', 'watch_completed', 'watchparty_joined', 'review_posted'
  -- Contexte
  content_id UUID REFERENCES content (id) ON DELETE SET NULL,
  watchparty_id UUID REFERENCES watchparties (id) ON DELETE SET NULL,
  -- Métadonnées spécifiques
  metadata JSONB, -- Flexible : durée visionnée, rating donné, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_user ON user_activity_logs (user_id, created_at DESC);

CREATE INDEX idx_activity_type ON user_activity_logs (event_type);

CREATE INDEX idx_activity_content ON user_activity_logs (content_id);

-- Stats agrégées par utilisateur (pré-calculées pour perf)
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  -- Stats de visionnage
  total_watch_time_minutes INTEGER DEFAULT 0,
  total_movies_watched INTEGER DEFAULT 0,
  total_series_watched INTEGER DEFAULT 0,
  total_episodes_watched INTEGER DEFAULT 0,
  -- Stats sociales
  total_watchparties_created INTEGER DEFAULT 0,
  total_watchparties_joined INTEGER DEFAULT 0,
  total_reviews_written INTEGER DEFAULT 0,
  total_lists_created INTEGER DEFAULT 0,
  -- Favoris (pour Wrapped)
  favorite_genre_id UUID REFERENCES categories (id),
  favorite_decade INTEGER, -- Ex: 1990
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'watchparty_invite', 'friend_request', 'review_like', 'new_release'
  title VARCHAR(255) NOT NULL,
  message TEXT,
  -- Lien associé
  related_user_id UUID REFERENCES users (id) ON DELETE CASCADE,
  related_content_id UUID REFERENCES content (id) ON DELETE CASCADE,
  related_watchparty_id UUID REFERENCES watchparties (id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications (user_id, is_read, created_at DESC);

-- =====================================================
-- TRIGGERS & FUNCTIONS
-- =====================================================
-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column () RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer le trigger sur toutes les tables avec updated_at
CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON users FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column ();

CREATE TRIGGER update_content_updated_at BEFORE
UPDATE ON content FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column ();

CREATE TRIGGER update_watchparties_updated_at BEFORE
UPDATE ON watchparties FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column ();

CREATE TRIGGER update_lists_updated_at BEFORE
UPDATE ON lists FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column ();

-- Trigger pour mettre à jour les stats agrégées de content
CREATE OR REPLACE FUNCTION update_content_rating_stats () RETURNS TRIGGER AS $$
BEGIN
    UPDATE content
    SET
        average_rating = (SELECT COALESCE(AVG(rating), 0) FROM ratings WHERE content_id = NEW.content_id),
        total_ratings = (SELECT COUNT(*) FROM ratings WHERE content_id = NEW.content_id)
    WHERE id = NEW.content_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rating_stats
AFTER INSERT
OR
UPDATE ON ratings FOR EACH ROW
EXECUTE FUNCTION update_content_rating_stats ();

-- Trigger pour mettre à jour items_count dans lists
CREATE OR REPLACE FUNCTION update_list_items_count () RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE lists SET items_count = items_count - 1 WHERE id = OLD.list_id;
        RETURN OLD;
    ELSE
        UPDATE lists SET items_count = items_count + 1 WHERE id = NEW.list_id;
        RETURN NEW;
    END IF;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_list_count
AFTER INSERT
OR DELETE ON list_items FOR EACH ROW
EXECUTE FUNCTION update_list_items_count ();

-- =====================================================
-- DONNÉES INITIALES (Seed)
-- =====================================================
-- Plateformes de streaming principales
INSERT INTO
  streaming_platforms (name, slug, base_url, is_supported)
VALUES
  (
    'Netflix',
    'netflix',
    'https://www.netflix.com',
    TRUE
  ),
  (
    'Disney+',
    'disney-plus',
    'https://www.disneyplus.com',
    TRUE
  ),
  (
    'Prime Video',
    'prime-video',
    'https://www.primevideo.com',
    TRUE
  ),
  (
    'HBO Max',
    'hbo-max',
    'https://www.max.com',
    FALSE
  ),
  (
    'Apple TV+',
    'apple-tv',
    'https://tv.apple.com',
    FALSE
  );

-- Catégories de base
INSERT INTO
  categories (name, slug)
VALUES
  ('Action', 'action'),
  ('Comédie', 'comedie'),
  ('Drame', 'drame'),
  ('Science-Fiction', 'science-fiction'),
  ('Thriller', 'thriller'),
  ('Horreur', 'horreur'),
  ('Romance', 'romance'),
  ('Documentaire', 'documentaire'),
  ('Animation', 'animation'),
  ('Fantastique', 'fantastique');

-- =====================================================
-- VUES UTILES (pour simplifier les requêtes)
-- =====================================================
-- Vue pour obtenir les films populaires
CREATE VIEW popular_content AS
SELECT
  c.*,
  COALESCE(c.total_ratings * c.average_rating, 0) AS popularity_score
FROM
  content c
ORDER BY
  popularity_score DESC;

-- Vue pour les watchparties à venir
CREATE VIEW upcoming_watchparties AS
SELECT
  wp.*,
  u.username AS creator_username,
  c.title AS content_title,
  sp.name AS platform_name,
  COUNT(wpp.id) AS participant_count
FROM
  watchparties wp
  JOIN users u ON wp.created_by = u.id
  JOIN content c ON wp.content_id = c.id
  JOIN streaming_platforms sp ON wp.platform_id = sp.id
  LEFT JOIN watchparty_participants wpp ON wp.id = wpp.watchparty_id
  AND wpp.status = 'confirmed'
WHERE
  wp.status = 'scheduled'
  AND wp.scheduled_at > NOW()
GROUP BY
  wp.id,
  u.username,
  c.title,
  sp.name;
