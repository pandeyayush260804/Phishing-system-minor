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

  const getThreatStyles = (level: string) => {
    switch (level) {
      case 'critical': return 'border-red-500/40 bg-red-500/10 text-red-400';
      case 'high': return 'border-orange-500/40 bg-orange-500/10 text-orange-400';
      case 'medium': return 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400';
      default: return 'border-green-500/40 bg-green-500/10 text-green-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-400';
    if (score >= 65) return 'text-orange-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <Mail className="w-7 h-7 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Content Analyzer</h2>
      </div>

      <div className="space-y-5">

        {/* TYPE SELECT */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">Content Type</label>
          <div className="flex gap-3">
            {['email', 'sms', 'other'].map((type) => (
              <button
                key={type}
                onClick={() => setContentType(type as any)}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  contentType === type
                    ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                    : 'border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* TEXTAREA */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">Paste content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste suspicious message, email or SMS..."
            rows={8}
            className="w-full px-4 py-3 bg-[#020617] border border-slate-700 rounded-xl text-white 
            focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            disabled={loading}
          />
        </div>

        {/* BUTTON */}
        <button
          onClick={handleAnalyze}
          disabled={loading || !content.trim()}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 
          hover:scale-[1.02] transition-all duration-200 font-semibold flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Scanning...
            </>
          ) : (
            'Analyze Content'
          )}
        </button>

        {/* RESULT */}
        {result && (
          <div className="space-y-4 mt-6">

            {/* RESULT BOX */}
            <div className={`p-4 rounded-xl border ${getThreatStyles(result.threatLevel)}`}>
              <div className="flex gap-3">
                {result.isPhishing ? <AlertTriangle /> : <CheckCircle />}

                <div>
                  <h3 className="font-bold text-lg">
                    {result.isPhishing ? 'Phishing Detected' : 'Content Safe'}
                  </h3>

                  <p className="text-sm">
                    Threat: {result.threatLevel.toUpperCase()}
                  </p>

                  <p className="text-sm">
                    Score: <span className={`font-bold ${getScoreColor(result.confidenceScore)}`}>
                      {result.confidenceScore.toFixed(1)}%
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* URLs */}
            {result.extractedUrls?.length > 0 && (
              <div className="bg-[#020617] border border-slate-800 rounded-xl p-4">
                <h4 className="flex items-center gap-2 mb-3 text-purple-400">
                  <LinkIcon className="w-4 h-4" />
                  Extracted URLs
                </h4>
                {result.extractedUrls.map((url, i) => (
                  <p key={i} className="text-sm text-slate-300 break-all">
                    {url}
                  </p>
                ))}
              </div>
            )}

            {/* Indicators */}
            {result.indicators.length > 0 && (
              <div className="bg-[#020617] border border-slate-800 rounded-xl p-4">
                <h4 className="text-orange-400 mb-3">Threat Indicators</h4>
                {result.indicators.map((i, idx) => (
                  <p key={idx} className="text-sm text-slate-300">• {i}</p>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div className="bg-[#020617] border border-slate-800 rounded-xl p-4">
                <h4 className="text-blue-400 mb-3">Recommendations</h4>
                {result.recommendations.map((r, idx) => (
                  <p key={idx} className="text-sm text-slate-300">• {r}</p>
                ))}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}