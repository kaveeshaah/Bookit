-- Bookit database schema (PostgreSQL 14+)
-- Run against an empty database. Safe to run once; see README for setup.

CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TYPE user_role AS ENUM ('admin', 'member');
CREATE TYPE reservation_status AS ENUM ('confirmed', 'cancelled');

CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          user_role NOT NULL DEFAULT 'member',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE resources (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  type        VARCHAR(50) NOT NULL,
  description TEXT,
  capacity    INT CHECK (capacity > 0),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reservations (
  id          SERIAL PRIMARY KEY,
  resource_id INT NOT NULL REFERENCES resources(id),
  user_id     INT NOT NULL REFERENCES users(id),
  title       VARCHAR(150) NOT NULL,
  start_time  TIMESTAMPTZ NOT NULL,
  end_time    TIMESTAMPTZ NOT NULL,
  status      reservation_status NOT NULL DEFAULT 'confirmed',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_time > start_time),
  -- The double-booking guard: no two confirmed reservations for the
  -- same resource may overlap in time. Cancelled ones are ignored.
  EXCLUDE USING gist (
    resource_id WITH =,
    tstzrange(start_time, end_time) WITH &&
  ) WHERE (status = 'confirmed')
);

CREATE INDEX idx_reservations_resource_time ON reservations (resource_id, start_time);
CREATE INDEX idx_reservations_user ON reservations (user_id);
