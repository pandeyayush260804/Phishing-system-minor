import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Shield, Activity } from 'lucide-react';
import { getRecentScans } from '../lib/supabase';
import { ScanResult } from '../types';

export default function StatsDashboard() {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScans();
  }, []);

  const loadScans = async () => {
    setLoading(true);
    try {
      const data = await getRecentScans(100);
      setScans(data);
    } catch (error) {
      console.error('Error loading scans:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalScans: scans.length,
    phishingDetected: scans.filter(s => s.is_phishing).length,
    safeContent: scans.filter(s => !s.is_phishing).length,
    avgScanTime:
      scans.length > 0
        ? scans.reduce((acc, s) => acc + s.scan_duration_ms, 0) / scans.length
        : 0,
  };

  const recentScans = scans.slice(0, 10);

  const getBadge = (isPhishing: boolean, score: number) => {
    if (!isPhishing) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (score >= 80) return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (score >= 65) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  };

  const formatTime = (ms: number) =>
    ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;

  const formatDate = (date: string) => {
    const d = new Date(date);
    const diff = Date.now() - d.getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const day = Math.floor(diff / 86400000);

    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${day}d ago`;
  };

  if (loading) {
    return (
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 flex justify-center py-16">
        <Activity className="w-8 h-8 text-blue-400 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* 🔥 STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <StatCard title="Total Scans" value={stats.totalScans} icon={<BarChart3 />} />
        <StatCard title="Threats Detected" value={stats.phishingDetected} icon={<Shield />} danger />
        <StatCard title="Safe Content" value={stats.safeContent} icon={<Shield />} success />
        <StatCard title="Avg Scan Time" value={formatTime(stats.avgScanTime)} icon={<TrendingUp />} />

      </div>

      {/* 🔥 RECENT SCANS */}
      <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">

        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Activity className="text-blue-400" />
          Recent Scans
        </h3>

        {recentScans.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No scans yet</p>
        ) : (
          <div className="space-y-4">
            {recentScans.map((scan) => (
              <div
                key={scan.id}
                className="bg-[#020617] border border-slate-800 rounded-xl p-4 
                hover:border-blue-500/30 transition"
              >
                <div className="flex items-center gap-3 mb-2 flex-wrap">

                  <span className={`px-2 py-1 text-xs rounded border ${getBadge(scan.is_phishing, scan.confidence_score)}`}>
                    {scan.is_phishing ? 'PHISHING' : 'SAFE'}
                  </span>

                  <span className="px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded">
                    {scan.scan_type.toUpperCase()}
                  </span>

                  <span className="text-xs text-slate-400">
                    Score: {scan.confidence_score.toFixed(1)}%
                  </span>
                </div>

                <p className="text-white text-sm truncate mb-2">
                  {scan.input_data}
                </p>

                <div className="text-xs text-slate-500 flex gap-4 flex-wrap">
                  <span>{formatDate(scan.created_at)}</span>
                  <span>{formatTime(scan.scan_duration_ms)}</span>
                  {scan.threat_indicators.length > 0 && (
                    <span>{scan.threat_indicators.length} indicators</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

/* 🔥 reusable stat card */
function StatCard({ title, value, icon, danger, success }: any) {
  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 
    hover:border-blue-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]
    transition">

      <div className="flex justify-between items-center mb-3">
        <p className="text-sm text-slate-400">{title}</p>
        <div className="text-blue-400">{icon}</div>
      </div>

      <h2 className={`text-3xl font-bold ${
        danger ? 'text-red-400' :
        success ? 'text-green-400' :
        'text-white'
      }`}>
        {value}
      </h2>
    </div>
  );
}