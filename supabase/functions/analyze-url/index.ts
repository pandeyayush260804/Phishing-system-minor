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
  console.error("Error analyzing URL:", error);

  const message =
    error instanceof Error ? error.message : String(error);

  return new Response(
    JSON.stringify({
      error: "Internal server error",
      details: message,
    }),
    {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  );
}
});

async function analyzeURL(url: string, supabase: any): Promise<AnalysisResult> {
  const indicators: string[] = [];
  const features: Record<string, any> = {};
  let score = 0;

  const domain = extractDomain(url);
  const domainLower = domain.toLowerCase();
  features.domain = domain;
  features.url_length = url.length;

  const urlLower = url.toLowerCase();
  const urlPath = new URL(url.startsWith('http') ? url : `http://${url}`).pathname;

  // ================= BASIC ANALYSIS =================
  score += analyzeURLStructure(url, domain, urlLower, indicators, features);
  score += analyzeProtocolSecurity(url, indicators, features);
  score += analyzeDomainCharacteristics(domain, domainLower, indicators, features);
  score += analyzeBrandSpoofing(domainLower, indicators, features);
  score += analyzeHomoglyphs(domain, domainLower, indicators, features);
  score += analyzeURLObfuscation(url, domain, urlLower, indicators, features);
  score += analyzePathAnalysis(urlPath, urlLower, indicators, features);
  score += analyzeQueryParameters(url, indicators, features);
  score += analyzeSubdomainStructure(domain, indicators, features);

  // ================= SMART COMBO RULES =================

  // 🔥 Shortener ALWAYS suspicious
  if (features.uses_shortener) {
    score += 25;
    indicators.push("⚠️ URL shortener detected (destination hidden)");

    // If any other signal present → force phishing
    if (indicators.length >= 2) {
      features.force_phishing = true;
      indicators.push("🚨 Shortened URL with additional risk factors");
    }
  }

  // 🔥 Shortener + HTTP → critical
  if (features.uses_shortener && features.no_https) {
    score += 40;
    indicators.push("🚨 Critical: Shortened URL over insecure HTTP");
    features.force_phishing = true;
  }

  // 🔥 Brand spoof + login
  if (features.brand_spoofing && urlLower.includes("login")) {
    score += 30;
    indicators.push("🚨 Brand impersonation + login page");
    features.force_phishing = true;
  }

  // 🔥 IP + login
  if (features.uses_ip && urlLower.includes("login")) {
    score += 30;
    indicators.push("🚨 IP-based phishing login attempt");
    features.force_phishing = true;
  }

  // 🔥 Too many signals
  if (indicators.length >= 5) {
    score += 20;
    indicators.push("🚨 Multiple phishing indicators combined");
  }

  // ================= DATABASE INTELLIGENCE =================

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
    indicators.push('🚨 Known phishing domain');
    features.known_phishing = true;
    features.force_phishing = true;
  }

  // ================= FINAL SCORING =================

  const confidenceScore = Math.min(score, 100);

  let isPhishing = false;

  // 🔥 HARD OVERRIDE
  if (features.force_phishing) {
    isPhishing = true;
  }
  else if (confidenceScore >= 65) {
    isPhishing = true;
  }
  else if (confidenceScore >= 45 && indicators.length >= 3) {
    isPhishing = true;
  }

  let threatLevel = 'low';

  if (features.force_phishing) threatLevel = 'critical';
  else if (confidenceScore >= 85) threatLevel = 'critical';
  else if (confidenceScore >= 65) threatLevel = 'high';
  else if (confidenceScore >= 45) threatLevel = 'medium';

  // ================= RECOMMENDATIONS =================

  const recommendations: string[] = [];

  if (isPhishing) {
    recommendations.push('⚠️ High probability phishing URL');
    recommendations.push('Do NOT visit or enter sensitive data');
    recommendations.push('Report this URL immediately');
  } else if (confidenceScore > 30) {
    recommendations.push('⚠️ Suspicious URL - proceed with caution');
    recommendations.push('Verify legitimacy before interaction');
  } else {
    recommendations.push('✅ Appears safe, but always verify');
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

function analyzeURLStructure(
  url: string,
  domain: string,
  urlLower: string,
  indicators: string[],
  features: Record<string, any>
): number {
  let score = 0;

  // ================= LENGTH ANALYSIS =================

  features.url_length = url.length;

  if (url.length > 75) {
    score += 15;
    indicators.push('⚠️ Long URL (possible obfuscation)');
  }

  if (url.length > 120) {
    score += 12; // slightly increased
    indicators.push('🚨 Extremely long URL (high risk)');
  }

  if (url.length > 200) {
    score += 10;
    indicators.push('🚨 Highly suspicious URL length (extreme obfuscation)');
    features.extreme_length = true;
  }

  // ================= DOT ANALYSIS =================

  const dotCount = (url.match(/\./g) || []).length;
  features.dot_count = dotCount;

  if (dotCount > 5) {
    score += 12;
    indicators.push(`⚠️ Too many dots (${dotCount})`);
  }

  if (dotCount > 8) {
    score += 10; // increased
    indicators.push('🚨 Excessive domain segmentation');
    features.high_dot_density = true;
  }

  // ================= HYPHEN ANALYSIS =================

  const hyphenCount = (domain.match(/-/g) || []).length;
  features.hyphen_count = hyphenCount;

  if (hyphenCount > 2) {
    score += 10;
    indicators.push(`⚠️ Multiple hyphens (${hyphenCount})`);
  }

  if (hyphenCount > 4) {
    score += 12;
    indicators.push('🚨 Domain fragmentation (common phishing trick)');
    features.fragmented_domain = true;
  }

  // ================= PATH DEPTH =================

  const slashCount = (url.match(/\//g) || []).length;
  features.path_depth = slashCount;

  if (slashCount > 4) {
    score += 6;
    indicators.push('⚠️ Deep URL path (nested structure)');
  }

  if (slashCount > 7) {
    score += 10; // increased
    indicators.push('🚨 Suspicious deep nesting');
    features.deep_nesting = true;
  }

  // ================= SPECIAL CHARACTERS =================

  const specialChars = (url.match(/[@%=&?]/g) || []).length;
  features.special_characters = specialChars;

  if (specialChars > 5) {
    score += 8;
    indicators.push('⚠️ Many special characters (possible obfuscation)');
  }

  if (specialChars > 10) {
    score += 6;
    indicators.push('🚨 Heavy obfuscation using special characters');
    features.heavy_obfuscation = true;
  }

  // ================= NUMERIC HEAVY DOMAIN =================

  const numericCount = (domain.match(/[0-9]/g) || []).length;
  features.numeric_chars = numericCount;

  if (numericCount > 3) {
    score += 10;
    indicators.push('⚠️ Numeric-heavy domain (common in phishing)');
  }

  if (numericCount > 6) {
    score += 6;
    indicators.push('🚨 Highly suspicious numeric domain pattern');
    features.numeric_abuse = true;
  }

  // ================= RANDOM STRING DETECTION =================

  const randomPattern = /[a-z0-9]{12,}/;
  if (randomPattern.test(domain)) {
    score += 12;
    indicators.push('🚨 Random-looking domain string detected');
    features.random_domain = true;
  }

  // ================= EXTRA: MIXED PATTERN RISK =================

  if (
    (features.random_domain && features.numeric_chars > 2) ||
    (features.fragmented_domain && features.high_dot_density)
  ) {
    score += 10;
    indicators.push('🚨 Combined suspicious structural patterns');
    features.structure_anomaly = true;
  }

  return score;
}

function analyzeProtocolSecurity(
  url: string,
  indicators: string[],
  features: Record<string, any>
): number {
  let score = 0;

  const urlLower = url.toLowerCase();

  // ================= HTTPS CHECK =================

  if (!urlLower.startsWith('https://')) {
    score += 18;
    indicators.push('⚠️ Not using HTTPS (insecure connection)');
    features.no_https = true;
  }

  // ================= HTTP (EXPLICIT) =================

  if (urlLower.startsWith('http://')) {
    score += 8; // slightly increased from 5
    indicators.push('⚠️ Using unencrypted HTTP protocol');
    features.uses_http = true;
  }

  // ================= NON-STANDARD PROTOCOLS =================

  if (urlLower.startsWith('ftp://') || urlLower.startsWith('file://')) {
    score += 18; // increased
    indicators.push('🚨 Non-standard protocol (FTP/FILE)');
    features.suspicious_protocol = true;
  }

  // ================= EMBEDDED PROTOCOL TRICK =================
  // Example: http://example.com/https://fake.com

  if (urlLower.includes('http://') && !urlLower.startsWith('http://')) {
    score += 10;
    indicators.push('⚠️ Embedded HTTP inside URL path (possible obfuscation)');
    features.protocol_obfuscation = true;
  }

  if (urlLower.includes('https://') && !urlLower.startsWith('https://')) {
    score += 8;
    indicators.push('⚠️ Embedded HTTPS inside URL path');
    features.protocol_obfuscation = true;
  }

  // ================= MISSING PROTOCOL =================
  // Example: "google.com/login"

  if (!urlLower.startsWith('http://') && !urlLower.startsWith('https://')) {
    score += 6;
    indicators.push('⚠️ Missing protocol (URL may be malformed or deceptive)');
    features.missing_protocol = true;
  }

  return score;
}

function analyzeDomainCharacteristics(
  domain: string,
  domainLower: string,
  indicators: string[],
  features: Record<string, any>
): number {
  let score = 0;

  // ================= IP ADDRESS DETECTION =================

  const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;

  if (ipPattern.test(domain)) {
    score += 30; // slightly increased
    indicators.push('🚨 IP address used instead of domain name');
    features.uses_ip = true;
  }

  // Edge case: IP inside URL like 192.168...
  if (domain.match(/\d{1,3}(\.\d{1,3}){2,}/)) {
    score += 10;
    indicators.push('⚠️ Numeric IP-like pattern in domain');
  }

  // ================= SUSPICIOUS TLD =================

  const suspiciousTLDs = [
    '.tk', '.ml', '.ga', '.cf', '.gq',
    '.xyz', '.top', '.click', '.download',
    '.review', '.date'
  ];

  const matchedTLD = suspiciousTLDs.find(tld => domainLower.endsWith(tld));

  if (matchedTLD) {
    score += 25; // increased
    indicators.push(`🚨 Suspicious top-level domain: ${matchedTLD}`);
    features.suspicious_tld = matchedTLD;
  }

  // ================= NEW / GENERIC TLD =================

  const newTLDs = ['.app', '.dev', '.blog', '.tech', '.online'];

  const hasNewTLD = newTLDs.some(tld => domainLower.endsWith(tld));

  if (hasNewTLD && !features.uses_ip) {
    features.has_new_tld = true;
  }

  // ================= INVALID DOMAIN =================

  if (!domainLower.includes('.')) {
    score += 15;
    indicators.push('🚨 Invalid domain format (missing TLD)');
    features.invalid_domain = true;
  }

  // ================= SUBDOMAIN ANALYSIS =================

  const domainParts = domain.split('.');
  features.subdomain_count = domainParts.length;

  if (domainParts.length > 4) {
    score += 10;
    indicators.push(`⚠️ Excessive subdomains (${domainParts.length} parts)`);
  }

  if (domainParts.length > 6) {
    score += 10;
    indicators.push('🚨 Highly suspicious subdomain depth');
    features.deep_subdomain = true;
  }

  // ================= DOMAIN LENGTH =================

  if (domain.length > 30) {
    score += 8;
    indicators.push('⚠️ Long domain name (possible spoofing)');
  }

  if (domain.length > 50) {
    score += 8;
    indicators.push('🚨 Extremely long domain (high spoofing risk)');
    features.long_domain = true;
  }

  // ================= MIXED PATTERN DETECTION =================

  if (
    features.suspicious_tld &&
    features.subdomain_count > 4
  ) {
    score += 10;
    indicators.push('🚨 Suspicious TLD + deep subdomain combination');
    features.domain_anomaly = true;
  }

  return score;
}

function analyzeBrandSpoofing(
  domainLower: string,
  indicators: string[],
  features: Record<string, any>
): number {
  let score = 0;

  const brandPatterns: Record<string, string[]> = {
    'paypal': ['paypa1', 'paypai', 'pay-pal', 'paypal-'],
    'amazon': ['amaz0n', 'amazn', 'amazon-'],
    'microsoft': ['micr0soft', 'micro-soft', 'microsfot'],
    'google': ['g00gle', 'gogle', 'google-', 'goog1e'],
    'apple': ['app1e', 'aple', 'apple-'],
    'facebook': ['face-book', 'facebk', 'faceb00k'],
    'instagram': ['instagram-', 'insta-gram'],
    'netflix': ['netfl1x', 'netflix-'],
    'bank': ['bank-', 'banks-'],
    'security': ['security-'],
    'account': ['account-'],
    'verify': ['verify-'],
    'confirm': ['confirm-'],
  };

  // Extract base domain (remove subdomains)
  const domainParts = domainLower.split('.');
  const baseDomain = domainParts.slice(-2).join('.'); // example: google.com

  for (const [brand, patterns] of Object.entries(brandPatterns)) {

    // ✅ Avoid false positives (real domain)
    const isRealDomain = baseDomain === `${brand}.com`;

    // ================= DIRECT BRAND MISUSE =================
    if (!isRealDomain && domainLower.includes(brand)) {
      score += 30;
      indicators.push(`🚨 Brand name used in suspicious domain: ${brand}`);
      features.brand_spoofing = brand;
      features.brand_match_type = 'direct';
    }

    // ================= PATTERN MATCHING =================
    for (const pattern of patterns) {
      if (domainLower.includes(pattern)) {
        score += 28;
        indicators.push(`🚨 Brand impersonation pattern: ${pattern} (mimics ${brand})`);
        features.brand_spoofing = brand;
        features.brand_match_type = 'pattern';
      }
    }

    // ================= PREFIX / SUFFIX TRICK =================
    if (
      domainLower.startsWith(`${brand}-`) ||
      domainLower.includes(`-${brand}`) ||
      domainLower.includes(`${brand}-login`) ||
      domainLower.includes(`${brand}-secure`)
    ) {
      score += 20;
      indicators.push(`⚠️ Suspicious brand-based domain structure: ${brand}`);
      features.brand_structure_abuse = true;
    }
  }

  // ================= GENERIC PHISHING KEYWORDS =================

  const phishingKeywords = ['login', 'secure', 'update', 'verify', 'account'];

  const keywordHits = phishingKeywords.filter(k => domainLower.includes(k));

  if (keywordHits.length >= 2) {
    score += 15;
    indicators.push(`⚠️ Multiple phishing keywords in domain (${keywordHits.join(', ')})`);
    features.keyword_abuse = true;
  }

  return score;
}

function analyzeHomoglyphs(
  domain: string,
  domainLower: string,
  indicators: string[],
  features: Record<string, any>
): number {
  let score = 0;

  // ================= CYRILLIC DETECTION =================

  const cyrillicPattern = /[а-яА-Я]/;
  if (cyrillicPattern.test(domain)) {
    score += 30; // increased
    indicators.push('🚨 Homoglyph attack: Cyrillic characters detected');
    features.homoglyph_attack = true;
    features.cyrillic = true;
  }

  // ================= GREEK DETECTION =================

  const greekPattern = /[α-ω]/;
  if (greekPattern.test(domain)) {
    score += 28;
    indicators.push('🚨 Homoglyph attack: Greek characters detected');
    features.homoglyph_attack = true;
    features.greek = true;
  }

  // ================= PUNYCODE (IDN) =================
  // Example: xn--gogle-9ta.com

  if (domainLower.startsWith('xn--') || domainLower.includes('.xn--')) {
    score += 35;
    indicators.push('🚨 Internationalized domain (punycode) detected');
    features.idn_domain = true;
    features.homoglyph_attack = true;
  }

  // ================= MIXED SCRIPT DETECTION =================

  const hasLatin = /[a-z]/.test(domainLower);
  const hasNonLatin = /[^a-z0-9.-]/i.test(domain);

  if (hasLatin && hasNonLatin) {
    score += 20;
    indicators.push('🚨 Mixed character scripts detected (high spoof risk)');
    features.mixed_script = true;
  }

  // ================= LOOKALIKE CHARACTER DETECTION =================

  const similarChars: Record<string, string> = {
    '0': 'o',
    '1': 'l',
    '3': 'e',
    '5': 's',
    '7': 't',
    '8': 'b',
  };

  let matchCount = 0;

  for (const [num, char] of Object.entries(similarChars)) {
    if (domainLower.includes(num) && domainLower.includes(char)) {
      matchCount++;
    }
  }

  if (matchCount >= 1) {
    score += 12;
    indicators.push('⚠️ Visually similar character substitution detected');
    features.lookalike_chars = true;
  }

  if (matchCount >= 2) {
    score += 10;
    indicators.push('🚨 Multiple character substitutions (strong spoof signal)');
    features.heavy_spoofing = true;
  }

  return score;
}

function analyzeURLObfuscation(
  url: string,
  domain: string,
  urlLower: string,
  indicators: string[],
  features: Record<string, any>
): number {
  let score = 0;

  // ================= @ SYMBOL =================

  if (url.includes('@')) {
    score += 25;
    indicators.push('🚨 URL contains @ symbol (classic obfuscation)');
    features.has_at_symbol = true;
  }

  // ================= ENCODING =================

  if (url.includes('%')) {
    score += 12;
    indicators.push('⚠️ URL encoded characters detected');
    features.url_encoded = true;
  }

  if (urlLower.includes('%25') || urlLower.includes('%2f')) {
    score += 10;
    indicators.push('🚨 Heavy encoding detected (possible hidden payload)');
    features.heavy_encoding = true;
  }

  if (urlLower.includes('&#')) {
    score += 15;
    indicators.push('🚨 HTML entity encoding detected');
    features.html_encoding = true;
  }

  // ================= SHORTENER DETECTION =================

  const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly'];

  if (shorteners.some(s => domain.includes(s))) {
    score += 30;
    features.uses_shortener = true;
    indicators.push('🚨 URL shortener detected (high-risk)');
  }

  // ================= DOUBLE / NESTED PROTOCOL =================

  if (url.includes('http://http') || url.includes('https://http')) {
    score += 20;
    indicators.push('🚨 Double protocol detected (obfuscation attempt)');
    features.double_protocol = true;
  }

  // Example: http://example.com/https://fake.com
  if (
    (urlLower.includes('http://') && !urlLower.startsWith('http://')) ||
    (urlLower.includes('https://') && !urlLower.startsWith('https://'))
  ) {
    score += 15;
    indicators.push('🚨 Embedded URL detected inside path');
    features.embedded_url = true;
  }

  // ================= REDIRECTION TRICKS =================

  if (urlLower.includes('redirect') || urlLower.includes('redir=')) {
    score += 12;
    indicators.push('⚠️ Redirect parameter detected (possible phishing redirect)');
    features.redirect = true;
  }

  // ================= HEX / OBFUSCATED DOMAIN =================

  const hexPattern = /0x[a-f0-9]+/i;
  if (hexPattern.test(urlLower)) {
    score += 15;
    indicators.push('🚨 Hexadecimal encoding detected (obfuscation)');
    features.hex_obfuscation = true;
  }

  // ================= MULTIPLE SUSPICIOUS SIGNALS =================

  const suspiciousCount =
    (features.has_at_symbol ? 1 : 0) +
    (features.url_encoded ? 1 : 0) +
    (features.embedded_url ? 1 : 0) +
    (features.double_protocol ? 1 : 0);

  if (suspiciousCount >= 2) {
    score += 10;
    indicators.push('🚨 Multiple obfuscation techniques detected');
    features.obfuscation_combo = true;
  }

  return score;
}

function analyzePathAnalysis(
  path: string,
  urlLower: string,
  indicators: string[],
  features: Record<string, any>
): number {
  let score = 0;

  const pathLower = path.toLowerCase();

  // ================= KEYWORD ANALYSIS =================

  const suspiciousKeywords = [
    'login', 'signin', 'verify', 'confirm',
    'update', 'validate', 'authenticate',
    'password', 'account', 'secure', 'payment'
  ];

  let matchCount = 0;

  for (const keyword of suspiciousKeywords) {
    if (pathLower.includes(keyword)) {
      matchCount++;
    }
  }

  features.path_keyword_count = matchCount;

  if (matchCount > 1) {
    score += 10;
    indicators.push('⚠️ Suspicious keywords in URL path');
  }

  if (matchCount > 2) {
    score += 15;
    indicators.push('🚨 Multiple phishing-related keywords in path');
    features.keyword_heavy_path = true;
  }

  if (matchCount > 4) {
    score += 10;
    indicators.push('🚨 Excessive credential-related keywords');
  }

  // ================= ADMIN / SENSITIVE PATH =================

  if (pathLower.includes('/admin')) {
    score += 10;
    indicators.push('⚠️ Admin-related path detected');
    features.admin_path = true;
  }

  if (pathLower.includes('/login') || pathLower.includes('/signin')) {
    features.login_path = true;
  }

  // ================= DIRECTORY TRAVERSAL =================

  if (pathLower.includes('..')) {
    score += 20;
    indicators.push('🚨 Directory traversal pattern detected');
    features.directory_traversal = true;
  }

  // ================= DEEP PATH STRUCTURE =================

  const pathDepth = path.split('/').length;
  features.path_depth = pathDepth;

  if (pathDepth > 5) {
    score += 8;
    indicators.push('⚠️ Deep URL path structure');
  }

  if (pathDepth > 8) {
    score += 10;
    indicators.push('🚨 Extremely deep path (possible obfuscation)');
    features.deep_path = true;
  }

  // ================= FILE EXTENSION TRICKS =================

  if (pathLower.includes('.php') || pathLower.includes('.html')) {
    score += 6;
    indicators.push('⚠️ Dynamic page in path (possible phishing page)');
  }

  // ================= COMBO DETECTION =================

  if (features.login_path && features.keyword_heavy_path) {
    score += 10;
    indicators.push('🚨 Login page with multiple phishing indicators');
    features.path_attack = true;
  }

  return score;
}

function analyzeQueryParameters(
  url: string,
  indicators: string[],
  features: Record<string, any>
): number {
  let score = 0;

  const queryIndex = url.indexOf('?');

  if (queryIndex !== -1) {
    const queryString = url.substring(queryIndex + 1);
    const params = queryString.split('&');
    const paramCount = params.length;

    features.query_param_count = paramCount;

    // ================= PARAM COUNT =================

    if (paramCount > 5) {
      score += 8;
      indicators.push(`⚠️ Multiple query parameters (${paramCount})`);
    }

    if (paramCount > 10) {
      score += 12;
      indicators.push(`🚨 Excessive query parameters (${paramCount})`);
      features.excessive_params = true;
    }

    // ================= SUSPICIOUS PARAM NAMES =================

    const suspiciousParams = [
      'redirect', 'url', 'domain', 'next',
      'callback', 'return', 'goto'
    ];

    let suspiciousHits = 0;

    for (const param of suspiciousParams) {
      if (queryString.toLowerCase().includes(param)) {
        suspiciousHits++;
      }
    }

    if (suspiciousHits >= 1) {
      score += 10;
      indicators.push('⚠️ Suspicious redirect-related parameter detected');
      features.redirect_param = true;
    }

    if (suspiciousHits >= 2) {
      score += 10;
      indicators.push('🚨 Multiple redirect parameters (high risk)');
      features.redirect_chain = true;
    }

    // ================= EXTERNAL URL IN PARAM =================

    const hasExternalURL = params.some(p =>
      p.toLowerCase().includes('http://') ||
      p.toLowerCase().includes('https://')
    );

    if (hasExternalURL) {
      score += 15;
      indicators.push('🚨 External URL found inside query parameter');
      features.external_redirect = true;
    }

    // ================= CREDENTIAL HARVESTING =================

    const credentialParams = ['password', 'pass', 'token', 'auth', 'key'];

    const hasCredentialParam = credentialParams.some(p =>
      queryString.toLowerCase().includes(p)
    );

    if (hasCredentialParam) {
      score += 15;
      indicators.push('🚨 Sensitive credential parameter detected');
      features.credential_leak = true;
    }

    // ================= ENCODED PARAMETERS =================

    if (queryString.includes('%')) {
      score += 8;
      indicators.push('⚠️ Encoded query parameters detected');
      features.encoded_params = true;
    }

    // ================= COMBO DETECTION =================

    if (features.external_redirect && features.redirect_param) {
      score += 10;
      indicators.push('🚨 Redirect + external URL combo (phishing pattern)');
      features.query_attack = true;
    }
  }

  return score;
}

function analyzeSubdomainStructure(
  domain: string,
  indicators: string[],
  features: Record<string, any>
): number {
  let score = 0;

  const parts = domain.split('.');
  const subdomainCount = Math.max(0, parts.length - 2);

  features.subdomain_count = subdomainCount;

  // ================= DEPTH ANALYSIS =================

  if (parts.length > 4) {
    score += 10;
    indicators.push(`⚠️ Deep subdomain structure (${parts.length} levels)`);
  }

  if (parts.length > 6) {
    score += 10;
    indicators.push('🚨 Extremely deep subdomain nesting');
    features.deep_subdomain = true;
  }

  // ================= FIRST SUBDOMAIN =================

  const firstPart = parts[0]?.toLowerCase() || '';
  const baseDomain = parts.slice(-2).join('.');

  if (firstPart.length > 20) {
    score += 8;
    indicators.push('⚠️ Unusually long subdomain');
    features.long_subdomain = true;
  }

  // ================= FAKE TRUSTED PREFIX =================

  const trustedKeywords = ['secure', 'login', 'account', 'verify', 'bank'];

  const hasFakePrefix = trustedKeywords.some(keyword =>
    firstPart.includes(keyword)
  );

  if (hasFakePrefix && subdomainCount > 0) {
    score += 15;
    indicators.push('🚨 Fake trusted subdomain prefix detected');
    features.fake_trusted_subdomain = true;
  }

  // ================= UNUSUAL SUBDOMAIN =================

  const commonSubdomains = ['www', 'mail', 'ftp', 'smtp'];

  const hasCommonSubdomain =
    parts.length > 2 && commonSubdomains.includes(firstPart);

  if (!hasCommonSubdomain && parts.length > 2) {
    features.unusual_subdomain = true;
  }

  // ================= KEYWORD HEAVY SUBDOMAIN =================

  const suspiciousKeywords = ['login', 'secure', 'verify', 'update'];

  const keywordHits = suspiciousKeywords.filter(k =>
    domain.toLowerCase().includes(k)
  );

  if (keywordHits.length >= 2) {
    score += 10;
    indicators.push('⚠️ Suspicious keyword-heavy subdomain');
    features.keyword_subdomain = true;
  }

  // ================= COMBO DETECTION =================

  if (features.deep_subdomain && features.fake_trusted_subdomain) {
    score += 10;
    indicators.push('🚨 Deep + trusted prefix combo (strong phishing signal)');
    features.subdomain_attack = true;
  }

  return score;
}

function matchThreatIndicators(
  url: string,
  domain: string,
  threatIndicators: ThreatIndicator[],
  indicators: string[]
): number {
  let score = 0;

  const matchedTypes = new Set<string>();

  for (const indicator of threatIndicators) {

    // ================= DOMAIN MATCH =================
    if (
      indicator.indicator_type === 'domain' &&
      domain.toLowerCase().includes(indicator.indicator_value.toLowerCase())
    ) {
      if (!matchedTypes.has('domain')) {
        score += 40;
        indicators.push(`🚨 Known malicious domain pattern: ${indicator.indicator_value}`);
        matchedTypes.add('domain');
      }
    }

    // ================= IP MATCH =================
    else if (
      indicator.indicator_type === 'ip' &&
      url.includes(indicator.indicator_value)
    ) {
      if (!matchedTypes.has('ip')) {
        score += 35;
        indicators.push(`🚨 Known malicious IP detected: ${indicator.indicator_value}`);
        matchedTypes.add('ip');
      }
    }

    // ================= PATTERN MATCH =================
    else if (indicator.indicator_type === 'pattern') {
      try {
        const regex = new RegExp(indicator.indicator_value, 'i');

        if (regex.test(url)) {
          if (!matchedTypes.has('pattern')) {
            score += 20;
            indicators.push(
              `⚠️ Matched threat pattern: ${
                indicator.metadata?.description || indicator.indicator_value
              }`
            );
            matchedTypes.add('pattern');
          }
        }
      } catch {
        // ignore invalid regex
      }
    }

    // ================= KEYWORD MATCH (NEW) =================
    else if (indicator.indicator_type === 'keyword') {
      if (url.toLowerCase().includes(indicator.indicator_value.toLowerCase())) {
        if (!matchedTypes.has('keyword')) {
          score += 12;
          indicators.push(`⚠️ Suspicious keyword detected: ${indicator.indicator_value}`);
          matchedTypes.add('keyword');
        }
      }
    }
  }

  // ================= COMBO BONUS =================

  if (matchedTypes.size >= 2) {
    score += 15;
    indicators.push('🚨 Multiple threat intelligence matches');
  }

  return score;
}

function extractDomain(url: string): string {
  try {
    // Ensure protocol exists
    const normalizedUrl = url.startsWith('http')
      ? url
      : `http://${url}`;

    const urlObj = new URL(normalizedUrl);

    let hostname = urlObj.hostname.toLowerCase();

    // Remove leading www
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }

    return hostname;

  } catch {
    // Fallback extraction (regex-based)

    const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/\?#]+)/i);

    let domain = match ? match[1].toLowerCase() : url.toLowerCase();

    // Clean trailing dots or spaces
    domain = domain.replace(/\.+$/, '').trim();

    return domain;
  }
}
