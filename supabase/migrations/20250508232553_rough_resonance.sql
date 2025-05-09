/*
  # Create predefined_tours table
  
  1. New Tables
    - `predefined_tours`
      - `id` (uuid, primary key, default gen_random_uuid())
      - `name` (text, NOT NULL)
      - `description` (text)
      - `route_coordinates` (jsonb, NOT NULL, stores an array of [lat, lng] pairs)
      - `display_price` (numeric, >= 0)
      - `display_duration` (text)
      - `created_at` (timestamptz, NOT NULL, Default now())
      - `updated_at` (timestamptz, NOT NULL, Default now())
  
  2. Security
    - Enable RLS on `predefined_tours` table
    - Add policy for authenticated users to manage predefined tours
    - Add policy for public users to read predefined tours
*/

CREATE TABLE IF NOT EXISTS predefined_tours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  route_coordinates jsonb NOT NULL,
  display_price numeric CHECK (display_price >= 0),
  display_duration text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE predefined_tours ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to manage predefined tours
CREATE POLICY "Authenticated users can manage predefined tours"
  ON predefined_tours
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy for public users to read predefined tours
CREATE POLICY "Public users can read predefined tours"
  ON predefined_tours
  FOR SELECT
  TO anon
  USING (true);

-- Insert sample tour data
INSERT INTO predefined_tours (
  name, description, route_coordinates, display_price, display_duration
)
VALUES 
(
  'Blue Cave Adventure',
  'Explore the mesmerizing Blue Cave and visit the beautiful islands of Vis and Biševo. This tour offers a unique opportunity to witness the stunning blue light phenomenon inside the cave.',
  '[
    [43.5081, 16.4402],
    [43.0262, 16.1418],
    [42.9803, 16.0199],
    [42.9246, 16.2446]
  ]'::jsonb,
  120,
  '8 hours'
),
(
  'Hvar & Pakleni Islands',
  'Visit the glamorous island of Hvar and explore the beautiful Pakleni archipelago with its crystal clear waters, hidden beaches and lagoons perfect for swimming.',
  '[
    [43.5081, 16.4402],
    [43.1580, 16.4493],
    [43.1727, 16.3556],
    [43.1938, 16.4000]
  ]'::jsonb,
  100,
  '6 hours'
),
(
  'Brač & Šolta Discovery',
  'Discover the islands closest to Split - Brač with its famous Golden Horn beach and Šolta with its charming fishing villages and olive groves.',
  '[
    [43.5081, 16.4402],
    [43.3787, 16.5563],
    [43.3844, 16.6418],
    [43.3951, 16.3022]
  ]'::jsonb,
  90,
  '5 hours'
);