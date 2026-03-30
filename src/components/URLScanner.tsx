import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { analyzeURL } from '../lib/supabase';
import { AnalysisResult } from '../types';

export default function URLScanner() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const data = await analyzeURL(url);
      setResult(data);
    } catch (error) {
      console.error('Error analyzing URL:', error);
      alert('Failed to analyze URL. Please try again.');
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
        <Shield className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">URL Scanner</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter URL to analyze
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
              placeholder="https://example.com"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={handleAnalyze}
              disabled={loading || !url.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Scan URL'
              )}
            </button>
          </div>
        </div>

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
                    {result.isPhishing ? 'PHISHING DETECTED' : 'URL Appears Safe'}
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
                  <ExternalLink className="w-5 h-5 text-blue-500" />
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
