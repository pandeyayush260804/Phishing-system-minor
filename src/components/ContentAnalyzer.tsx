import { useState } from 'react';
import { Mail, AlertTriangle, CheckCircle, Loader2, Link as LinkIcon } from 'lucide-react';
import { analyzeContent } from '../lib/supabase';
import { AnalysisResult } from '../types';

export default function ContentAnalyzer() {
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState<'email' | 'sms' | 'other'>('email');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!content.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const data = await analyzeContent(content, contentType);
      setResult(data);
    } catch (error) {
      console.error('Error analyzing content:', error);
      alert('Failed to analyze content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 65) return 'text-orange-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <Mail className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Email / Message Analyzer</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content Type
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setContentType('email')}
              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                contentType === 'email'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              Email
            </button>
            <button
              onClick={() => setContentType('sms')}
              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                contentType === 'sms'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              SMS
            </button>
            <button
              onClick={() => setContentType('other')}
              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                contentType === 'other'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              Other
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paste message content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste the email body, SMS message, or any suspicious text here..."
            rows={8}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={loading}
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || !content.trim()}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors font-medium"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing Content...
            </>
          ) : (
            'Analyze Content'
          )}
        </button>

        {result && (
          <div className="mt-6 space-y-4">
            <div className={`p-4 rounded-lg border-2 ${getThreatColor(result.threatLevel)}`}>
              <div className="flex items-start gap-3">
                {result.isPhishing ? (
                  <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-1" />
                ) : (
                  <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">
                    {result.isPhishing ? 'PHISHING DETECTED' : 'Content Appears Legitimate'}
                  </h3>
                  <p className="text-sm opacity-90">
                    Threat Level: <span className="font-semibold uppercase">{result.threatLevel}</span>
                  </p>
                  <p className="text-sm opacity-90">
                    Confidence Score: <span className={`font-bold ${getScoreColor(result.confidenceScore)}`}>
                      {result.confidenceScore.toFixed(1)}%
                    </span>
                  </p>
                  {result.scanDuration && (
                    <p className="text-sm opacity-75 mt-1">
                      Analysis completed in {result.scanDuration}ms
                    </p>
                  )}
                </div>
              </div>
            </div>

            {result.extractedUrls && result.extractedUrls.length > 0 && (
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-purple-500" />
                  Extracted URLs ({result.extractedUrls.length})
                </h4>
                <ul className="space-y-2">
                  {result.extractedUrls.map((url, idx) => (
                    <li key={idx} className="text-sm text-gray-700 bg-white p-2 rounded border border-purple-200 break-all">
                      {url}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.indicators.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Threat Indicators ({result.indicators.length})
                </h4>
                <ul className="space-y-2">
                  {result.indicators.map((indicator, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-orange-500 mt-1">•</span>
                      <span>{indicator}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.recommendations.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                  Recommendations
                </h4>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
