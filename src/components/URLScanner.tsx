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
      console.error(error);
      alert('Failed to analyze URL');
    } finally {
      setLoading(false);
    }
  };

  const getColor = (level: string) => {
    switch (level) {
      case 'critical': return 'from-red-500 to-red-700';
      case 'high': return 'from-orange-500 to-orange-700';
      case 'medium': return 'from-yellow-500 to-yellow-600';
      default: return 'from-green-500 to-green-700';
    }
  };

  return (
    <div className="bg-[#0f172a] text-white rounded-xl shadow-xl p-6 max-w-3xl mx-auto transition-all duration-300">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-blue-400" />
        <h2 className="text-2xl font-bold">URL Scanner</h2>
      </div>

      {/* INPUT */}
      <div className="flex gap-3">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://suspicious-link.com"
          className="flex-1 px-4 py-3 rounded-lg bg-[#1e293b] border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
          disabled={loading}
        />

        <button
          onClick={handleAnalyze}
          disabled={loading || !url.trim()}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 hover:scale-105 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-5 h-5" />
              Scanning...
            </>
          ) : (
            'Scan'
          )}
        </button>
      </div>

      {/* 🔥 SCANNING ANIMATION */}
      {loading && (
        <div className="mt-6">
          <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 animate-pulse w-full"></div>
          </div>
          <p className="text-sm text-gray-400 mt-2">Analyzing URL security...</p>
        </div>
      )}

      {/* RESULT */}
      {result && (
        <div className="mt-6 space-y-4 animate-fade-in">

          {/* RESULT CARD */}
          <div className={`p-5 rounded-xl bg-gradient-to-r ${getColor(result.threatLevel)} shadow-lg`}>
            <div className="flex gap-3">
              {result.isPhishing ? (
                <AlertTriangle className="w-7 h-7" />
              ) : (
                <CheckCircle className="w-7 h-7" />
              )}

              <div>
                <h3 className="text-lg font-bold">
                  {result.isPhishing ? 'Phishing Detected' : 'Safe URL'}
                </h3>
                <p>Threat Level: {result.threatLevel.toUpperCase()}</p>
                <p>Confidence: {result.confidenceScore.toFixed(1)}%</p>
              </div>
            </div>

            {/* 🔥 PROGRESS BAR */}
            <div className="mt-3 w-full bg-black/30 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-white"
                style={{ width: `${result.confidenceScore}%` }}
              />
            </div>
          </div>

          {/* INDICATORS */}
          {result.indicators.length > 0 && (
            <div className="bg-[#1e293b] p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                Threat Indicators
              </h4>
              <ul className="text-sm space-y-1 text-gray-300">
                {result.indicators.map((i, idx) => (
                  <li key={idx}>• {i}</li>
                ))}
              </ul>
            </div>
          )}

          {/* RECOMMENDATIONS */}
          {result.recommendations.length > 0 && (
            <div className="bg-[#1e293b] p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-blue-400" />
                Recommendations
              </h4>
              <ul className="text-sm space-y-1 text-gray-300">
                {result.recommendations.map((r, idx) => (
                  <li key={idx}>• {r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}