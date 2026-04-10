import { useState, useEffect } from 'react';
import { Database, AlertCircle, RefreshCw } from 'lucide-react';
import { getThreatIndicators, getPhishingURLs } from '../lib/supabase';
import { ThreatIndicator, PhishingURL } from '../types';

export default function ThreatIntelligence() {
  const [indicators, setIndicators] = useState<ThreatIndicator[]>([]);
  const [phishingUrls, setPhishingUrls] = useState<PhishingURL[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'indicators' | 'urls'>('indicators');

  const loadData = async () => {
    setLoading(true);
    try {
      const [indicatorsData, urlsData] = await Promise.all([
        getThreatIndicators(),
        getPhishingURLs(50),
      ]);
      setIndicators(indicatorsData);
      setPhishingUrls(urlsData);
    } catch (error) {
      console.error('Error loading threat intelligence:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getThreatBadge = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Database className="w-7 h-7 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Threat Intelligence</h2>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-6 border-b border-slate-800">
        {[
          { key: 'indicators', label: `Indicators (${indicators.length})` },
          { key: 'urls', label: `Phishing URLs (${phishingUrls.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.key
                ? 'text-blue-400 border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="flex justify-center py-10">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
        </div>
      ) : (
        <>
          {/* INDICATORS */}
          {activeTab === 'indicators' && (
            <div className="space-y-4">
              {indicators.length === 0 ? (
                <p className="text-slate-400 text-center">No indicators found</p>
              ) : (
                indicators.map((indicator) => (
                  <div
                    key={indicator.id}
                    className="bg-[#020617] border border-slate-800 rounded-xl p-4 
                    hover:border-blue-500/30 transition"
                  >
                    <div className="flex gap-2 mb-2 flex-wrap">
                      <span className={`px-2 py-1 text-xs rounded border ${getThreatBadge(indicator.threat_level)}`}>
                        {indicator.threat_level.toUpperCase()}
                      </span>

                      <span className="px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded">
                        {indicator.indicator_type}
                      </span>
                    </div>

                    <p className="text-sm text-white font-mono break-all">
                      {indicator.indicator_value}
                    </p>

                    {indicator.metadata?.description && (
                      <p className="text-sm text-slate-400 mt-2">
                        {indicator.metadata.description as string}
                      </p>
                    )}

                    <div className="text-xs text-slate-500 mt-2 flex gap-4">
                      <span>Source: {indicator.source}</span>
                      <span>{formatDate(indicator.created_at)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* URLS */}
          {activeTab === 'urls' && (
            <div className="space-y-4">
              {phishingUrls.length === 0 ? (
                <p className="text-slate-400 text-center">No phishing URLs</p>
              ) : (
                phishingUrls.map((url) => (
                  <div
                    key={url.id}
                    className="bg-[#020617] border border-slate-800 rounded-xl p-4 
                    hover:border-red-500/30 transition"
                  >
                    <div className="flex gap-3">
                      <AlertCircle className="text-red-400 mt-1" />

                      <div className="flex-1">
                        <div className="flex gap-2 mb-2 flex-wrap">
                          <span className={`px-2 py-1 text-xs rounded border ${getThreatBadge(url.threat_level)}`}>
                            {url.threat_level.toUpperCase()}
                          </span>

                          {url.is_verified && (
                            <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded">
                              VERIFIED
                            </span>
                          )}

                          <span className="text-xs text-slate-400">
                            Reports: {url.report_count}
                          </span>
                        </div>

                        <p className="text-sm text-white font-mono break-all mb-2">
                          {url.url}
                        </p>

                        <div className="text-xs text-slate-500 flex gap-4 flex-wrap">
                          <span>{url.domain}</span>
                          <span>{url.detection_method}</span>
                          <span>{formatDate(url.last_seen)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}