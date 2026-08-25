import {
  Shield,
  Zap,
  Lock,
  Radar,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

interface FrontPageProps {
  onEnter: () => void;
}

const features = [
  {
    icon: Radar,
    title: "URL Scanner",
    description: "Analyze suspicious URLs and detect malicious destinations.",
  },
  {
    icon: AlertCircle,
    title: "Content Analyzer",
    description: "Inspect emails, SMS messages, and suspicious content.",
  },
  {
    icon: TrendingUp,
    title: "Threat Intelligence",
    description: "Access threat indicators and known phishing intelligence.",
  },
  {
    icon: Lock,
    title: "Threat Reporting",
    description: "Report suspicious URLs, messages, and phishing attempts.",
  },
];

const capabilities = [
  "Real-time phishing detection",
  "AI-powered content analysis",
  "Threat intelligence monitoring",
  "Suspicious URL detection",
];

export default function FrontPage({ onEnter }: FrontPageProps) {
  return (
    <div className="min-h-screen bg-[#020617] text-[#F8FAFC] overflow-hidden">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-250px] left-[-200px] w-[600px] h-[600px] rounded-full bg-blue-600/[0.07] blur-[120px]" />
        <div className="absolute bottom-[-250px] right-[-200px] w-[600px] h-[600px] rounded-full bg-cyan-500/[0.05] blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(#64748B 1px, transparent 1px), linear-gradient(90deg, #64748B 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 h-16 border-b border-[#1E293B] bg-[#0A0F1E]/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto h-full px-6 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600/10 border border-blue-500/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#3B82F6]" strokeWidth={1.5} />
            </div>

            <div>
              <div className="font-semibold text-sm tracking-[0.2em]">
                PHISHGUARD
              </div>
              <div className="text-[9px] text-[#64748B] tracking-wide">
                PHISHING DETECTION
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#22C55E]/20 bg-[#22C55E]/5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              <span className="text-[10px] text-[#22C55E]">
                Protection Active
              </span>
            </div>

            <button
              onClick={onEnter}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#3B82F6] text-xs font-medium transition-all"
            >
              Dashboard
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10">

        <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-16 items-center">

            {/* Hero Content */}
            <div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full border border-[#1E3A8A] bg-[#172554]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                <span className="text-[10px] font-medium tracking-wide text-[#60A5FA]">
                  AI-POWERED SECURITY PLATFORM
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[58px] leading-[1.05] font-bold tracking-tight">
                Detect phishing.
                <br />
                <span className="text-[#3B82F6]">
                  Stay protected.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-[#64748B]">
                PhishGuard provides real-time phishing detection through
                intelligent URL scanning, content analysis, and threat
                intelligence.
              </p>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 mt-8">

                <button
                  onClick={onEnter}
                  className="group flex items-center gap-2 px-5 py-3 rounded-lg bg-[#2563EB] hover:bg-[#3B82F6] text-sm font-medium shadow-lg shadow-blue-900/20 transition-all"
                >
                  Open Security Dashboard
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={onEnter}
                  className="flex items-center gap-2 px-5 py-3 rounded-lg border border-[#1E293B] bg-[#0A0F1E] hover:bg-[#0F172A] hover:border-[#334155] text-sm text-[#94A3B8] transition-all"
                >
                  Explore Tools
                </button>

              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 max-w-lg mt-12 pt-6 border-t border-[#1E293B]">

                <div>
                  <div className="text-2xl font-semibold text-[#F8FAFC]">
                    95%+
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-[#475569] mt-1">
                    Detection Accuracy
                  </div>
                </div>

                <div className="border-l border-[#1E293B] pl-6">
                  <div className="text-2xl font-semibold text-[#F8FAFC]">
                    &lt;100ms
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-[#475569] mt-1">
                    Analysis Speed
                  </div>
                </div>

                <div className="border-l border-[#1E293B] pl-6">
                  <div className="text-2xl font-semibold text-[#F8FAFC]">
                    24/7
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-[#475569] mt-1">
                    Protection
                  </div>
                </div>

              </div>
            </div>

            {/* Security Preview */}
            <div className="relative">

              <div className="absolute -inset-6 bg-blue-500/[0.04] blur-3xl rounded-full" />

              <div className="relative rounded-xl border border-[#1E293B] bg-[#0A0F1E]/95 shadow-2xl">

                {/* Window Header */}
                <div className="h-10 px-4 flex items-center justify-between border-b border-[#1E293B]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
                    <span className="text-[10px] font-medium text-[#94A3B8]">
                      SECURITY MONITOR
                    </span>
                  </div>

                  <span className="text-[9px] font-mono text-[#475569]">
                    LIVE
                  </span>
                </div>

                {/* Scanner */}
                <div className="p-5">

                  <div className="text-[9px] uppercase tracking-widest text-[#475569] mb-2">
                    Threat Analysis
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg border border-[#1E293B] bg-[#020617]">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <Radar className="w-4 h-4 text-[#3B82F6]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium">
                        Suspicious URL detected
                      </div>
                      <div className="text-[9px] text-[#475569] font-mono truncate mt-1">
                        https://secure-account-verification...
                      </div>
                    </div>

                    <span className="px-2 py-1 rounded border border-red-500/20 bg-red-500/10 text-[9px] text-red-400">
                      HIGH
                    </span>
                  </div>

                  {/* Score */}
                  <div className="mt-5 p-4 rounded-lg border border-[#1E293B] bg-[#020617]">

                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] text-[#64748B]">
                        Threat Confidence
                      </span>

                      <span className="text-sm font-semibold text-red-400">
                        92.4%
                      </span>
                    </div>

                    <div className="h-1.5 rounded-full bg-[#1E293B] overflow-hidden">
                      <div className="h-full w-[92%] bg-red-500 rounded-full" />
                    </div>

                  </div>

                  {/* Indicators */}
                  <div className="mt-4 space-y-2">

                    {[
                      "Suspicious domain pattern",
                      "Credential harvesting indicators",
                      "Urgent action language detected",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 text-[10px] text-[#64748B]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#3B82F6]" />
                        {item}
                      </div>
                    ))}

                  </div>

                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Capabilities */}
        <section className="border-y border-[#1E293B] bg-[#0A0F1E]/50">
          <div className="max-w-6xl mx-auto px-6 py-10">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

              <div>
                <div className="text-[9px] uppercase tracking-[0.2em] text-[#475569] mb-2">
                  Security capabilities
                </div>

                <h2 className="text-lg font-semibold">
                  One platform. Multiple layers of protection.
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                {capabilities.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-xs text-[#64748B]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                    {item}
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* Security Tools */}
        <section className="max-w-6xl mx-auto px-6 py-16">

          <div className="mb-8">
            <div className="text-[9px] uppercase tracking-[0.2em] text-[#475569] mb-2">
              Security tools
            </div>

            <h2 className="text-2xl font-semibold">
              Everything you need to investigate threats
            </h2>

            <p className="text-sm text-[#64748B] mt-2">
              Analyze, investigate, monitor, and report phishing threats from
              one security workspace.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group p-5 rounded-xl border border-[#1E293B] bg-[#0A0F1E]/80 hover:border-[#334155] hover:bg-[#0F172A] transition-all"
                >

                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                    <Icon
                      className="w-4 h-4 text-[#3B82F6]"
                      strokeWidth={1.5}
                    />
                  </div>

                  <h3 className="text-sm font-semibold mb-2">
                    {feature.title}
                  </h3>

                  <p className="text-xs leading-5 text-[#64748B]">
                    {feature.description}
                  </p>

                  <div className="flex items-center gap-1 mt-4 text-[10px] text-[#475569] group-hover:text-[#60A5FA] transition-colors">
                    Explore
                    <ArrowRight className="w-3 h-3" />
                  </div>

                </div>
              );
            })}

          </div>
        </section>

        {/* CTA */}
        <section className="max-w-6xl mx-auto px-6 pb-16">

          <div className="relative overflow-hidden rounded-xl border border-[#1E293B] bg-[#0A0F1E] p-8 md:p-10">

            <div className="absolute right-[-100px] top-[-150px] w-[350px] h-[350px] rounded-full bg-blue-600/[0.06] blur-3xl" />

            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-[#3B82F6]" />
                  <span className="text-[10px] uppercase tracking-widest text-[#3B82F6]">
                    Ready to analyze?
                  </span>
                </div>

                <h2 className="text-xl font-semibold">
                  Start protecting yourself from phishing threats.
                </h2>

                <p className="text-xs text-[#64748B] mt-2">
                  Access the PhishGuard security dashboard and begin analyzing
                  suspicious content.
                </p>
              </div>

              <button
                onClick={onEnter}
                className="flex-shrink-0 flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#2563EB] hover:bg-[#3B82F6] text-sm font-medium transition-all"
              >
                Enter Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          </div>

        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#1E293B] bg-[#0A0F1E]">

        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">

          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span className="text-[10px] font-semibold tracking-widest text-[#64748B]">
              PHISHGUARD
            </span>
          </div>

          <span className="text-[10px] text-[#374151] font-mono">
            © 2026 PhishGuard · v1.0.0
          </span>

          <div className="flex items-center gap-2 text-[10px] text-[#22C55E]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
            All systems operational
          </div>

        </div>

      </footer>
    </div>
  );
}