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
    avgConfidence: scans.length > 0
      ? scans.reduce((acc, s) => acc + s.confidence_score, 0) / scans.length
      : 0,
    avgScanTime: scans.length > 0
      ? scans.reduce((acc, s) => acc + s.scan_duration_ms, 0) / scans.length
      : 0,
  };

  const recentScans = scans.slice(0, 10);

  const getThreatBadge = (isPhishing: boolean, score: number) => {
    if (!isPhishing) return 'bg-green-100 text-green-700 border-green-200';
    if (score >= 80) return 'bg-red-100 text-red-700 border-red-200';
    if (score >= 65) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  };

  const formatTime = (ms: number) => {
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-12">
          <Activity className="w-8 h-8 text-blue-600 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Scans</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalScans}</p>
            </div>
            <BarChart3 className="w-12 h-12 text-blue-500 opacity-80" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Threats Detected</p>
              <p className="text-3xl font-bold text-red-600">{stats.phishingDetected}</p>
            </div>
            <Shield className="w-12 h-12 text-red-500 opacity-80" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Safe Content</p>
              <p className="text-3xl font-bold text-green-600">{stats.safeContent}</p>
            </div>
            <Shield className="w-12 h-12 text-green-500 opacity-80" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg Scan Time</p>
              <p className="text-3xl font-bold text-gray-800">{formatTime(stats.avgScanTime)}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-500 opacity-80" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" />
          Recent Scans
        </h3>

        {recentScans.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No scans yet</p>
        ) : (
          <div className="space-y-3">
            {recentScans.map((scan) => (
              <div
                key={scan.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getThreatBadge(scan.is_phishing, scan.confidence_score)}`}>
                        {scan.is_phishing ? 'PHISHING' : 'SAFE'}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                        {scan.scan_type.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        Score: {scan.confidence_score.toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 truncate mb-1">
                      {scan.input_data}
                    </p>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>{formatDate(scan.created_at)}</span>
                      <span>{formatTime(scan.scan_duration_ms)}</span>
                      {scan.threat_indicators.length > 0 && (
                        <span>{scan.threat_indicators.length} indicators</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
