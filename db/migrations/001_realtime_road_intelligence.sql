CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE report_status AS ENUM ('pending', 'active', 'verified', 'rejected', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE report_source AS ENUM ('user', 'admin', 'system', 'official_feed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE confirmation_action AS ENUM ('confirm', 'dismiss', 'still_there', 'not_there');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE traffic_level AS ENUM ('fluid', 'moderate', 'congested', 'blocked');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS incident_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text,
  description text,
  latitude double precision NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude double precision NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  geom geography(Point, 4326) GENERATED ALWAYS AS (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
  ) STORED,
  severity text NOT NULL,
  confidence_score numeric(4,3) NOT NULL DEFAULT 0.45,
  status report_status NOT NULL DEFAULT 'active',
  source report_source NOT NULL DEFAULT 'user',
  reported_by_user_id text,
  evidence_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  verified_at timestamptz,
  rejected_at timestamptz,
  rejection_reason text
);

CREATE TABLE IF NOT EXISTS speed_samples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymized_device_session_id text NOT NULL,
  latitude double precision NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude double precision NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  geom geography(Point, 4326) GENERATED ALWAYS AS (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
  ) STORED,
  speed_kph numeric(6,2) NOT NULL CHECK (speed_kph BETWEEN 0 AND 220),
  heading numeric(5,2),
  vehicle_type text,
  accuracy_meters numeric(7,2),
  matched_road_segment_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS road_segment_traffic (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  osm_way_id bigint,
  internal_segment_id text UNIQUE NOT NULL,
  road_name text,
  geom geometry(MultiLineString, 4326),
  expected_speed_kph numeric(6,2) NOT NULL DEFAULT 60,
  average_speed_kph numeric(6,2) NOT NULL DEFAULT 60,
  traffic_level traffic_level NOT NULL DEFAULT 'fluid',
  confidence_score numeric(4,3) NOT NULL DEFAULT 0.1,
  sample_count integer NOT NULL DEFAULT 0,
  last_updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS incident_confirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_report_id uuid NOT NULL REFERENCES incident_reports(id) ON DELETE CASCADE,
  user_id text,
  anonymized_device_session_id text,
  action confirmation_action NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS incident_reports_geom_gix ON incident_reports USING GIST (geom);
CREATE INDEX IF NOT EXISTS incident_reports_status_idx ON incident_reports (status);
CREATE INDEX IF NOT EXISTS incident_reports_expires_at_idx ON incident_reports (expires_at);
CREATE INDEX IF NOT EXISTS incident_reports_type_idx ON incident_reports (type);
CREATE INDEX IF NOT EXISTS incident_reports_created_at_idx ON incident_reports (created_at);

CREATE INDEX IF NOT EXISTS speed_samples_geom_gix ON speed_samples USING GIST (geom);
CREATE INDEX IF NOT EXISTS speed_samples_matched_segment_idx ON speed_samples (matched_road_segment_id);
CREATE INDEX IF NOT EXISTS speed_samples_created_at_idx ON speed_samples (created_at);

CREATE INDEX IF NOT EXISTS road_segment_traffic_geom_gix ON road_segment_traffic USING GIST (geom);
CREATE INDEX IF NOT EXISTS road_segment_traffic_level_idx ON road_segment_traffic (traffic_level);
CREATE INDEX IF NOT EXISTS road_segment_traffic_last_updated_idx ON road_segment_traffic (last_updated_at);

CREATE INDEX IF NOT EXISTS incident_confirmations_report_idx ON incident_confirmations (incident_report_id);
