/*
  # Enhance Cities and Streets Tables for Complete Delivery System

  ## Overview
  This migration enhances the existing cities and streets tables to support
  comprehensive delivery management with proper Hebrew/English names, distance
  calculations, delivery fees, and search optimization.

  ## Changes Made

  ### 1. Cities Table Enhancements
  - Rename `city_name` to `name_he` for consistency
  - Add `name_en` for English names
  - Add `distance_km` - distance from restaurant (within 15km)
  - Add `delivery_fee` - delivery cost in agorot
  - Add `min_order_amount` - minimum order for delivery in agorot
  - Add `estimated_delivery_minutes` - delivery time estimate

  ### 2. Streets Table Enhancements
  - Add `city_id` foreign key to reference cities table
  - Rename `street_name` to `street_name_he`
  - Add `street_name_en` for English names
  - Add `official_code` for government database reference
  - Remove `city_name` (replaced with city_id foreign key)
  - Add unique constraint on (city_id, street_name_he)

  ### 3. New Street Synonyms Table
  - Create table for alternative street name spellings
  - Enable better search with common variations

  ### 4. Enhanced Search
  - Keep existing trigram indexes
  - Add simple text search support for Hebrew
  - Optimize for autocomplete queries

  ### 5. Initial Data Population
  Updates cities table with all 11 delivery settlements including
  proper distances, fees, and delivery information.

  ## Important Notes
  - Existing data is preserved where possible
  - Data migration happens automatically
  - Search indexes are rebuilt for optimal performance
*/

-- Add new columns to cities table if they don't exist
DO $$
BEGIN
  -- Rename city_name to name_he if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cities' AND column_name = 'city_name'
  ) THEN
    ALTER TABLE cities RENAME COLUMN city_name TO name_he;
  END IF;

  -- Add name_en column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cities' AND column_name = 'name_en'
  ) THEN
    ALTER TABLE cities ADD COLUMN name_en text;
  END IF;

  -- Add distance_km column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cities' AND column_name = 'distance_km'
  ) THEN
    ALTER TABLE cities ADD COLUMN distance_km numeric(4,2) CHECK (distance_km >= 0 AND distance_km <= 15);
  END IF;

  -- Add delivery_fee column (in agorot)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cities' AND column_name = 'delivery_fee'
  ) THEN
    ALTER TABLE cities ADD COLUMN delivery_fee integer DEFAULT 0 CHECK (delivery_fee >= 0);
  END IF;

  -- Add min_order_amount column (in agorot)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cities' AND column_name = 'min_order_amount'
  ) THEN
    ALTER TABLE cities ADD COLUMN min_order_amount integer DEFAULT 0 CHECK (min_order_amount >= 0);
  END IF;

  -- Add estimated_delivery_minutes column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cities' AND column_name = 'estimated_delivery_minutes'
  ) THEN
    ALTER TABLE cities ADD COLUMN estimated_delivery_minutes integer DEFAULT 45 CHECK (estimated_delivery_minutes > 0);
  END IF;
END $$;

-- Add new columns to streets table if they don't exist
DO $$
BEGIN
  -- Add city_id column (will be populated below)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'streets' AND column_name = 'city_id'
  ) THEN
    ALTER TABLE streets ADD COLUMN city_id uuid;
  END IF;

  -- Rename street_name to street_name_he if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'streets' AND column_name = 'street_name'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'streets' AND column_name = 'street_name_he'
  ) THEN
    ALTER TABLE streets RENAME COLUMN street_name TO street_name_he;
  END IF;

  -- Add street_name_en column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'streets' AND column_name = 'street_name_en'
  ) THEN
    ALTER TABLE streets ADD COLUMN street_name_en text;
  END IF;

  -- Add official_code column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'streets' AND column_name = 'official_code'
  ) THEN
    ALTER TABLE streets ADD COLUMN official_code text;
  END IF;

  -- Add updated_at column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'streets' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE streets ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create street_synonyms table if it doesn't exist
CREATE TABLE IF NOT EXISTS street_synonyms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  street_id uuid NOT NULL REFERENCES streets(id) ON DELETE CASCADE,
  synonym_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(street_id, synonym_name)
);

-- Enable RLS on street_synonyms if not already enabled
ALTER TABLE street_synonyms ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for street_synonyms
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'street_synonyms' AND policyname = 'Anyone can view street synonyms'
  ) THEN
    CREATE POLICY "Anyone can view street synonyms"
      ON street_synonyms FOR SELECT
      TO public
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'street_synonyms' AND policyname = 'Only service role can manage street synonyms'
  ) THEN
    CREATE POLICY "Only service role can manage street synonyms"
      ON street_synonyms FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_streets_city_id ON streets(city_id);
CREATE INDEX IF NOT EXISTS idx_streets_name_he ON streets(street_name_he);
CREATE INDEX IF NOT EXISTS idx_street_synonyms_street_id ON street_synonyms(street_id);
CREATE INDEX IF NOT EXISTS idx_cities_name_he ON cities(name_he);

-- Create trigram extension if not exists
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create trigram index for fuzzy matching on street names
CREATE INDEX IF NOT EXISTS idx_streets_name_he_trgm ON streets USING gin(street_name_he gin_trgm_ops);

-- Update or insert cities data (11 delivery settlements)
INSERT INTO cities (name_he, name_en, distance_km, delivery_fee, min_order_amount, estimated_delivery_minutes, delivery_enabled)
VALUES
  ('ירושלים', 'Jerusalem', 5.0, 0, 0, 30, true),
  ('מבשרת ציון', 'Mevaseret Zion', 8.0, 2000, 50000, 40, true),
  ('אבו גוש', 'Abu Ghosh', 12.0, 3000, 60000, 45, true),
  ('מוצא עילית', 'Moza Illit', 10.0, 2500, 55000, 42, true),
  ('מוצא תחתית', 'Moza Tahit', 11.0, 2500, 55000, 43, true),
  ('מעלה החמישה', 'Ma''ale HaHamisha', 13.0, 3500, 65000, 50, true),
  ('קרית יערים', 'Kiryat Ye''arim', 9.0, 2500, 55000, 40, true),
  ('אורה', 'Ora', 14.0, 4000, 70000, 55, true),
  ('בית זית', 'Beit Zayit', 11.0, 3000, 60000, 45, true),
  ('עין ראפה', 'Ein Rafa', 13.0, 3500, 65000, 50, true),
  ('עין נקובא', 'Ein Nakuba', 12.0, 3000, 60000, 47, true)
ON CONFLICT (name_he) 
DO UPDATE SET
  name_en = EXCLUDED.name_en,
  distance_km = EXCLUDED.distance_km,
  delivery_fee = EXCLUDED.delivery_fee,
  min_order_amount = EXCLUDED.min_order_amount,
  estimated_delivery_minutes = EXCLUDED.estimated_delivery_minutes,
  delivery_enabled = EXCLUDED.delivery_enabled,
  updated_at = now();

-- Migrate existing streets data: link streets to cities via city_name
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'streets' AND column_name = 'city_name'
  ) THEN
    -- Link existing streets to cities
    UPDATE streets s
    SET city_id = c.id
    FROM cities c
    WHERE s.city_name = c.name_he
    AND s.city_id IS NULL;
  END IF;
END $$;

-- Add foreign key constraint after data migration
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'streets_city_id_fkey'
  ) THEN
    ALTER TABLE streets 
    ADD CONSTRAINT streets_city_id_fkey 
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Drop city_name column if it exists (we now use city_id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'streets' AND column_name = 'city_name'
  ) THEN
    ALTER TABLE streets DROP COLUMN city_name;
  END IF;
END $$;

-- Add unique constraint on city_id + street_name_he
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'streets_city_id_street_name_he_key'
  ) THEN
    -- Remove any duplicates first
    DELETE FROM streets a USING streets b
    WHERE a.id < b.id
    AND a.city_id = b.city_id
    AND a.street_name_he = b.street_name_he
    AND a.city_id IS NOT NULL
    AND b.city_id IS NOT NULL;
    
    -- Add unique constraint
    ALTER TABLE streets 
    ADD CONSTRAINT streets_city_id_street_name_he_key 
    UNIQUE (city_id, street_name_he);
  END IF;
END $$;

-- Function to update updated_at timestamp (if doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to maintain updated_at
DROP TRIGGER IF EXISTS cities_updated_at ON cities;
CREATE TRIGGER cities_updated_at
  BEFORE UPDATE ON cities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS streets_updated_at ON streets;
CREATE TRIGGER streets_updated_at
  BEFORE UPDATE ON streets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update search_vector automatically using simple text search
CREATE OR REPLACE FUNCTION update_street_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple', COALESCE(NEW.street_name_he, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to maintain search_vector
DROP TRIGGER IF EXISTS streets_search_vector_update ON streets;
CREATE TRIGGER streets_search_vector_update
  BEFORE INSERT OR UPDATE OF street_name_he
  ON streets
  FOR EACH ROW
  EXECUTE FUNCTION update_street_search_vector();

-- Update search_vector for existing streets
UPDATE streets 
SET search_vector = to_tsvector('simple', COALESCE(street_name_he, ''))
WHERE search_vector IS NULL OR search_vector = ''::tsvector;