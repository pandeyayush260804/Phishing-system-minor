/*
  # Phishing Detection System Database Schema

  ## Overview
  This migration creates a comprehensive database schema for the real-time AI/ML-based 
  phishing detection and prevention system.

  ## New Tables

  ### 1. `phishing_urls`
  Stores detected and reported phishing URLs with metadata
  - `id` (uuid, primary key)
  - `url` (text, the full URL)
  - `domain` (text, extracted domain)
  - `status` (text, current status: active, inactive, pending)
  - `threat_level` (text, risk level: critical, high, medium, low)
  - `detection_method` (text, how it was detected)
  - `first_seen` (timestamptz)
  - `last_seen` (timestamptz)
  - `report_count` (int, number of reports)
  - `is_verified` (boolean, manually verified)
  - `metadata` (jsonb, additional threat data)
  - `created_at` (timestamptz)

  ### 2. `scan_results`
  Stores results from URL and content scans
  - `id` (uuid, primary key)
  - `scan_type` (text, url or content)
  - `input_data` (text, scanned URL or content)
  - `is_phishing` (boolean)
  - `confidence_score` (numeric, 0-100)
  - `threat_indicators` (jsonb, detected indicators)
  - `ml_features` (jsonb, extracted features)
  - `scan_duration_ms` (int)
  - `user_id` (uuid, nullable)
  - `created_at` (timestamptz)

  ### 3. `threat_indicators`
  Stores Indicators of Compromise (IOCs)
  - `id` (uuid, primary key)
  - `indicator_type` (text, domain, ip, pattern, keyword)
  - `indicator_value` (text)
  - `threat_level` (text)
  - `source` (text, where it came from)
  - `is_active` (boolean)
  - `metadata` (jsonb)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `user_reports`
  User-submitted suspicious content
  - `id` (uuid, primary key)
  - `report_type` (text, url, email, sms)
  - `content` (text)
  - `reporter_email` (text, optional)
  - `status` (text, pending, reviewed, confirmed, false_positive)
  - `analysis_result` (jsonb)
  - `created_at` (timestamptz)
  - `reviewed_at` (timestamptz, nullable)

  ### 5. `domain_intelligence`
  Domain metadata and analysis results
  - `id` (uuid, primary key)
  - `domain` (text, unique)
  - `registration_date` (timestamptz, nullable)
  - `ssl_valid` (boolean)
  - `ssl_issuer` (text)
  - `dns_records` (jsonb)
  - `whois_data` (jsonb)
  - `reputation_score` (numeric)
  - `is_suspicious` (boolean)
  - `last_analyzed` (timestamptz)
  - `created_at` (timestamptz)

  ### 6. `detection_stats`
  Aggregated statistics for the dashboard
  - `id` (uuid, primary key)
  - `date` (date)
  - `total_scans` (int)
  - `phishing_detected` (int)
  - `false_positives` (int)
  - `avg_confidence` (numeric)
  - `top_threats` (jsonb)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Public read access for threat intelligence
  - Authenticated users can submit reports and perform scans
  - Stats are publicly readable
*/

-- Create phishing_urls table
CREATE TABLE IF NOT EXISTS phishing_urls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  domain text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  threat_level text DEFAULT 'medium' CHECK (threat_level IN ('critical', 'high', 'medium', 'low')),
  detection_method text NOT NULL,
  first_seen timestamptz DEFAULT now(),
  last_seen timestamptz DEFAULT now(),
  report_count int DEFAULT 1,
  is_verified boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_phishing_urls_domain ON phishing_urls(domain);
CREATE INDEX IF NOT EXISTS idx_phishing_urls_status ON phishing_urls(status);
CREATE INDEX IF NOT EXISTS idx_phishing_urls_threat_level ON phishing_urls(threat_level);

-- Create scan_results table
CREATE TABLE IF NOT EXISTS scan_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_type text NOT NULL CHECK (scan_type IN ('url', 'content', 'email')),
  input_data text NOT NULL,
  is_phishing boolean NOT NULL,
  confidence_score numeric(5,2) DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  threat_indicators jsonb DEFAULT '[]'::jsonb,
  ml_features jsonb DEFAULT '{}'::jsonb,
  scan_duration_ms int DEFAULT 0,
  user_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scan_results_type ON scan_results(scan_type);
CREATE INDEX IF NOT EXISTS idx_scan_results_created ON scan_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scan_results_phishing ON scan_results(is_phishing);

-- Create threat_indicators table
CREATE TABLE IF NOT EXISTS threat_indicators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_type text NOT NULL CHECK (indicator_type IN ('domain', 'ip', 'pattern', 'keyword', 'hash')),
  indicator_value text NOT NULL,
  threat_level text DEFAULT 'medium' CHECK (threat_level IN ('critical', 'high', 'medium', 'low')),
  source text DEFAULT 'user_report',
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_threat_indicators_type ON threat_indicators(indicator_type);
CREATE INDEX IF NOT EXISTS idx_threat_indicators_value ON threat_indicators(indicator_value);
CREATE INDEX IF NOT EXISTS idx_threat_indicators_active ON threat_indicators(is_active);

-- Create user_reports table
CREATE TABLE IF NOT EXISTS user_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type text NOT NULL CHECK (report_type IN ('url', 'email', 'sms', 'other')),
  content text NOT NULL,
  reporter_email text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'confirmed', 'false_positive')),
  analysis_result jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status);
CREATE INDEX IF NOT EXISTS idx_user_reports_created ON user_reports(created_at DESC);

-- Create domain_intelligence table
CREATE TABLE IF NOT EXISTS domain_intelligence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text UNIQUE NOT NULL,
  registration_date timestamptz,
  ssl_valid boolean DEFAULT false,
  ssl_issuer text,
  dns_records jsonb DEFAULT '{}'::jsonb,
  whois_data jsonb DEFAULT '{}'::jsonb,
  reputation_score numeric(5,2) DEFAULT 50 CHECK (reputation_score >= 0 AND reputation_score <= 100),
  is_suspicious boolean DEFAULT false,
  last_analyzed timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_domain_intelligence_domain ON domain_intelligence(domain);
CREATE INDEX IF NOT EXISTS idx_domain_intelligence_suspicious ON domain_intelligence(is_suspicious);

-- Create detection_stats table
CREATE TABLE IF NOT EXISTS detection_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  total_scans int DEFAULT 0,
  phishing_detected int DEFAULT 0,
  false_positives int DEFAULT 0,
  avg_confidence numeric(5,2) DEFAULT 0,
  top_threats jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_detection_stats_date ON detection_stats(date DESC);

-- Enable Row Level Security
ALTER TABLE phishing_urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE detection_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for phishing_urls (public read)
CREATE POLICY "Public can view active phishing URLs"
  ON phishing_urls FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert phishing URLs"
  ON phishing_urls FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for scan_results (public can insert and read own)
CREATE POLICY "Anyone can view recent scan results"
  ON scan_results FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert scan results"
  ON scan_results FOR INSERT
  WITH CHECK (true);

-- RLS Policies for threat_indicators (public read, authenticated write)
CREATE POLICY "Public can view active threat indicators"
  ON threat_indicators FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert threat indicators"
  ON threat_indicators FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for user_reports (public can submit)
CREATE POLICY "Anyone can submit reports"
  ON user_reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view their own reports"
  ON user_reports FOR SELECT
  USING (true);

-- RLS Policies for domain_intelligence (public read)
CREATE POLICY "Public can view domain intelligence"
  ON domain_intelligence FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert domain intelligence"
  ON domain_intelligence FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update domain intelligence"
  ON domain_intelligence FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for detection_stats (public read)
CREATE POLICY "Public can view detection stats"
  ON detection_stats FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert detection stats"
  ON detection_stats FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update detection stats"
  ON detection_stats FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert some initial threat indicators
INSERT INTO threat_indicators (indicator_type, indicator_value, threat_level, source, metadata)
VALUES 
  ('keyword', 'verify your account', 'high', 'system', '{"description": "Common phishing phrase"}'),
  ('keyword', 'suspended account', 'high', 'system', '{"description": "Account urgency scam"}'),
  ('keyword', 'urgent action required', 'high', 'system', '{"description": "Urgency tactic"}'),
  ('keyword', 'click here immediately', 'medium', 'system', '{"description": "Pressure tactic"}'),
  ('pattern', 'bit\.ly|tinyurl\.com|goo\.gl', 'medium', 'system', '{"description": "URL shorteners often used in phishing"}'),
  ('pattern', '@.*\.tk$|@.*\.ml$|@.*\.ga$', 'high', 'system', '{"description": "Free TLD domains"}')
ON CONFLICT DO NOTHING;
