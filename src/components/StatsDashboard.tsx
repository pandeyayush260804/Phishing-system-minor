import { useEffect, useState } from "react";
import {
  Activity,
  ShieldCheck,
  ShieldAlert,
  Zap,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

import { getRecentScans } from "../lib/supabase";
import { ScanResult } from "../types";

interface StatsDashboardProps {
  onNavigate?: (page: string) => void;
}

export default function StatsDashboard({
  onNavigate,
}: StatsDashboardProps) {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadScans();
  }, []);

  const loadScans = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getRecentScans(100);

      console.log("DASHBOARD SCANS:", data);
      console.log("NUMBER OF SCANS:", data?.length ?? 0);

      setScans(data || []);
    } catch (err) {
      console.error("Error loading dashboard scans:", err);
      setError("Unable to load scan activity.");
      setScans([]);
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------------
     CALCULATED STATISTICS
  -------------------------------- */

  const totalScans = scans.length;

  const phishingDetected = scans.filter(
    (scan) => scan.is_phishing === true
  ).length;

  const safeContent = scans.filter(
    (scan) => scan.is_phishing === false
  ).length;

  const averageScanTime =
    scans.length > 0
      ? scans.reduce(
          (total, scan) =>
            total + Number(scan.scan_duration_ms || 0),
          0
        ) / scans.length
      : 0;

  const recentScans = scans.slice(0, 10);

  /* --------------------------------
     HELPERS
  -------------------------------- */

  const formatTime = (ms: number) => {
    if (!ms) return "0ms";

    return ms < 1000
      ? `${Math.round(ms)}ms`
      : `${(ms / 1000).toFixed(2)}s`;
  };

  const formatDate = (date: string) => {
    if (!date) return "Unknown";

    const created = new Date(date);

    if (Number.isNaN(created.getTime())) {
      return "Unknown";
    }

    const diff = Date.now() - created.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;

    return `${days}d ago`;
  };

  const getThreatBadge = (
    isPhishing: boolean,
    score: number
  ) => {
    if (!isPhishing) {
      return {
        text: "SAFE",
        className:
          "bg-green-500/10 text-green-400 border-green-500/20",
      };
    }

    if (score >= 80) {
      return {
        text: "CRITICAL",
        className:
          "bg-red-500/10 text-red-400 border-red-500/20",
      };
    }

    if (score >= 65) {
      return {
        text: "HIGH RISK",
        className:
          "bg-orange-500/10 text-orange-400 border-orange-500/20",
      };
    }

    return {
      text: "SUSPICIOUS",
      className:
        "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    };
  };

  /* --------------------------------
     LOADING
  -------------------------------- */

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in-up">

        <div>
          <div className="h-7 w-52 bg-[#0F172A] rounded animate-pulse" />
          <div className="h-4 w-80 bg-[#0F172A] rounded mt-3 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 bg-[#0F172A] border border-[#1E293B] rounded-xl animate-pulse"
            />
          ))}
        </div>

        <div className="h-96 bg-[#0F172A] border border-[#1E293B] rounded-xl animate-pulse" />
      </div>
    );
  }

  /* --------------------------------
     MAIN DASHBOARD
  -------------------------------- */

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">

        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-glow" />

            <span className="text-[10px] font-semibold tracking-widest text-green-400 uppercase">
              Security Monitoring
            </span>
          </div>

          <h1 className="text-2xl font-semibold text-[#F8FAFC]">
            Security Overview
          </h1>

          <p className="text-sm text-[#64748B] mt-1">
            Monitor phishing detection activity and system performance.
          </p>
        </div>

        <button
          onClick={loadScans}
          className="self-start sm:self-auto flex items-center gap-2 px-3 py-2 rounded-lg border border-[#1E293B] bg-[#0F172A] text-xs text-[#94A3B8] hover:text-white hover:border-[#334155] transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>

      </div>

      {/* ERROR */}
      {error && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-4 h-4 text-red-400" />

            <p className="text-xs text-red-400">
              {error}
            </p>
          </div>

          <button
            onClick={loadScans}
            className="text-xs text-red-400 hover:text-red-300"
          >
            Retry
          </button>
        </div>
      )}

      {/* --------------------------------
          SUMMARY CARDS
      -------------------------------- */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        <StatCard
          title="Total Scans"
          value={totalScans}
          description="Analyzed content"
          icon={<Activity className="w-4 h-4" />}
        />

        <StatCard
          title="Threats Detected"
          value={phishingDetected}
          description="Potential phishing"
          icon={<ShieldAlert className="w-4 h-4" />}
          danger
        />

        <StatCard
          title="Safe Content"
          value={safeContent}
          description="No threat detected"
          icon={<ShieldCheck className="w-4 h-4" />}
          success
        />

        <StatCard
          title="Avg. Scan Time"
          value={formatTime(averageScanTime)}
          description="Processing speed"
          icon={<Zap className="w-4 h-4" />}
        />

      </div>

      {/* --------------------------------
          SECURITY STATUS
      -------------------------------- */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* System Status */}
        <div className="lg:col-span-2 bg-[#0F172A] border border-[#1E293B] rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs font-semibold text-[#F8FAFC]">
                Protection Status
              </p>

              <p className="text-xs text-[#64748B] mt-1">
                Current phishing detection service status
              </p>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/20 bg-green-500/5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-glow" />

              <span className="text-[10px] font-medium text-green-400">
                ACTIVE
              </span>
            </div>

          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">

            <StatusItem
              label="Detection Engine"
              value="Operational"
            />

            <StatusItem
              label="Database"
              value="Connected"
            />

            <StatusItem
              label="Monitoring"
              value="Active"
            />

          </div>

        </div>

        {/* Detection Ratio */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-5">

          <p className="text-xs font-semibold text-[#F8FAFC]">
            Detection Summary
          </p>

          <p className="text-xs text-[#64748B] mt-1">
            Based on recent scans
          </p>

          <div className="mt-5">

            {totalScans > 0 ? (
              <>
                <div className="flex items-end justify-between mb-2">

                  <span className="text-2xl font-semibold text-[#F8FAFC]">
                    {((phishingDetected / totalScans) * 100).toFixed(1)}%
                  </span>

                  <span className="text-[10px] text-[#64748B]">
                    threat ratio
                  </span>

                </div>

                <div className="h-2 rounded-full bg-[#1E293B] overflow-hidden">

                  <div
                    className="h-full rounded-full bg-red-500 transition-all duration-700"
                    style={{
                      width: `${Math.min(
                        (phishingDetected / totalScans) * 100,
                        100
                      )}%`,
                    }}
                  />

                </div>
              </>
            ) : (
              <div className="py-3">
                <p className="text-2xl font-semibold text-[#F8FAFC]">
                  0%
                </p>

                <p className="text-xs text-[#64748B] mt-1">
                  No scan data available
                </p>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* --------------------------------
          RECENT SCANS
      -------------------------------- */}

      <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl overflow-hidden">

        {/* Header */}

        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E293B]">

          <div>
            <h2 className="text-sm font-semibold text-[#F8FAFC]">
              Recent Scans
            </h2>

            <p className="text-xs text-[#64748B] mt-1">
              Latest phishing detection activity
            </p>
          </div>

          {onNavigate && (
            <button
              onClick={() => onNavigate("url-scanner")}
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Open Scanner
              <ExternalLink className="w-3 h-3" />
            </button>
          )}

        </div>

        {/* No data */}

        {recentScans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">

            <div className="w-12 h-12 rounded-xl bg-[#111827] border border-[#1E293B] flex items-center justify-center mb-4">
              <Activity className="w-5 h-5 text-[#475569]" />
            </div>

            <p className="text-sm text-[#94A3B8]">
              No scans recorded yet
            </p>

            <p className="text-xs text-[#475569] mt-1 text-center max-w-sm">
              Run a URL or content scan and the results will appear here.
            </p>

            {onNavigate && (
              <button
                onClick={() => onNavigate("url-scanner")}
                className="mt-5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white transition-colors"
              >
                Scan a URL
              </button>
            )}

          </div>
        ) : (

          /* Scan rows */

          <div className="divide-y divide-[#1E293B]">

            {recentScans.map((scan) => {

              const score = Number(
                scan.confidence_score || 0
              );

              const badge = getThreatBadge(
                scan.is_phishing,
                score
              );

              return (
                <div
                  key={scan.id}
                  className="px-5 py-4 hover:bg-[#111827]/70 transition-colors"
                >

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                    {/* Input */}

                    <div className="min-w-0 flex-1">

                      <div className="flex items-center gap-2 mb-2 flex-wrap">

                        <span
                          className={`px-2 py-1 rounded-md border text-[9px] font-semibold tracking-wide ${badge.className}`}
                        >
                          {badge.text}
                        </span>

                        <span className="px-2 py-1 rounded-md bg-[#111827] border border-[#1E293B] text-[9px] font-mono text-[#64748B]">
                          {scan.scan_type?.toUpperCase() || "SCAN"}
                        </span>

                      </div>

                      <p className="text-sm text-[#CBD5E1] truncate max-w-2xl">
                        {scan.input_data || "No input data"}
                      </p>

                    </div>

                    {/* Metrics */}

                    <div className="flex items-center gap-6 flex-shrink-0">

                      <div className="text-right">

                        <p className="text-[9px] uppercase tracking-wider text-[#475569]">
                          Confidence
                        </p>

                        <p
                          className={`text-xs font-mono mt-1 ${
                            scan.is_phishing
                              ? "text-red-400"
                              : "text-green-400"
                          }`}
                        >
                          {score.toFixed(1)}%
                        </p>

                      </div>

                      <div className="text-right">

                        <p className="text-[9px] uppercase tracking-wider text-[#475569]">
                          Duration
                        </p>

                        <p className="text-xs font-mono text-[#94A3B8] mt-1">
                          {formatTime(
                            Number(scan.scan_duration_ms || 0)
                          )}
                        </p>

                      </div>

                      <div className="text-right min-w-[55px]">

                        <p className="text-[9px] uppercase tracking-wider text-[#475569]">
                          Time
                        </p>

                        <p className="text-xs text-[#64748B] mt-1">
                          {formatDate(scan.created_at)}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* Threat indicators */}

                  {scan.threat_indicators &&
                    scan.threat_indicators.length > 0 && (
                      <div className="flex items-center gap-2 mt-3">

                        <ShieldAlert className="w-3 h-3 text-orange-400" />

                        <span className="text-[10px] text-[#64748B]">
                          {scan.threat_indicators.length} threat
                          indicator
                          {scan.threat_indicators.length !== 1
                            ? "s"
                            : ""}{" "}
                          detected
                        </span>

                      </div>
                    )}

                </div>
              );
            })}

          </div>
        )}

      </div>

      {/* DEBUG INFORMATION
          Remove this section after confirming the data works.
      */}

      <div className="text-[10px] text-[#334155] font-mono">
        Dashboard loaded {scans.length} scan record
        {scans.length !== 1 ? "s" : ""} from Supabase.
      </div>

    </div>
  );
}

/* --------------------------------
   STAT CARD
-------------------------------- */

function StatCard({
  title,
  value,
  description,
  icon,
  danger,
  success,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  danger?: boolean;
  success?: boolean;
}) {
  return (
    <div className="group bg-[#0F172A] border border-[#1E293B] rounded-xl p-5 hover:border-[#334155] transition-all duration-200">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-xs text-[#64748B]">
            {title}
          </p>

          <p
            className={`text-2xl font-semibold mt-3 ${
              danger
                ? "text-red-400"
                : success
                ? "text-green-400"
                : "text-[#F8FAFC]"
            }`}
          >
            {value}
          </p>

          <p className="text-[10px] text-[#475569] mt-1">
            {description}
          </p>
        </div>

        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
            danger
              ? "text-red-400 bg-red-500/5 border-red-500/10"
              : success
              ? "text-green-400 bg-green-500/5 border-green-500/10"
              : "text-blue-400 bg-blue-500/5 border-blue-500/10"
          }`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}

/* --------------------------------
   STATUS ITEM
-------------------------------- */

function StatusItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">

      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />

      <div>
        <p className="text-[10px] text-[#475569]">
          {label}
        </p>

        <p className="text-xs text-[#94A3B8] mt-0.5">
          {value}
        </p>
      </div>

    </div>
  );
}