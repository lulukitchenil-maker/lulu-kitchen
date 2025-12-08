/*
  # Create cities and streets tables for delivery area management

  1. New Tables
    - `cities`
      - `id` (uuid, primary key) - Unique identifier
      - `city_name` (text, unique) - Name of the city
      - `delivery_enabled` (boolean) - Whether delivery is available
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

    - `streets`
      - `id` (uuid, primary key) - Unique identifier
      - `street_name` (text) - Name of the street
      - `city_name` (text) - City the street belongs to
      - `search_vector` (tsvector) - Full-text search vector
      - `created_at` (timestamptz) - Creation timestamp

  2. Indexes
    - Index on city_name for fast filtering
    - GIN index on search_vector for full-text search
    - Composite index on (city_name, street_name) for lookups

  3. Security
    - Enable RLS on both tables
    - Add policies for public read access (street search is public)
*/

CREATE TABLE IF NOT EXISTS cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_name text UNIQUE NOT NULL,
  delivery_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS streets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  street_name text NOT NULL,
  city_name text NOT NULL,
  search_vector tsvector,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(city_name);
CREATE INDEX IF NOT EXISTS idx_cities_delivery ON cities(delivery_enabled);

CREATE INDEX IF NOT EXISTS idx_streets_city ON streets(city_name);
CREATE INDEX IF NOT EXISTS idx_streets_name ON streets(street_name);
CREATE INDEX IF NOT EXISTS idx_streets_city_street ON streets(city_name, street_name);
CREATE INDEX IF NOT EXISTS idx_streets_search ON streets USING GIN(search_vector);

ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE streets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to cities"
  ON cities FOR SELECT
  USING (true);

CREATE POLICY "Public read access to streets"
  ON streets FOR SELECT
  USING (true);