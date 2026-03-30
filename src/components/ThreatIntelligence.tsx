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
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Database className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Threat Intelligence</h2>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('indicators')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'indicators'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Threat Indicators ({indicators.length})
        </button>
        <button
          onClick={() => setActiveTab('urls')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'urls'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Known Phishing URLs ({phishingUrls.length})
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <>
          {activeTab === 'indicators' && (
            <div className="space-y-3">
              {indicators.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No threat indicators found</p>
              ) : (
                indicators.map((indicator) => (
                  <div
                    key={indicator.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getThreatBadge(indicator.threat_level)}`}>
                            {indicator.threat_level.toUpperCase()}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                            {indicator.indicator_type}
                          </span>
                        </div>
                        <p className="text-sm font-mono bg-gray-50 p-2 rounded border border-gray-200 break-all">
                          {indicator.indicator_value}
                        </p>
                        {indicator.metadata?.description && (
                          <p className="text-sm text-gray-600 mt-2">
                            {indicator.metadata.description as string}
                          </p>
                        )}
                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                          <span>Source: {indicator.source}</span>
                          <span>Added: {formatDate(indicator.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'urls' && (
            <div className="space-y-3">
              {phishingUrls.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No phishing URLs found</p>
              ) : (
                phishingUrls.map((url) => (
                  <div
                    key={url.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getThreatBadge(url.threat_level)}`}>
                            {url.threat_level.toUpperCase()}
                          </span>
                          {url.is_verified && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              Verified
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            Reports: {url.report_count}
                          </span>
                        </div>
                        <p className="text-sm font-mono bg-gray-50 p-2 rounded border border-gray-200 break-all mb-2">
                          {url.url}
                        </p>
                        <div className="flex gap-4 text-xs text-gray-600">
                          <span>Domain: {url.domain}</span>
                          <span>Method: {url.detection_method}</span>
                          <span>Last seen: {formatDate(url.last_seen)}</span>
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
