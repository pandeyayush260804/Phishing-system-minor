import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface URLAnalysisRequest {
  url: string;
}

interface ThreatIndicator {
  indicator_type: string;
  indicator_value: string;
  threat_level: string;
  metadata: Record<string, unknown>;
}

interface AnalysisResult {
  isPhishing: boolean;
  confidenceScore: number;
  threatLevel: string;
  indicators: string[];
  features: Record<string, unknown>;
  recommendations: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { url }: URLAnalysisRequest = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const startTime = Date.now();

    const analysis = await analyzeURL(url, supabase);

    const scanDuration = Date.now() - startTime;

    await supabase.from('scan_results').insert({
      scan_type: 'url',
      input_data: url,
      is_phishing: analysis.isPhishing,
      confidence_score: analysis.confidenceScore,
      threat_indicators: analysis.indicators,
      ml_features: analysis.features,
      scan_duration_ms: scanDuration,
    });

    if (analysis.isPhishing && analysis.confidenceScore > 70) {
      const domain = extractDomain(url);
      await supabase.from('phishing_urls').insert({
        url,
        domain,
        threat_level: analysis.threatLevel,
        detection_method: 'ml_analysis',
        metadata: { features: analysis.features, indicators: analysis.indicators },
      });
    }

    return new Response(
      JSON.stringify({ ...analysis, scanDuration }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error analyzing URL:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function analyzeURL(url: string, supabase: any): Promise<AnalysisResult> {
  const indicators: string[] = [];
  const features: Record<string, unknown> = {};
  let score = 0;

  const domain = extractDomain(url);
  const domainLower = domain.toLowerCase();
  features.domain = domain;
  features.url_length = url.length;

  const urlLower = url.toLowerCase();
  const urlPath = new URL(url.startsWith('http') ? url : `http://${url}`).pathname;

  score += analyzeURLStructure(url, domain, urlLower, indicators, features);
  score += analyzeProtocolSecurity(url, indicators, features);
  score += analyzeDomainCharacteristics(domain, domainLower, indicators, features);
  score += analyzeBrandSpoofing(domainLower, indicators, features);
  score += analyzeHomoglyphs(domain, domainLower, indicators, features);
  score += analyzeURLObfuscation(url, domain, urlLower, indicators, features);
  score += analyzePathAnalysis(urlPath, urlLower, indicators, features);
  score += analyzeQueryParameters(url, indicators, features);
  score += analyzeSubdomainStructure(domain, indicators, features);

  const { data: threatIndicators } = await supabase
    .from('threat_indicators')
    .select('*')
    .eq('is_active', true);

  if (threatIndicators) {
    score += matchThreatIndicators(url, domain, threatIndicators as ThreatIndicator[], indicators);
  }

  const { data: knownPhishing } = await supabase
    .from('phishing_urls')
    .select('domain')
    .eq('domain', domain)
    .eq('status', 'active')
    .maybeSingle();

  if (knownPhishing) {
    score = 95;
    indicators.push('Domain found in known phishing database');
    features.known_phishing = true;
  }

  const confidenceScore = Math.min(score, 100);
  const isPhishing = confidenceScore >= 50;

  let threatLevel = 'low';
  if (confidenceScore >= 80) threatLevel = 'critical';
  else if (confidenceScore >= 65) threatLevel = 'high';
  else if (confidenceScore >= 50) threatLevel = 'medium';

  const recommendations: string[] = [];
  if (isPhishing) {
    recommendations.push('⚠️ Do not visit this URL or enter any personal information');
    recommendations.push('Report this URL to your IT security team');
    recommendations.push('Do not click any links or download attachments from this source');
  } else if (confidenceScore > 30) {
    recommendations.push('Exercise caution when visiting this URL');
    recommendations.push('Verify the legitimacy before entering sensitive information');
  } else {
    recommendations.push('URL appears safe, but always verify before sharing personal data');
  }

  return {
    isPhishing,
    confidenceScore,
    threatLevel,
    indicators,
    features,
    recommendations,
  };
}

function analyzeURLStructure(url: string, domain: string, urlLower: string, indicators: string[], features: Record<string, unknown>): number {
  let score = 0;

  if (url.length > 75) {
    score += 12;
    indicators.push('Unusually long URL (phishing often uses long URLs to obfuscate)');
  }

  if (url.length > 120) {
    score += 8;
    indicators.push('Extremely long URL (high obfuscation risk)');
  }

  const dotCount = (url.match(/\./g) || []).length;
  if (dotCount > 5) {
    score += 10;
    indicators.push(`Excessive dots in URL (${dotCount} detected)`);
    features.dot_count = dotCount;
  }

  const hyphenCount = (domain.match(/-/g) || []).length;
  if (hyphenCount > 3) {
    score += 10;
    indicators.push(`Excessive hyphens in domain (${hyphenCount} detected)`);
    features.hyphen_count = hyphenCount;
  }

  if (hyphenCount > 5) {
    score += 8;
    indicators.push('Suspicious number of hyphens (domain fragmentation)');
  }

  const slashCount = (url.match(/\//g) || []).length;
  if (slashCount > 4) {
    score += 5;
    indicators.push('Deep URL path structure (unusual nesting)');
  }

  return score;
}

function analyzeProtocolSecurity(url: string, indicators: string[], features: Record<string, unknown>): number {
  let score = 0;

  if (!url.startsWith('https://')) {
    score += 18;
    indicators.push('Not using HTTPS (insecure connection)');
    features.no_https = true;
  }

  if (url.startsWith('http://')) {
    score += 5;
    indicators.push('Using unencrypted HTTP protocol');
  }

  if (url.includes('ftp://') || url.includes('file://')) {
    score += 15;
    indicators.push('Using non-standard protocol (FTP or FILE)');
  }

  return score;
}

function analyzeDomainCharacteristics(domain: string, domainLower: string, indicators: string[], features: Record<string, unknown>): number {
  let score = 0;

  const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipPattern.test(domain)) {
    score += 28;
    indicators.push('IP address used instead of domain name');
    features.uses_ip = true;
  }

  const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.click', '.download', '.review', '.date'];
  const matchedTLD = suspiciousTLDs.find(tld => domainLower.endsWith(tld));
  if (matchedTLD) {
    score += 22;
    indicators.push(`Suspicious top-level domain: ${matchedTLD}`);
    features.suspicious_tld = matchedTLD;
  }

  const newTLDs = ['.app', '.dev', '.blog', '.tech', '.online'];
  const hasNewTLD = newTLDs.some(tld => domainLower.endsWith(tld));
  if (hasNewTLD && !features.uses_ip) {
    features.has_new_tld = true;
  }

  if (!domainLower.includes('.')) {
    score += 15;
    indicators.push('Invalid domain format (missing TLD)');
  }

  const domainParts = domain.split('.');
  if (domainParts.length > 4) {
    score += 8;
    indicators.push(`Excessive subdomains (${domainParts.length} parts)`);
  }

  return score;
}

function analyzeBrandSpoofing(domainLower: string, indicators: string[], features: Record<string, unknown>): number {
  let score = 0;

  const brandPatterns: Record<string, string[]> = {
    'paypal': ['paypa1', 'paypai', 'paypa1', 'pay-pal', 'paypal-'],
    'amazon': ['amaz0n', 'amazn', 'amazon-', 'amaz0n'],
    'microsoft': ['micr0soft', 'micro-soft', 'microsfot'],
    'google': ['g00gle', 'gogle', 'google-', 'goog1e'],
    'apple': ['app1e', 'aple', 'apple-'],
    'facebook': ['face-book', 'facebk', 'faceb00k'],
    'instagram': ['instagram-', 'insta-gram'],
    'netflix': ['netflix-', 'netfl1x'],
    'bank': ['bank-', 'banks-'],
    'security': ['security-'],
    'account': ['account-'],
    'verify': ['verify-'],
    'confirm': ['confirm-'],
  };

  for (const [brand, patterns] of Object.entries(brandPatterns)) {
    const exactMatch = domainLower.includes(`${brand}.com`);
    if (!exactMatch && domainLower.includes(brand)) {
      score += 32;
      indicators.push(`Brand name spoofing detected: ${brand}`);
      features.brand_spoofing = brand;
      break;
    }

    for (const pattern of patterns) {
      if (domainLower.includes(pattern)) {
        score += 28;
        indicators.push(`Potential brand impersonation: ${pattern} (mimics ${brand})`);
        features.brand_spoofing = brand;
        break;
      }
    }
  }

  return score;
}

function analyzeHomoglyphs(domain: string, domainLower: string, indicators: string[], features: Record<string, unknown>): number {
  let score = 0;

  const cyrillicPattern = /[а-яА-Я]/;
  if (cyrillicPattern.test(domain)) {
    score += 28;
    indicators.push('Homoglyph characters detected (Cyrillic lookalikes)');
    features.homoglyph_attack = true;
  }

  const greekPattern = /[α-ω]/;
  if (greekPattern.test(domain)) {
    score += 25;
    indicators.push('Homoglyph characters detected (Greek lookalikes)');
  }

  const similarChars: Record<string, string> = {
    '0': 'o',
    '1': 'l',
    '5': 's',
    '8': 'b',
  };

  for (const [number, letter] of Object.entries(similarChars)) {
    if (domainLower.includes(number) && domainLower.includes(letter)) {
      score += 12;
      indicators.push(`Visually similar characters detected: ${number} and ${letter}`);
      break;
    }
  }

  return score;
}

function analyzeURLObfuscation(url: string, domain: string, urlLower: string, indicators: string[], features: Record<string, unknown>): number {
  let score = 0;

  if (url.includes('@')) {
    score += 25;
    indicators.push('URL contains @ symbol (classic obfuscation technique)');
    features.has_at_symbol = true;
  }

  if (url.includes('%')) {
    score += 12;
    indicators.push('URL encoded characters detected (possible obfuscation)');
  }

  if (urlLower.includes('&#')) {
    score += 15;
    indicators.push('HTML entity encoding detected (obfuscation)');
  }

  const urlShorteners = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly', 'short.link', 'tiny.cc'];
  if (urlShorteners.some(shortener => domain.includes(shortener))) {
    score += 18;
    indicators.push('URL shortener detected (destination unclear)');
    features.uses_shortener = true;
  }

  if (url.includes('http://http') || url.includes('https://http')) {
    score += 20;
    indicators.push('Double protocol detected (obfuscation attempt)');
  }

  return score;
}

function analyzePathAnalysis(path: string, urlLower: string, indicators: string[], features: Record<string, unknown>): number {
  let score = 0;

  const pathLower = path.toLowerCase();

  const suspiciousKeywords = ['login', 'signin', 'verify', 'confirm', 'update', 'validate', 'authenticate', 'password', 'account', 'secure', 'payment'];
  let matchCount = 0;

  for (const keyword of suspiciousKeywords) {
    if (pathLower.includes(keyword)) {
      matchCount++;
    }
  }

  if (matchCount > 2) {
    score += 15;
    indicators.push('Multiple suspicious keywords in URL path');
  }

  if (pathLower.includes('/admin')) {
    score += 8;
    indicators.push('Admin-related path detected');
  }

  if (pathLower.includes('..')) {
    score += 20;
    indicators.push('Directory traversal pattern detected');
  }

  return score;
}

function analyzeQueryParameters(url: string, indicators: string[], features: Record<string, unknown>): number {
  let score = 0;

  const queryIndex = url.indexOf('?');
  if (queryIndex !== -1) {
    const queryString = url.substring(queryIndex);
    const paramCount = (queryString.match(/&/g) || []).length + 1;

    if (paramCount > 10) {
      score += 12;
      indicators.push(`Excessive query parameters (${paramCount} detected)`);
    }

    const suspiciousParams = ['redirect', 'url', 'domain', 'next', 'callback', 'return', 'goto'];
    for (const param of suspiciousParams) {
      if (queryString.toLowerCase().includes(param)) {
        score += 10;
        indicators.push(`Suspicious parameter detected: ${param}`);
        break;
      }
    }
  }

  return score;
}

function analyzeSubdomainStructure(domain: string, indicators: string[], features: Record<string, unknown>): number {
  let score = 0;

  const parts = domain.split('.');
  features.subdomain_count = Math.max(0, parts.length - 2);

  if (parts.length > 4) {
    score += 10;
    indicators.push(`Deep subdomain structure (${parts.length} levels)`);
  }

  const firstPart = parts[0].toLowerCase();
  const secondPart = parts.length > 1 ? parts[parts.length - 2].toLowerCase() : '';

  if (firstPart.length > 20) {
    score += 8;
    indicators.push('Unusually long subdomain');
  }

  const commonSubdomains = ['www', 'mail', 'ftp', 'smtp'];
  const hasCommonSubdomain = parts.length > 2 && commonSubdomains.includes(firstPart);
  if (!hasCommonSubdomain && parts.length > 2) {
    features.unusual_subdomain = true;
  }

  return score;
}

function matchThreatIndicators(url: string, domain: string, threatIndicators: ThreatIndicator[], indicators: string[]): number {
  let score = 0;

  for (const indicator of threatIndicators) {
    if (indicator.indicator_type === 'domain' && domain.includes(indicator.indicator_value)) {
      score += 40;
      indicators.push(`Known malicious domain pattern: ${indicator.indicator_value}`);
    } else if (indicator.indicator_type === 'ip' && url.includes(indicator.indicator_value)) {
      score += 35;
      indicators.push(`Known malicious IP detected: ${indicator.indicator_value}`);
    } else if (indicator.indicator_type === 'pattern') {
      try {
        const regex = new RegExp(indicator.indicator_value, 'i');
        if (regex.test(url)) {
          score += 20;
          indicators.push(`Matched threat pattern: ${indicator.metadata?.description || indicator.indicator_value}`);
        }
      } catch {
      }
    }
  }

  return score;
}

function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `http://${url}`);
    return urlObj.hostname;
  } catch {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/\?#]+)/i);
    return match ? match[1] : url;
  }
}
