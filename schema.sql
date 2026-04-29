-- Text to Speech — schéma PostgreSQL
-- Coller dans psql ou Neon / Supabase SQL editor

CREATE TABLE "users" (
    "id"          SERIAL      PRIMARY KEY,
    "email"       TEXT        NOT NULL UNIQUE,
    "firstName"   TEXT        NOT NULL,
    "lastName"    TEXT        NOT NULL,
    "password"    TEXT,
    "image"       TEXT,
    "createdAt"   TIMESTAMP   NOT NULL DEFAULT NOW(),
    "updatedAt"   TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE TABLE "accounts" (
    "id"                SERIAL  PRIMARY KEY,
    "userId"            INT     NOT NULL,
    "provider"          TEXT    NOT NULL,
    "providerAccountId" TEXT    NOT NULL,
    CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "accounts_provider_providerAccountId_key" UNIQUE ("provider", "providerAccountId")
);

CREATE TABLE "FavoriteVoice" (
    "id"        SERIAL      PRIMARY KEY,
    "userId"    INT         NOT NULL,
    "voiceType" TEXT        NOT NULL,
    "voiceId"   TEXT        NOT NULL,
    "voiceName" TEXT        NOT NULL,
    "metadata"  JSONB,
    "createdAt" TIMESTAMP   NOT NULL DEFAULT NOW(),
    CONSTRAINT "FavoriteVoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "FavoriteVoice_userId_voiceType_voiceId_key" UNIQUE ("userId", "voiceType", "voiceId")
);

CREATE INDEX "FavoriteVoice_userId_idx" ON "FavoriteVoice"("userId");

CREATE TABLE "conversions" (
    "id"        SERIAL      PRIMARY KEY,
    "text"      TEXT        NOT NULL,
    "voice"     TEXT        NOT NULL,
    "speed"     FLOAT       NOT NULL,
    "pitch"     FLOAT       NOT NULL,
    "audioUrl"  TEXT        NOT NULL,
    "createdAt" TIMESTAMP   NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP   NOT NULL DEFAULT NOW(),
    "userId"    INT         NOT NULL,
    CONSTRAINT "conversions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id")
);

-- Trigger pour mettre à jour updatedAt automatiquement
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "users_updated_at"
    BEFORE UPDATE ON "users"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER "conversions_updated_at"
    BEFORE UPDATE ON "conversions"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
