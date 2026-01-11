-- Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CORE TABLES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  employee_id TEXT UNIQUE,
  full_name TEXT,
  unit_code TEXT,
  unit_type TEXT,
  role TEXT,
  management_level TEXT,
  phone TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS postal_units (
  code TEXT PRIMARY KEY,
  name TEXT,
  unit_type TEXT,
  latlng geography(POINT)
);

CREATE TABLE IF NOT EXISTS vehicles (
  vehicle_id TEXT PRIMARY KEY,
  license_plate TEXT UNIQUE,
  bcvh_code TEXT,
  current_mileage_km INT,
  next_oil_change_km INT,
  registration_expiry DATE
);

CREATE TABLE IF NOT EXISTS ccdc_inventory (
  asset_id TEXT PRIMARY KEY,
  category_code TEXT,
  specifications JSONB,
  total_usage_hours INT
);

CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_name TEXT,
  route_path geography(LINESTRING),
  total_km FLOAT GENERATED ALWAYS AS (ST_Length(route_path::geography)/1000) STORED
);

CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id TEXT,
  bcvh_code TEXT,
  status TEXT DEFAULT 'draft',
  duration_hours FLOAT,
  lat FLOAT,
  lng FLOAT,
  photo_url TEXT,
  check_in_time TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  assigned_to TEXT,
  assigned_employee JSONB
);

CREATE TABLE IF NOT EXISTS maintenance_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id TEXT,
  status TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS ccdc_categories (
  category_code TEXT PRIMARY KEY,
  category_name TEXT
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  unit_code TEXT
);

CREATE TABLE IF NOT EXISTS ccdc_maintenance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id TEXT
);

CREATE TABLE IF NOT EXISTS ccdc_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id TEXT,
  message TEXT
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'ttvh_all' AND tablename = 'profiles'
    ) THEN
        CREATE POLICY "ttvh_all" ON profiles FOR ALL USING (true);
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'bcvh_own_unit' AND tablename = 'profiles'
    ) THEN
        CREATE POLICY "bcvh_own_unit" ON profiles USING (unit_code = (auth.jwt()->>'app_metadata'->>'unit_code')::text);
    END IF;
END
$$;

-- Realtime Tables
-- Check if publication exists before adding tables or just alter. Supabase usually has `supabase_realtime`.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE profiles, routes, attendance, shifts, vehicles, notifications;
  END IF;
END
$$;
