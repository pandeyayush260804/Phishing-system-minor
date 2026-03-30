import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function analyzeURL(url: string) {
  const apiUrl = `${supabaseUrl}/functions/v1/analyze-url`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    throw new Error('Failed to analyze URL');
  }

  return response.json();
}

export async function analyzeContent(content: string, contentType: 'email' | 'sms' | 'other' = 'other') {
  const apiUrl = `${supabaseUrl}/functions/v1/analyze-content`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content, contentType }),
  });

  if (!response.ok) {
    throw new Error('Failed to analyze content');
  }

  return response.json();
}

export async function submitReport(reportType: string, content: string, reporterEmail?: string) {
  const { data, error } = await supabase
    .from('user_reports')
    .insert({
      report_type: reportType,
      content,
      reporter_email: reporterEmail,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getRecentScans(limit = 50) {
  const { data, error } = await supabase
    .from('scan_results')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getThreatIndicators() {
  const { data, error } = await supabase
    .from('threat_indicators')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getPhishingURLs(limit = 100) {
  const { data, error } = await supabase
    .from('phishing_urls')
    .select('*')
    .eq('status', 'active')
    .order('last_seen', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getDetectionStats() {
  const { data, error } = await supabase
    .from('detection_stats')
    .select('*')
    .order('date', { ascending: false })
    .limit(30);

  if (error) throw error;
  return data;
}
