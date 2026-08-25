import { useState } from 'react';

import {
  Link,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from 'lucide-react';

import { analyzeURL } from '../lib/supabase';
import { AnalysisResult } from '../types';

export default function URLScanner() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] =
    useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const data = await analyzeURL(url.trim());
      setResult(data);
    } catch (error) {
      console.error('URL analysis failed:', error);
      alert('Failed to analyze URL.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskStyle = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical':
        return {
          text: 'text-red-400',
          bg: 'bg-red-500/10',
          border: 'border-red-500/20',
        };

      case 'high':
        return {
          text: 'text-orange-400',
          bg: 'bg-orange-500/10',
          border: 'border-orange-500/20',
        };

      case 'medium':
        return {
          text: 'text-yellow-400',
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/20',
        };

      default:
        return {
          text: 'text-green-400',
          bg: 'bg-green-500/10',
          border: 'border-green-500/20',
        };
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">

      {/* HEADER */}

      <div>

        <div className="flex items-center gap-3">

          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">

            <Link className="w-4 h-4 text-blue-400" />

          </div>

          <div>

            <h1 className="text-xl font-semibold text-[#F8FAFC]">
              URL Scanner
            </h1>

            <p className="text-xs text-[#64748B] mt-0.5">
              Analyze a URL for phishing and malicious indicators.
            </p>

          </div>

        </div>

      </div>

      {/* SCANNER */}

      <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-5">

        <div className="flex items-center justify-between mb-3">

          <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest">
            URL to Analyze
          </label>

          <span className="text-[10px] text-[#475569] font-mono">
            URL ANALYSIS
          </span>

        </div>

        <div className="flex flex-col sm:flex-row gap-3">

          <div className="relative flex-1">

            <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />

            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAnalyze();
                }
              }}
              disabled={loading}
              placeholder="https://example.com/..."
              className="w-full bg-[#020617] border border-[#1E293B] rounded-lg pl-10 pr-4 py-3 text-sm text-[#F8FAFC] placeholder-[#374151] focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all disabled:opacity-50"
            />

          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !url.trim()}
            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
          >

            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Scan URL
              </>
            )}

          </button>

        </div>

        <p className="text-[10px] text-[#475569] mt-3">
          Do not open suspicious URLs directly. Paste the URL here for analysis.
        </p>

      </div>

      {/* LOADING */}

      {loading && (

        <div className="bg-[#0F172A] border border-blue-500/20 rounded-xl p-5">

          <div className="flex items-center gap-3">

            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />

            <div>

              <p className="text-sm text-[#F8FAFC]">
                Analyzing URL
              </p>

              <p className="text-xs text-[#64748B] mt-1">
                Running security checks...
              </p>

            </div>

          </div>

          <div className="mt-4 h-1.5 bg-[#020617] rounded-full overflow-hidden">

            <div className="h-full w-1/2 bg-blue-500 rounded-full animate-pulse" />

          </div>

        </div>

      )}

      {/* RESULT */}

      {result && !loading && (

        <div className="space-y-4 animate-fade-in-up">

          {/* RESULT SUMMARY */}

          <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl overflow-hidden">

            <div className="p-5">

              <div className="flex items-start justify-between gap-4">

                <div className="flex items-start gap-3">

                  <div
                    className={`
                      w-10 h-10 rounded-lg
                      flex items-center justify-center
                      ${
                        result.isPhishing
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-green-500/10 text-green-400'
                      }
                    `}
                  >

                    {result.isPhishing ? (
                      <ShieldAlert className="w-5 h-5" />
                    ) : (
                      <ShieldCheck className="w-5 h-5" />
                    )}

                  </div>

                  <div>

                    <h2
                      className={`
                        text-lg font-semibold
                        ${
                          result.isPhishing
                            ? 'text-red-400'
                            : 'text-green-400'
                        }
                      `}
                    >
                      {result.isPhishing
                        ? 'Phishing Detected'
                        : 'URL Appears Safe'}
                    </h2>

                    <p className="text-xs text-[#64748B] mt-1">
                      Analysis completed successfully.
                    </p>

                  </div>

                </div>

                <div
                  className={`
                    px-2.5 py-1 rounded-md border
                    text-[10px] font-semibold uppercase
                    ${getRiskStyle(result.threatLevel).bg}
                    ${getRiskStyle(result.threatLevel).border}
                    ${getRiskStyle(result.threatLevel).text}
                  `}
                >
                  {result.threatLevel}
                </div>

              </div>

              {/* Confidence */}

              <div className="mt-6">

                <div className="flex justify-between mb-2">

                  <span className="text-xs text-[#64748B]">
                    Confidence Score
                  </span>

                  <span className="text-xs font-semibold text-[#F8FAFC]">
                    {result.confidenceScore.toFixed(1)}%
                  </span>

                </div>

                <div className="h-2 bg-[#020617] rounded-full overflow-hidden">

                  <div
                    className={`
                      h-full rounded-full transition-all duration-700
                      ${
                        result.isPhishing
                          ? 'bg-red-500'
                          : 'bg-green-500'
                      }
                    `}
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, result.confidenceScore)
                      )}%`,
                    }}
                  />

                </div>

              </div>

            </div>

          </div>

          {/* INDICATORS */}

          {result.indicators.length > 0 && (

            <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-5">

              <div className="flex items-center gap-2 mb-4">

                <AlertTriangle className="w-4 h-4 text-orange-400" />

                <h3 className="text-sm font-semibold text-[#F8FAFC]">
                  Threat Indicators
                </h3>

              </div>

              <div className="space-y-2">

                {result.indicators.map((indicator, index) => (

                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-[#020617] border border-[#1E293B] rounded-lg"
                  >

                    <span className="text-orange-400 text-xs mt-0.5">
                      •
                    </span>

                    <span className="text-xs text-[#94A3B8]">
                      {indicator}
                    </span>

                  </div>

                ))}

              </div>

            </div>

          )}

          {/* RECOMMENDATIONS */}

          {result.recommendations.length > 0 && (

            <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-5">

              <div className="flex items-center gap-2 mb-4">

                <ExternalLink className="w-4 h-4 text-blue-400" />

                <h3 className="text-sm font-semibold text-[#F8FAFC]">
                  Recommendations
                </h3>

              </div>

              <div className="space-y-2">

                {result.recommendations.map(
                  (recommendation, index) => (

                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-[#020617] border border-[#1E293B] rounded-lg"
                    >

                      <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />

                      <span className="text-xs text-[#94A3B8]">
                        {recommendation}
                      </span>

                    </div>

                  )
                )}

              </div>

            </div>

          )}

        </div>

      )}

    </div>
  );
}