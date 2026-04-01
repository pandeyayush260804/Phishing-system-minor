import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ContentAnalysisRequest {
  content: string;
  contentType?: 'email' | 'sms' | 'other';
  metadata?: Record<string, unknown>;
}

interface AnalysisResult {
  isPhishing: boolean;
  confidenceScore: number;
  threatLevel: string;
  indicators: string[];
  features: Record<string, unknown>;
  recommendations: string[];
  extractedUrls: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { content, contentType = 'other', metadata = {} }: ContentAnalysisRequest = await req.json();

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const startTime = Date.now();

    const analysis = await analyzeContent(content, contentType, supabase);

    const scanDuration = Date.now() - startTime;

    await supabase.from('scan_results').insert({
      scan_type: contentType === 'email' ? 'email' : 'content',
      input_data: content.substring(0, 500),
      is_phishing: analysis.isPhishing,
      confidence_score: analysis.confidenceScore,
      threat_indicators: analysis.indicators,
      ml_features: { ...analysis.features, ...metadata },
      scan_duration_ms: scanDuration,
    });

    return new Response(
      JSON.stringify({ ...analysis, scanDuration }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error analyzing content:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function analyzeContent(content: string, contentType: string, supabase: any): Promise<AnalysisResult> {
  const indicators: string[] = [];
  const features: Record<string, unknown> = {};
  let score = 0;

  const contentLower = content.toLowerCase();
  features.content_length = content.length;
  features.content_type = contentType;

  score += analyzeUrgencyTactics(contentLower, indicators, features);
  score += analyzeFinancialPressure(contentLower, indicators, features);
  score += analyzePersonalization(contentLower, indicators, features);
  score += analyzeSuspiciousPhrasing(contentLower, indicators, features);
  score += analyzeURLBehavior(content, contentLower, indicators, features);
  score += analyzeEmailMetadata(content, contentLower, indicators, features);
  score += analyzeLanguagePatterns(content, contentLower, indicators, features);
  score += analyzeTrustSignals(contentLower, indicators, features);
  score += analyzeRequestedActions(contentLower, indicators, features);
  score += analyzeAnatomyPatterns(contentLower, indicators, features);
  score += analyzeSpoofingPatterns(contentLower, indicators, features);
  score += analyzeCredentialHarvesting(contentLower, indicators, features);
  score += analyzeReputationalHarms(contentLower, indicators, features);
  score += analyzeCloneAttacks(contentLower, content, indicators, features);
  score += analyzeSmishingPatterns(contentLower, indicators, features);
  score += analyzeVishing(contentLower, indicators, features);
  score += analyzeBusinessEmailCompromise(contentLower, indicators, features);
  score += analyzeDomainsAndIP(content, contentLower, indicators, features);
  score += analyzeTimeBasedThreats(contentLower, indicators, features);
  score += analyzeSocialEngineeringTactics(contentLower, indicators, features);
  score += analyzeImageAndAttachmentRisks(contentLower, indicators, features);
  score += analyzeRansomwareIndicators(contentLower, indicators, features);
  score += analyzeSupplyChainThreats(contentLower, indicators, features);

  const { data: threatIndicators } = await supabase
    .from('threat_indicators')
    .select('*')
    .eq('is_active', true)
    .in('indicator_type', ['keyword', 'pattern']);

  if (threatIndicators) {
    score += matchContentThreatIndicators(contentLower, content, threatIndicators, indicators);
  }

  const urls = content.match(/https?:\/\/[^\s<>"]+|www\.[^\s<>"]+/gi) || [];
  features.extracted_urls = urls;

  const confidenceScore = Math.min(score, 100);
  const isPhishing = confidenceScore >= 50;

  let threatLevel = 'low';
  if (confidenceScore >= 80) threatLevel = 'critical';
  else if (confidenceScore >= 65) threatLevel = 'high';
  else if (confidenceScore >= 50) threatLevel = 'medium';

  const recommendations: string[] = [];
  if (isPhishing) {
    recommendations.push('⚠️ This content shows strong signs of phishing');
    recommendations.push('Do not click any links or download attachments');
    recommendations.push('Do not provide any personal or financial information');
    recommendations.push('Report this message to your IT security team');
    recommendations.push('Delete this message immediately');
  } else if (confidenceScore > 30) {
    recommendations.push('Exercise caution with this content');
    recommendations.push('Verify the sender through official channels before taking action');
    recommendations.push('Be wary of any urgent requests');
  } else {
    recommendations.push('Content appears legitimate, but always verify before sharing sensitive data');
  }

  return {
    isPhishing,
    confidenceScore,
    threatLevel,
    indicators,
    features,
    recommendations,
    extractedUrls: urls,
  };
}

function analyzeUrgencyTactics(contentLower: string, indicators: string[], features: Record<string, unknown>): number {
  let score = 0;

  const urgencyPhrases = [
    'urgent action required',
    'immediate action',
    'act now',
    'limited time',
    'expires today',
    'expires in',
    'suspended account',
    'verify immediately',
    'confirm your identity',
    'unusual activity',
    'security alert',
    'account will be closed',
    'click here now',
    'validate your account',
    'confirm now',
    'must act',
    'immediately',
    'right away',
    'asap',
    'without delay',
    'hurry',
  ];

  let urgencyCount = 0;
  for (const phrase of urgencyPhrases) {
    if (contentLower.includes(phrase)) {
      urgencyCount++;
      indicators.push(`Urgency tactic: "${phrase}"`);
    }
  }

  if (urgencyCount > 0) {
    score += Math.min(urgencyCount * 13, 45);
    features.urgency_phrases = urgencyCount;
  }

  if (urgencyCount > 4) {
    score += 15;
    indicators.push('Multiple urgency tactics detected (pressure campaign)');
  }

  return score;
}

function analyzeFinancialPressure(contentLower: string, indicators: string[], features: Record<string, unknown>): number {
  let score = 0;

  const financialKeywords = [
    'bank account',
    'credit card',
    'debit card',
    'social security',
    'ssn',
    'password',
    'pin number',
    'cvv',
    'account number',
    'routing number',
    'swift code',
    'iban',
    'tax refund',
    'inheritance',
    'lottery',
    'prize',
    'payment',
    'transfer money',
    'wire transfer',
    'bitcoins',
    'payment method',
    'billing address',
  ];

  let financialCount = 0;
  for (const keyword of financialKeywords) {
    if (contentLower.includes(keyword)) {
      financialCount++;
    }
  }

  if (financialCount > 0) {
    score += Math.min(financialCount * 8, 35);
    features.financial_keywords = financialCount;
    if (financialCount > 3) {
      indicators.push(`Multiple financial keywords detected (${financialCount})`);
    }
  }

  return score;
}

function analyzePersonalization(contentLower: string, indicators: string[], features: Record<string, unknown>): number {
  let score = 0;

  const genericGreetings = [
    'dear customer',
    'dear user',
    'dear member',
    'dear account holder',
    'dear valued customer',
    'hello user',
    'to whom it may concern',
    'dear sir',
    'dear madam',
    'valued customer',
  ];

  for (const greeting of genericGreetings) {
    if (contentLower.includes(greeting)) {
      score += 12;
      indicators.push('Generic greeting (lack of personalization)');
      features.generic_greeting = true;
      break;
    }
  }

  const personalizedTerms = ['first name', 'last name', 'mr. ', 'ms. ', 'dr. ', 'dear '];
  let hasPersonalization = false;
  for (const term of personalizedTerms) {
    if (contentLower.includes(term) && !contentLower.includes('dear customer')) {
      hasPersonalization = true;
      break;
    }
  }

  if (!hasPersonalization) {
    features.unpersonalized = true;
  }

  return score;
}

function analyzeSuspiciousPhrasing(contentLower: string, indicators: string[], features: Record<string, unknown>): number {
  let score = 0;

  const suspiciousPhrases = [
    'verify your account',
    'confirm your information',
    'update your details',
    'suspended account',
    'unusual activity detected',
    'unauthorized access',
    'click the link below',
    're-activate your account',
    'validate your identity',
    'confirm your password',
    'update payment method',
    're-authorize',
    'reactivate',
    'restore access',
    'unlock account',
    'resolve issue',
    'claim reward',
    'complete verification',
  ];

  let suspiciousCount = 0;
  for (const phrase of suspiciousPhrases) {
    if (contentLower.includes(phrase)) {
      suspiciousCount++;
      indicators.push(`Phishing phrase: "${phrase}"`);
    }
  }

  score += suspiciousCount * 9;

  return score;
}

function analyzeURLBehavior(content: string, contentLower: string, indicators: string[], features: Record<string, unknown>): number {
  let score = 0;

  const urlPattern = /https?:\/\/[^\s<>"]+|www\.[^\s<>"]+/gi;
  const urls = content.match(urlPattern) || [];
  features.url_count = urls.length;

  if (urls.length > 3) {
    score += 15;
    indicators.push(`Excessive URLs detected (${urls.length})`);
  }

  if (urls.length > 5) {
    score += 10;
    indicators.push('Unusually high number of links');
  }

  const brandKeywords = ['paypal', 'amazon', 'google', 'microsoft', 'apple', 'bank', 'paycheck'];
  for (const brand of brandKeywords) {
    if (contentLower.includes(brand)) {
      for (const url of urls) {
        if (!url.toLowerCase().includes(brand)) {
          score += 22;
          indicators.push(`Mismatch: mentions "${brand}" but link doesn't match`);
          features.link_mismatch = true;
          break;
        }
      }
    }
  }

  const urlShorteners = ['bit.ly', 'tinyurl', 'goo.gl', 't.co', 'ow.ly', 'short.link', 'tiny.cc', 'buff.ly'];
  for (const shortener of urlShorteners) {
    if (contentLower.includes(shortener)) {
      score += 16;
      indicators.push('URL shortener detected (hides destination)');
      features.uses_shortener = true;
      break;
    }
  }

  return score;
}

function analyzeEmailMetadata(content: string, contentLower: string, indicators: string[], features: Record<string, unknown>): number {
  let score = 0;

  const attachmentKeywords = ['invoice', 'receipt', 'statement', 'document', 'attachment', 'file', 'download', 'open the attachment'];
  const hasAttachmentMention = attachmentKeywords.some(kw => contentLower.includes(kw));

  if (hasAttachmentMention) {
    score += 15;
    indicators.push('Attachment reference detected');
    if (contentLower.match(/urgent|immediate|now/)) {
      score += 12;
      indicators.push('Urgent request combined with attachment');
    }
  }

  if (contentLower.includes('from:') || contentLower.includes('sender:')) {
    features.has_sender_info = true;
  }

  if (contentLower.includes('subject:')) {
    features.has_subject = true;
  }

  return score;
}

function analyzeLanguagePatterns(content: string, contentLower: string, indicators: string[], features: Record<string, unknown>): number {
  let score = 0;

  const allCapsPattern = /\b[A-Z]{4,}\b/g;
  const capsMatches = content.match(allCapsPattern) || [];
  if (capsMatches.length > 3) {
    score += 8;
    indicators.push('Excessive all-caps text (shouting)');
  }

  const multipleExclamation = /!{2,}/g;
  if (multipleExclamation.test(content)) {
    score += 6;
    indicators.push('Multiple exclamation marks');
  }

  const grammarErrors = [
    /\b[A-Z]{2,}\s+[a-z]/g,
    /\s{2,}/g,
    /[.!?]{2,}/g,
  ];

  let grammarCount = 0;
  for (const pattern of grammarErrors) {
    const matches = content.match(pattern);
    if (matches && matches.length > 2) {
      grammarCount++;
    }
  }

  if (grammarCount > 0) {
    score += grammarCount * 6;
    indicators.push('Poor grammar or unusual formatting');
    features.grammar_issues = grammarCount;
  }

  const misspelledBrands: Record<string, string[]> = {
    'paypal': ['paypa1', 'paypai', 'paypa1'],
    'google': ['g00gle', 'gogle'],
    'amazon': ['amaz0n', 'amazn'],
  };

  for (const [brand, misspellings] of Object.entries(misspelledBrands)) {
    for (const misspelling of misspellings) {
      if (contentLower.includes(misspelling)) {
        score += 28;
        indicators.push(`Misspelled brand detected: ${misspelling} (imitates ${brand})`);
        features.misspelled_brand = brand;
      }
    }
  }

  return score;
}

function analyzeTrustSignals(contentLower: string, indicators: string[], features: Record<string, unknown>): number {
  let score = 0;

  const legitimateSignals = [
    'regards,',
    'sincerely,',
    'best regards',
    'thank you',
    'contact our support',
    'if you have questions',
  ];

  let signalCount = 0;
  for (const signal of legitimateSignals) {
    if (contentLower.includes(signal)) {
      signalCount++;
    }
  }

  if (signalCount === 0) {
    score += 10;
    indicators.push('Missing legitimate closing signals');
    features.lacks_trust_signals = true;
  }

  const disclaimerPatterns = [
    'confidential',
    'do not forward',
    'proprietary',
    'internal use only',
  ];

  for (const disclaimer of disclaimerPatterns) {
    if (contentLower.includes(disclaimer)) {
      features.has_disclaimer = true;
    }
  }

  return score;
}

function analyzeRequestedActions(contentLower: string, indicators: string[], features: Record<string, unknown>): number {
  let score = 0;

  const actionKeywords = [
    'click',
    'download',
    'open',
    'install',
    'enable',
    'update',
    'upgrade',
    'install plugin',
    'run script',
  ];

  let actionCount = 0;
  for (const action of actionKeywords) {
    if (contentLower.includes(action)) {
      actionCount++;
    }
  }

  if (actionCount > 2) {
    score += 12;
    indicators.push('Multiple action requests detected');
    features.multiple_actions = true;
  }

  return score;
}

function analyzeAnatomyPatterns(contentLower: string, indicators: string[], features: Record<string, unknown>): number {
  let score = 0;

  const commonPhishingAnatomy = [
    { markers: ['dear', 'problem', 'urgent'], score: 15 },
    { markers: ['click', 'verify', 'password'], score: 18 },
    { markers: ['confirm', 'details', 'information'], score: 14 },
  ];

  for (const anatomy of commonPhishingAnatomy) {
    const markerMatches = anatomy.markers.filter(marker => contentLower.includes(marker)).length;
    if (markerMatches === anatomy.markers.length) {
      score += anatomy.score;
      indicators.push(`Detected phishing pattern anatomy: ${anatomy.markers.join(', ')}`);
      break;
    }
  }

  return score;
}

function matchContentThreatIndicators(contentLower: string, content: string, threatIndicators: any[], indicators: string[]): number {
  let score = 0;

  for (const indicator of threatIndicators) {
    if (indicator.indicator_type === 'keyword' && contentLower.includes(indicator.indicator_value.toLowerCase())) {
      score += 11;
      indicators.push(`Threat keyword matched: ${indicator.indicator_value}`);
    } else if (indicator.indicator_type === 'pattern') {
      try {
        const regex = new RegExp(indicator.indicator_value, 'i');
        if (regex.test(content)) {
          score += 13;
          indicators.push(`Threat pattern matched: ${indicator.metadata?.description || indicator.indicator_value}`);
        }
      } catch {
      }
    }
  }

  return score;
}

function analyzeSpoofingPatterns(contentLower: string, indicators: string[], features: Record<string, unknown>): number {
  let score = 0;

  const spoofingIndicators = [
    'noreply@',
    'noreply.',
    'do-not-reply',
    'no-reply',
    'reply-to:',
  ];

  for (const indicator of spoofingIndicators) {
    if (contentLower.includes(indicator)) {
      score += 14;
      indicators.push(`Email spoofing indicator: ${indicator}`);
      features.spoofing_detected = true;
      break;
    }
  }

  const domainMismatchPatterns = [
    '@' in contentLower ? contentLower.match(/@[\w.-]+/g) : [],
  ];

  return score;
}

function analyzeCredentialHarvesting(contentLower: string, indicators: string[], features: Record<string, unknown>): number {
  let score = 0;

  const harvestingKeywords = [
    'enter your password',
    'confirm password',
    'verify password',
    'update credentials',
    'reset your password',
    'change your password',
    'enter account details',
    'enter login information',
    'verify your login',
    'authenticate',
    're-authenticate',
    'confirm your username',
    'social security number',
    'ssn required',
    'driving license',
    'date of birth',
    'mother maiden name',
    'security question',
  ];

  let harvestingCount = 0;
  for (const keyword of harvestingKeywords) {
    if (contentLower.includes(keyword)) {
      harvestingCount++;
      indicators.push(`Credential harvesting: "${keyword}"`);
    }
  }

  if (harvestingCount > 0) {
    score += Math.min(harvestingCount * 16, 60);
    features.credential_harvesting = harvestingCount;
  }

  return score;
}

function analyzeReputationalHarms(contentLower: string, indicators: string[], features: Record<string, unknown>): number {
  let score = 0;

  const reputationKeywords = [
    'your reputation',
    'damage your reputation',
    'embarrassing information',
    'expose you',
    'release information',
    'publicly shame',
    'blackmail',
    'extortion',
    'compromising photos',
    'private information',
    'intimate images',
  ];

  let repCount = 0;
  for (const keyword of reputationKeywords) {
    if (contentLower.includes(keyword)) {
      repCount++;
      indicators.push(`Reputational threat: "${keyword}"`);
    }
  }

  if (repCount > 0) {
    score += Math.min(repCount * 18, 55);
    features.reputation_threat = true;
  }

  return score;
}

function analyzeCloneAttacks(contentLower: string, content: string, indicators: string[], features: Record<string, unknown>): number {
  let score = 0;

  const clonePatterns = [
    'this is a copy of',
    'similar to official',
    'looks like',
    'similar interface',
  ];

  for (const pattern of clonePatterns) {
    if (contentLower.includes(pattern)) {
      score += 19;
      indicators.push(`Clone attack indicator: "${pattern}"`);
      features.clone_attack = true;
      break;
    }
  }

  const fakeLogos = ['[logo]', '[image:', 'base64'];
  for (const logo of fakeLogos) {
    if (contentLower.includes(logo)) {
      score += 12;
      indicators.push(`Potential fake logo/image detected`);
      break;
    }
  }

  return score;
}

function analyzeSmishingPatterns(contentLower: string, indicators: string[], features: Record<string, unknown>): number {
  let score = 0;

  const smishingKeywords = [
    'click this link',
    'tap here',
    'text back',
    'reply to this',
    'call this number',
    'msg reply',
    'sms confirmation',
    'text to confirm',
    'mobile verification',
    '+1-',
    '+44-',
  ];

  let smishCount = 0;
  for (const keyword of smishingKeywords) {
    if (contentLower.includes(keyword)) {
      smishCount++;
      indicators.push(`SMS phishing (smishing): "${keyword}"`);
    }
  }

  if (smishCount > 0) {
    score += Math.min(smishCount * 14, 50);
    features.smishing_detected = true;
  }

  return score;
}

function analyzeVishing(contentLower: string, indicators: string[], features: Record<string, unknown>): number {
  let score = 0;

  const vishingKeywords = [
    'call us',
    'call now',
    'phone number',
    'call at',
    'dial',
    'speak to',
    'talk to our team',
    'voice verification',
    'phone verification',
    'automated call',
    'voice message',
  ];

  let vishingCount = 0;
  for (const keyword of vishingKeywords) {
    if (contentLower.includes(keyword)) {
      vishingCount++;
      indicators.push(`Voice phishing (vishing): "${keyword}"`);
    }
  }

  if (vishingCount > 0) {
    score += Math.min(vishingCount * 13, 48);
    features.vishing_detected = true;
  }

  return score;
}

function analyzeBusinessEmailCompromise(contentLower: string, indicators: string[], features: Record<string, unknown>): number {
  let score = 0;

  const becKeywords = [
    'urgent transfer',
    'wire transfer needed',
    'urgent wire',
    'payment needed',
    'confidential request',
    'urgent request',
    'unusual request',
    'executive',
    'ceo',
    'cfo',
    'banking details',
    'account information needed',
    'payment instructions',
    'wire instructions',
  ];

  let becCount = 0;
  for (const keyword of becKeywords) {
    if (contentLower.includes(keyword)) {
      becCount++;
      indicators.push(`BEC indicator: "${keyword}"`);
    }
  }

  if (becCount >= 3) {
    score += Math.min(becCount * 17, 62);
    features.bec_detected = true;
    indicators.push('Business Email Compromise (BEC) pattern detected');
  }

  return score;
}

function analyzeDomainsAndIP(content: string, contentLower: string, indicators: string[], features: Record<string, unknown>): number {
  let score = 0;

  const ipPattern = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g;
  const ips = content.match(ipPattern) || [];

  if (ips.length > 0) {
    score += Math.min(ips.length * 16, 45);
    indicators.push(`IP address(es) detected instead of domain: ${ips.join(', ')}`);
    features.ip_addresses = ips;
  }

  const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.gq', '.top', '.download', '.review'];
  for (const tld of suspiciousTLDs) {
    if (contentLower.includes(tld)) {
      score += 15;
      indicators.push(`Suspicious TLD detected: ${tld}`);
      features.suspicious_tld = tld;
      break;
    }
  }

  const lookalikeDomains = [
    'goggle.com',
    'amaz0n.com',
    'paypai.com',
    'microso.com',
    'appl3.com',
  ];

  for (const domain of lookalikeDomains) {
    if (contentLower.includes(domain)) {
      score += 26;
      indicators.push(`Lookalike domain detected: ${domain}`);
      features.lookalike_domain = domain;
      break;
    }
  }

  return score;
}

function analyzeTimeBasedThreats(contentLower: string, indicators: string[], features: Record<string, unknown>): number {
  let score = 0;

  const timeBasedKeywords = [
    'last chance',
    'offer expires',
    'limited time offer',
    'today only',
    'ends at midnight',
    'before tomorrow',
    'final notice',
    'last warning',
    'don\'t miss out',
    'act before',
  ];

  let timeCount = 0;
  for (const keyword of timeBasedKeywords) {
    if (contentLower.includes(keyword)) {
      timeCount++;
      indicators.push(`Time-based pressure: "${keyword}"`);
    }
  }

  if (timeCount > 0) {
    score += Math.min(timeCount * 11, 40);
    features.time_pressure = timeCount;
  }

  return score;
}

function analyzeSocialEngineeringTactics(contentLower: string, indicators: string[], features: Record<string, unknown>): number {
  let score = 0;

  const seKeywords = [
    'congratulations',
    'you\'ve won',
    'claim your prize',
    'you\'ve been selected',
    'exclusive offer',
    'special for you',
    'personalized deal',
    'act like you know them',
    'impersonation',
    'pretend to be',
    'authority',
    'act official',
  ];

  let seCount = 0;
  for (const keyword of seKeywords) {
    if (contentLower.includes(keyword)) {
      seCount++;
      indicators.push(`Social engineering: "${keyword}"`);
    }
  }

  if (seCount > 0) {
    score += Math.min(seCount * 12, 45);
    features.social_engineering = seCount;
  }

  return score;
}

function analyzeImageAndAttachmentRisks(contentLower: string, indicators: string[], features: Record<string, unknown>): number {
  let score = 0;

  const attachmentRisks = [
    '.exe',
    '.zip',
    '.rar',
    '.scr',
    '.vbs',
    '.js',
    '.bat',
    '.cmd',
    '.com',
    '.pif',
    '.msi',
    '.ps1',
    '.docm',
    '.xlsm',
    '.pptm',
  ];

  let riskCount = 0;
  for (const risk of attachmentRisks) {
    if (contentLower.includes(risk)) {
      riskCount++;
      indicators.push(`Potentially dangerous file type: ${risk}`);
    }
  }

  if (riskCount > 0) {
    score += Math.min(riskCount * 20, 70);
    features.dangerous_attachments = riskCount;
  }

  const imageNotice = ['embedded image', 'disable images', 'view images', 'load images'];
  for (const notice of imageNotice) {
    if (contentLower.includes(notice)) {
      score += 10;
      indicators.push(`Image loading prompt detected (tracking/obfuscation)`);
      break;
    }
  }

  return score;
}

function analyzeRansomwareIndicators(contentLower: string, indicators: string[], features: Record<string, unknown>): number {
  let score = 0;

  const ransomwareKeywords = [
    'your files encrypted',
    'your data encrypted',
    'pay to decrypt',
    'ransom',
    'bitcoin',
    'crypto payment',
    'decryption key',
    'pay within',
    'your computer has been locked',
    'system compromised',
    'critical alert',
  ];

  let ransomCount = 0;
  for (const keyword of ransomwareKeywords) {
    if (contentLower.includes(keyword)) {
      ransomCount++;
      indicators.push(`Ransomware indicator: "${keyword}"`);
    }
  }

  if (ransomCount > 0) {
    score += Math.min(ransomCount * 22, 80);
    features.ransomware_detected = true;
    indicators.push('CRITICAL: Potential ransomware threat detected');
  }

  return score;
}

function analyzeSupplyChainThreats(contentLower: string, indicators: string[], features: Record<string, unknown>): number {
  let score = 0;

  const supplyChainKeywords = [
    'invoice attached',
    'pending invoice',
    'payment confirmation needed',
    'order confirmation',
    'shipment notification',
    'delivery confirmation',
    'tracking number',
    'customs',
    'tariff',
    'update payment method',
    'billing information',
  ];

  let scCount = 0;
  for (const keyword of supplyChainKeywords) {
    if (contentLower.includes(keyword)) {
      scCount++;
      indicators.push(`Supply chain threat: "${keyword}"`);
    }
  }

  if (scCount >= 2) {
    score += Math.min(scCount * 14, 50);
    features.supply_chain_threat = true;
  }

  return score;
}
