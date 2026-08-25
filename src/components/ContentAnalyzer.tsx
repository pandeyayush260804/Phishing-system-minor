import { useState } from "react";
import { analyzeContent } from "../lib/supabase";
import { AnalysisResult as BackendAnalysisResult } from "../types";

type ContentType = "email" | "sms" | "other";
type RiskLevel = "safe" | "suspicious" | "phishing";

interface UIAnalysisResult {
  risk: RiskLevel;
  threatLevel: string;
  confidence: number;
  duration?: string;
  timestamp: string;
  extractedURLs: string[];
  indicators: string[];
  recommendations: string[];
}

export default function ContentAnalyzer() {
  const [contentType, setContentType] = useState<ContentType>("email");
  const [content, setContent] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<UIAnalysisResult | null>(null);
  const [error, setError] = useState("");

  const charLimit = contentType === "sms" ? 1600 : 5000;

  const handleAnalyze = async () => {
    if (!content.trim() || analyzing) return;

    setAnalyzing(true);
    setResult(null);
    setError("");

    const startTime = performance.now();

    try {
      /*
       * IMPORTANT:
       * This calls YOUR existing backend function.
       * No Figma/local ML/rule engine is used here.
       */
      const data: BackendAnalysisResult = await analyzeContent(
        content.trim(),
        contentType
      );

      const duration = Math.round(performance.now() - startTime);

      /*
       * Convert your backend response into the format
       * required by the Figma UI.
       */
      const risk: RiskLevel = data.isPhishing
        ? "phishing"
        : data.threatLevel === "medium" ||
            data.threatLevel === "high" ||
            data.threatLevel === "critical"
          ? "suspicious"
          : "safe";

      setResult({
        risk,
        threatLevel: data.threatLevel.toUpperCase(),
        confidence: Number(data.confidenceScore ?? 0),
        duration: `${duration}ms`,
        timestamp: new Date().toLocaleString(),
        extractedURLs: data.extractedUrls ?? [],
        indicators: data.indicators ?? [],
        recommendations: data.recommendations ?? [],
      });
    } catch (err) {
      console.error("Error analyzing content:", err);
      setError("Failed to analyze content. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const riskStyles = {
    safe: {
      color: "#22C55E",
      bg: "bg-[#22C55E]/5",
      border: "border-[#22C55E]/20",
      label: "SAFE",
    },
    suspicious: {
      color: "#EAB308",
      bg: "bg-[#EAB308]/5",
      border: "border-[#EAB308]/20",
      label: "SUSPICIOUS",
    },
    phishing: {
      color: "#EF4444",
      bg: "bg-[#EF4444]/5",
      border: "border-[#EF4444]/20",
      label: "PHISHING DETECTED",
    },
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold text-[#F8FAFC]">
          Content Analyzer
        </h1>

        <p className="text-sm text-[#64748B] mt-0.5">
          Analyze suspicious emails, SMS messages and other content.
        </p>
      </div>

      {/* CONTENT TYPE SELECTOR */}
      <div className="flex gap-2">
        {(["email", "sms", "other"] as ContentType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => {
              setContentType(type);
              setResult(null);
              setError("");
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
              contentType === type
                ? "bg-blue-600/15 border-blue-500/40 text-blue-400"
                : "bg-[#0F172A] border-[#1E293B] text-[#64748B] hover:border-[#334155] hover:text-[#94A3B8]"
            }`}
          >
            {type === "email"
              ? "Email"
              : type === "sms"
                ? "SMS"
                : "Other"}
          </button>
        ))}
      </div>

      {/* INPUT CARD */}
      <div className="p-5 rounded-xl border border-[#1E293B] bg-[#0F172A]">
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) =>
              setContent(e.target.value.slice(0, charLimit))
            }
            placeholder={`Paste suspicious ${contentType} content here...`}
            rows={8}
            disabled={analyzing}
            className="w-full bg-[#111827] border border-[#1E293B] text-[#F8FAFC] placeholder-[#374151] rounded-lg p-4 text-sm font-mono focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 resize-none transition-all disabled:opacity-60"
          />

          <div className="absolute bottom-3 right-3 text-[10px] text-[#374151] font-mono">
            {content.length} / {charLimit}
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          {/* CLEAR */}
          <button
            type="button"
            onClick={() => {
              setContent("");
              setResult(null);
              setError("");
            }}
            disabled={!content || analyzing}
            className="text-xs text-[#475569] hover:text-[#94A3B8] disabled:opacity-30 transition-colors cursor-pointer"
          >
            Clear
          </button>

          {/* ANALYZE */}
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!content.trim() || analyzing}
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-2"
          >
            {analyzing ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    opacity="0.2"
                  />

                  <path
                    d="M22 12a10 10 0 01-10 10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>

                Analyzing...
              </>
            ) : (
              "Analyze Content"
            )}
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && !analyzing && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* ANALYZING STATE */}
      {analyzing && (
        <div className="p-4 rounded-xl border border-[#1E293B] bg-[#0F172A] flex items-center gap-3">
          <svg
            className="w-4 h-4 animate-spin text-blue-400 flex-shrink-0"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              opacity="0.2"
            />

            <path
              d="M22 12a10 10 0 01-10 10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          <span className="text-sm text-[#94A3B8] font-mono">
            Extracting features and evaluating threat signals...
          </span>
        </div>
      )}

      {/* RESULT */}
      {result && !analyzing && (
        <div className="space-y-4 animate-fade-in-up">
          {(() => {
            const cfg = riskStyles[result.risk];

            return (
              <>
                {/* RISK HEADER */}
                <div
                  className={`p-5 rounded-xl border ${cfg.border} ${cfg.bg}`}
                >
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <div
                        className="text-lg font-bold mb-1"
                        style={{ color: cfg.color }}
                      >
                        {cfg.label}
                      </div>

                      <div className="flex items-center gap-4 text-sm flex-wrap">
                        <div>
                          <span className="text-[#64748B] text-xs">
                            Threat Level{" "}
                          </span>

                          <span
                            className="font-bold"
                            style={{ color: cfg.color }}
                          >
                            {result.threatLevel}
                          </span>
                        </div>

                        <div className="w-px h-4 bg-[#1E293B]" />

                        <div>
                          <span className="text-[#64748B] text-xs">
                            Confidence{" "}
                          </span>

                          <span className="font-bold text-[#F8FAFC]">
                            {result.confidence.toFixed(1)}%
                          </span>
                        </div>

                        {result.duration && (
                          <>
                            <div className="w-px h-4 bg-[#1E293B]" />

                            <div>
                              <span className="text-[#64748B] text-xs">
                                Duration{" "}
                              </span>

                              <span className="font-mono text-[#F8FAFC]">
                                {result.duration}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* EXTRACTED URLS */}
                {result.extractedURLs.length > 0 && (
                  <div className="p-5 rounded-xl border border-[#1E293B] bg-[#0F172A]">
                    <h3 className="text-sm font-semibold text-[#F8FAFC] mb-3">
                      Extracted URLs ({result.extractedURLs.length})
                    </h3>

                    <div className="space-y-2">
                      {result.extractedURLs.map((url, i) => (
                        <div
                          key={`${url}-${i}`}
                          className="flex items-center gap-2 px-3 py-2 rounded bg-[#111827] border border-[#1E293B]"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#EAB308"
                            strokeWidth="1.5"
                            className="w-3.5 h-3.5 flex-shrink-0"
                          >
                            <path
                              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>

                          <span className="font-mono text-xs text-[#94A3B8] truncate">
                            {url}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* THREAT INDICATORS */}
                <div className="p-5 rounded-xl border border-[#1E293B] bg-[#0F172A]">
                  <h3 className="text-sm font-semibold text-[#F8FAFC] mb-3">
                    Threat Indicators
                  </h3>

                  <div className="space-y-2">
                    {result.indicators.length > 0 ? (
                      result.indicators.map((indicator, i) => (
                        <div
                          key={`${indicator}-${i}`}
                          className="flex items-start gap-2.5 p-3 rounded-lg bg-[#111827] border border-[#1E293B]"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#EAB308"
                            strokeWidth="1.5"
                            className="w-4 h-4 mt-0.5 flex-shrink-0"
                          >
                            <path
                              d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>

                          <span className="text-sm text-[#94A3B8]">
                            {indicator}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-[#64748B]">
                        No significant threat indicators detected.
                      </p>
                    )}
                  </div>
                </div>

                {/* RECOMMENDATIONS */}
                {result.recommendations.length > 0 && (
                  <div className="p-5 rounded-xl border border-[#1E293B] bg-[#0F172A]">
                    <h3 className="text-sm font-semibold text-[#F8FAFC] mb-3">
                      Recommendations
                    </h3>

                    <div className="space-y-2">
                      {result.recommendations.map((recommendation, i) => (
                        <div
                          key={`${recommendation}-${i}`}
                          className="flex items-start gap-2.5"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />

                          <span className="text-sm text-[#94A3B8]">
                            {recommendation}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* DETECTION BREAKDOWN */}
                <div className="p-5 rounded-xl border border-[#1E293B]/50 bg-[#0F172A] opacity-60">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-sm font-semibold text-[#F8FAFC]">
                      Detection Breakdown
                    </h3>

                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-[#334155] text-[#475569] tracking-widest">
                      COMING SOON
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                    {[
                      {
                        label: "Rule Engine",
                        value: "—",
                      },
                      {
                        label: "ML Model",
                        value: "—",
                      },
                      {
                        label: "Final Score",
                        value: "—",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="p-3 rounded-lg bg-[#111827] border border-[#1E293B] text-center"
                      >
                        <div className="text-[#374151] text-[10px] mb-1">
                          {item.label}
                        </div>

                        <div className="text-[#374151] text-lg font-bold">
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] text-[#374151] mt-3">
                    Hybrid ML + rule-based text feature extraction planned for
                    v2.
                  </p>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* EMPTY STATE */}
      {!result && !analyzing && !error && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#0F172A] border border-[#1E293B] flex items-center justify-center mb-4">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#374151"
              strokeWidth="1.5"
              className="w-7 h-7"
            >
              <path
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <p className="text-sm text-[#475569]">
            Paste content above to begin analysis
          </p>
        </div>
      )}
    </div>
  );
}