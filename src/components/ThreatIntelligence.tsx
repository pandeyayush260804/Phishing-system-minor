import { useEffect, useState } from 'react';
import {
  Database,
  AlertCircle,
  RefreshCw,
  ShieldAlert,
  Globe,
  Activity,
  ExternalLink,
} from 'lucide-react';

import { getThreatIndicators, getPhishingURLs } from '../lib/supabase';
import { ThreatIndicator, PhishingURL } from '../types';

export default function ThreatIntelligence() {
  const [indicators, setIndicators] = useState<ThreatIndicator[]>([]);
  const [phishingUrls, setPhishingUrls] = useState<PhishingURL[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'indicators' | 'urls'>(
    'indicators'
  );

  const loadData = async () => {
    setLoading(true);

    try {
      const [indicatorsData, urlsData] = await Promise.all([
        getThreatIndicators(),
        getPhishingURLs(50),
      ]);

      // Explicitly normalize the Supabase response
      const normalizedIndicators: ThreatIndicator[] = (
        indicatorsData ?? []
      ).map((item: any) => ({
        id: String(item.id ?? ''),
        indicator_type: item.indicator_type,
        indicator_value: String(item.indicator_value ?? ''),
        threat_level: item.threat_level,
        source: String(item.source ?? ''),
        is_active: Boolean(item.is_active),
        metadata:
          item.metadata && typeof item.metadata === 'object'
            ? item.metadata
            : {},
        created_at: String(item.created_at ?? ''),
        updated_at: String(item.updated_at ?? ''),
      }));

      const normalizedUrls: PhishingURL[] = (urlsData ?? []).map(
        (item: any) => ({
          ...item,
          id: String(item.id ?? ''),
          url: String(item.url ?? ''),
          domain: String(item.domain ?? ''),
          threat_level: item.threat_level,
          detection_method: String(item.detection_method ?? ''),
          report_count: Number(item.report_count ?? 0),
          is_verified: Boolean(item.is_verified),
          last_seen: String(item.last_seen ?? ''),
        })
      );

      setIndicators(normalizedIndicators);
      setPhishingUrls(normalizedUrls);
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
        return 'bg-red-500/10 text-red-400 border-red-500/20';

      case 'high':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';

      case 'medium':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';

      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  const getThreatIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return <ShieldAlert className="w-4 h-4" />;

      case 'high':
        return <AlertCircle className="w-4 h-4" />;

      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return 'Unknown';
    }

    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-full bg-[#020617] text-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Database className="w-5 h-5 text-blue-400" />
              </div>

              <h1 className="text-2xl font-bold tracking-tight">
                Threat Intelligence
              </h1>
            </div>

            <p className="text-sm text-slate-400">
              Monitor malicious indicators and phishing infrastructure.
            </p>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="
              inline-flex items-center justify-center gap-2
              px-4 py-2.5
              rounded-xl
              border border-slate-800
              bg-[#0f172a]
              text-sm font-medium
              text-slate-300
              hover:bg-slate-800
              hover:text-white
              transition
              disabled:opacity-50
            "
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
            />
            Refresh
          </button>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-slate-400">
                Active Indicators
              </span>

              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Activity className="w-4 h-4 text-blue-400" />
              </div>
            </div>

            <div className="text-3xl font-bold">
              {indicators.length}
            </div>

            <p className="text-xs text-slate-500 mt-1">
              Currently monitored
            </p>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-slate-400">
                Phishing URLs
              </span>

              <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Globe className="w-4 h-4 text-red-400" />
              </div>
            </div>

            <div className="text-3xl font-bold">
              {phishingUrls.length}
            </div>

            <p className="text-xs text-slate-500 mt-1">
              Known malicious URLs
            </p>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-slate-400">
                Critical Threats
              </span>

              <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4 text-orange-400" />
              </div>
            </div>

            <div className="text-3xl font-bold">
              {
                indicators.filter(
                  (indicator) => indicator.threat_level === 'critical'
                ).length
              }
            </div>

            <p className="text-xs text-slate-500 mt-1">
              Requiring immediate attention
            </p>
          </div>
        </div>

        {/* MAIN CARD */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden">

          {/* TABS */}
          <div className="flex border-b border-slate-800">

            <button
              onClick={() => setActiveTab('indicators')}
              className={`
                flex items-center gap-2
                px-6 py-4
                text-sm font-medium
                transition
                ${
                  activeTab === 'indicators'
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5'
                    : 'text-slate-400 hover:text-white'
                }
              `}
            >
              <Activity className="w-4 h-4" />
              Indicators
              <span className="px-2 py-0.5 rounded-full text-xs bg-slate-800">
                {indicators.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('urls')}
              className={`
                flex items-center gap-2
                px-6 py-4
                text-sm font-medium
                transition
                ${
                  activeTab === 'urls'
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5'
                    : 'text-slate-400 hover:text-white'
                }
              `}
            >
              <Globe className="w-4 h-4" />
              Phishing URLs
              <span className="px-2 py-0.5 rounded-full text-xs bg-slate-800">
                {phishingUrls.length}
              </span>
            </button>
          </div>

          {/* CONTENT */}
          <div className="p-6">

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <RefreshCw className="w-7 h-7 text-blue-400 animate-spin mb-3" />

                <p className="text-sm text-slate-400">
                  Loading threat intelligence...
                </p>
              </div>
            ) : (
              <>
                {/* INDICATORS */}
                {activeTab === 'indicators' && (
                  <div className="space-y-3">

                    {indicators.length === 0 ? (
                      <div className="text-center py-16">
                        <Activity className="w-10 h-10 text-slate-600 mx-auto mb-3" />

                        <p className="text-slate-400">
                          No threat indicators found
                        </p>
                      </div>
                    ) : (
                      indicators.map((indicator) => (

                        <div
                          key={indicator.id}
                          className="
                            group
                            bg-[#020617]
                            border border-slate-800
                            rounded-xl
                            p-5
                            hover:border-blue-500/30
                            transition
                          "
                        >

                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

                            <div className="flex-1 min-w-0">

                              {/* BADGES */}
                              <div className="flex items-center gap-2 flex-wrap mb-3">

                                <span
                                  className={`
                                    inline-flex items-center gap-1.5
                                    px-2.5 py-1
                                    rounded-lg
                                    border
                                    text-xs font-medium
                                    ${getThreatBadge(
                                      indicator.threat_level
                                    )}
                                  `}
                                >
                                  {getThreatIcon(
                                    indicator.threat_level
                                  )}

                                  {indicator.threat_level.toUpperCase()}
                                </span>

                                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium">
                                  {String(indicator.indicator_type)}
                                </span>

                                {indicator.is_active && (
                                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                                    ACTIVE
                                  </span>
                                )}
                              </div>

                              {/* VALUE */}
                              <div className="font-mono text-sm text-[#F8FAFC] mb-2 break-all">
                                {String(indicator.indicator_value)}
                              </div>

                              {/* DESCRIPTION */}
                              {indicator.metadata &&
                                typeof indicator.metadata === 'object' &&
                                typeof indicator.metadata.description ===
                                  'string' && (
                                  <p className="text-sm text-slate-400 mb-3">
                                    {indicator.metadata.description}
                                  </p>
                                )}

                              {/* META */}
                              <div className="flex items-center gap-4 flex-wrap text-xs text-slate-500">
                                <span>
                                  Source:{' '}
                                  <span className="text-slate-400">
                                    {String(indicator.source)}
                                  </span>
                                </span>

                                <span>
                                  Added:{' '}
                                  <span className="text-slate-400">
                                    {formatDate(indicator.created_at)}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* PHISHING URLS */}
                {activeTab === 'urls' && (
                  <div className="space-y-3">

                    {phishingUrls.length === 0 ? (
                      <div className="text-center py-16">
                        <Globe className="w-10 h-10 text-slate-600 mx-auto mb-3" />

                        <p className="text-slate-400">
                          No phishing URLs found
                        </p>
                      </div>
                    ) : (
                      phishingUrls.map((url) => (

                        <div
                          key={url.id}
                          className="
                            bg-[#020617]
                            border border-slate-800
                            rounded-xl
                            p-5
                            hover:border-red-500/30
                            transition
                          "
                        >
                          <div className="flex gap-4">

                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex-shrink-0 flex items-center justify-center">
                              <AlertCircle className="w-5 h-5 text-red-400" />
                            </div>

                            <div className="flex-1 min-w-0">

                              {/* BADGES */}
                              <div className="flex gap-2 mb-3 flex-wrap">

                                <span
                                  className={`
                                    px-2.5 py-1
                                    text-xs font-medium
                                    rounded-lg
                                    border
                                    ${getThreatBadge(url.threat_level)}
                                  `}
                                >
                                  {String(url.threat_level).toUpperCase()}
                                </span>

                                {url.is_verified && (
                                  <span className="px-2.5 py-1 text-xs rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                    VERIFIED
                                  </span>
                                )}

                                <span className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 text-slate-400">
                                  Reports: {Number(url.report_count)}
                                </span>
                              </div>

                              {/* URL */}
                              <div className="flex items-start gap-2">
                                <p className="font-mono text-sm text-white break-all flex-1">
                                  {String(url.url)}
                                </p>

                                <ExternalLink className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                              </div>

                              {/* META */}
                              <div className="flex gap-4 flex-wrap mt-3 text-xs text-slate-500">

                                <span>
                                  Domain:{' '}
                                  <span className="text-slate-400">
                                    {String(url.domain)}
                                  </span>
                                </span>

                                <span>
                                  Method:{' '}
                                  <span className="text-slate-400">
                                    {String(url.detection_method)}
                                  </span>
                                </span>

                                <span>
                                  Last seen:{' '}
                                  <span className="text-slate-400">
                                    {formatDate(url.last_seen)}
                                  </span>
                                </span>

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
        </div>
      </div>
    </div>
  );
}