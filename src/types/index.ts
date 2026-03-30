export interface AnalysisResult {
  isPhishing: boolean;
  confidenceScore: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  indicators: string[];
  features: Record<string, unknown>;
  recommendations: string[];
  scanDuration?: number;
  extractedUrls?: string[];
}

export interface ScanResult {
  id: string;
  scan_type: 'url' | 'content' | 'email';
  input_data: string;
  is_phishing: boolean;
  confidence_score: number;
  threat_indicators: string[];
  ml_features: Record<string, unknown>;
  scan_duration_ms: number;
  created_at: string;
}

export interface PhishingURL {
  id: string;
  url: string;
  domain: string;
  status: 'active' | 'inactive' | 'pending';
  threat_level: 'low' | 'medium' | 'high' | 'critical';
  detection_method: string;
  first_seen: string;
  last_seen: string;
  report_count: number;
  is_verified: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ThreatIndicator {
  id: string;
  indicator_type: 'domain' | 'ip' | 'pattern' | 'keyword' | 'hash';
  indicator_value: string;
  threat_level: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface UserReport {
  id: string;
  report_type: 'url' | 'email' | 'sms' | 'other';
  content: string;
  reporter_email?: string;
  status: 'pending' | 'reviewed' | 'confirmed' | 'false_positive';
  analysis_result: Record<string, unknown>;
  created_at: string;
  reviewed_at?: string;
}

export interface DetectionStats {
  id: string;
  date: string;
  total_scans: number;
  phishing_detected: number;
  false_positives: number;
  avg_confidence: number;
  top_threats: unknown[];
  created_at: string;
}
