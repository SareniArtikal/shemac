/*
  # Create tour_settings table
  
  1. New Tables
    - `tour_settings`
      - `id` (int8, primary key, unique=1)
      - `max_points` (int4, NOT NULL, >= 1)
      - `max_people` (int4, NOT NULL, >= 1)
      - `start_fee` (numeric, NOT NULL, >= 0)
      - `per_distance_rate` (numeric, NOT NULL, >= 0)
      - `distance_unit` (text, NOT NULL, CHECK ('km', 'miles'))
      - `currency_code` (text, NOT NULL)
      - `max_distance_radius` (numeric, NOT NULL, >= 0)
      - `distance_radius_unit` (text, NOT NULL, CHECK ('km', 'miles'))
      - `created_at` (timestamptz, NOT NULL, Default now())
      - `updated_at` (timestamptz, NOT NULL, Default now())
  
  2. Security
    - Enable RLS on `tour_settings` table
    - Add policy for authenticated users to manage tour settings
    - Add policy for public users to read tour settings
*/

CREATE TABLE IF NOT EXISTS tour_settings (
  id int8 PRIMARY KEY,
  max_points int4 NOT NULL CHECK (max_points >= 1),
  max_people int4 NOT NULL CHECK (max_people >= 1),
  start_fee numeric NOT NULL CHECK (start_fee >= 0),
  per_distance_rate numeric NOT NULL CHECK (per_distance_rate >= 0),
  distance_unit text NOT NULL CHECK (distance_unit IN ('km', 'miles')),
  currency_code text NOT NULL,
  max_distance_radius numeric NOT NULL CHECK (max_distance_radius >= 0),
  distance_radius_unit text NOT NULL CHECK (distance_radius_unit IN ('km', 'miles')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create a unique constraint to ensure we only have one row with id=1
ALTER TABLE tour_settings ADD CONSTRAINT single_settings_row UNIQUE (id);

-- Insert default settings
INSERT INTO tour_settings (
  id, max_points, max_people, start_fee, per_distance_rate, 
  distance_unit, currency_code, max_distance_radius, distance_radius_unit
) 
VALUES (
  1, 5, 12, 50, 3, 'km', 'EUR', 30, 'km'
)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE tour_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to manage tour settings
CREATE POLICY "Authenticated users can manage tour settings"
  ON tour_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy for public users to read tour settings
CREATE POLICY "Public users can read tour settings"
  ON tour_settings
  FOR SELECT
  TO anon
  USING (true);