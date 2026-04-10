import { Shield, Zap, Lock, Radar, TrendingUp, AlertCircle } from 'lucide-react';

interface FrontPageProps {
  onEnter: () => void;
}

export default function FrontPage({ onEnter }: FrontPageProps) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#020617] text-white">

      {/* 🔥 Animated Background Glow */}
      <div className="absolute inset-0">
        <div className="absolute w-[500px] h-[500px] bg-blue-500/20 blur-3xl rounded-full top-[-100px] left-[-100px] animate-pulse"></div>
        <div className="absolute w-[400px] h-[400px] bg-cyan-500/20 blur-3xl rounded-full bottom-[-100px] right-[-100px] animate-pulse"></div>
      </div>

      {/* HEADER */}
      <header className="relative border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-xl shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-wide">PhishGuard</h1>
        </div>
      </header>

      {/* MAIN */}
      <div className="relative max-w-7xl mx-auto px-6">

        <div className="py-20 grid lg:grid-cols-2 gap-12 items-center">

          {/* LEFT */}
          <div className="animate-fade-in">
            <h2 className="text-5xl lg:text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent leading-tight">
              Advanced Phishing Detection
            </h2>

            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
              Real-time AI-powered protection against phishing attacks. Analyze URLs and content instantly to stay secure.
            </p>

            {/* BUTTONS */}
            <div className="flex gap-4">
              <button
                onClick={onEnter}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-semibold 
                hover:scale-105 hover:shadow-blue-500/40 shadow-lg transition-all duration-300"
              >
                🚀 Enter Dashboard
              </button>

              <button className="px-8 py-4 border border-slate-600 rounded-xl font-semibold 
              hover:bg-slate-800 hover:border-slate-400 transition-all duration-300">
                Learn More
              </button>
            </div>

            {/* STATS */}
            <div className="mt-12 grid grid-cols-3 gap-6 pt-8 border-t border-slate-800">
              <div>
                <div className="text-3xl font-bold text-blue-400">95%+</div>
                <p className="text-sm text-slate-500 mt-1">Accuracy</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-cyan-400">&lt;100ms</div>
                <p className="text-sm text-slate-500 mt-1">Speed</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400">24/7</div>
                <p className="text-sm text-slate-500 mt-1">Protection</p>
              </div>
            </div>
          </div>

          {/* RIGHT CARDS */}
          <div className="grid grid-cols-2 gap-5">

            {[{
              icon: <Radar className="w-6 h-6 text-blue-400" />,
              title: "URL Scanner",
              desc: "Analyze suspicious URLs instantly",
              color: "blue"
            },{
              icon: <AlertCircle className="w-6 h-6 text-cyan-400" />,
              title: "Content Analyzer",
              desc: "Scan emails & messages",
              color: "cyan"
            },{
              icon: <TrendingUp className="w-6 h-6 text-blue-400" />,
              title: "Dashboard",
              desc: "Threat analytics & stats",
              color: "blue"
            },{
              icon: <Lock className="w-6 h-6 text-cyan-400" />,
              title: "Report Threats",
              desc: "Submit suspicious content",
              color: "cyan"
            }].map((card, i) => (
              <div key={i}
                className="group bg-[#0f172a]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 
                hover:border-blue-500/50 hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <div className="mb-4">{card.icon}</div>
                <h3 className="font-semibold mb-1">{card.title}</h3>
                <p className="text-sm text-slate-400">{card.desc}</p>

                {/* glow effect */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 
                bg-gradient-to-r from-blue-500/10 to-cyan-500/10 transition"></div>
              </div>
            ))}
          </div>
        </div>

        {/* FEATURES */}
        <div className="py-16 grid md:grid-cols-3 gap-10 border-t border-slate-800">

          <Feature icon={<Zap />} title="Lightning Fast" desc="Sub-100ms detection" />
          <Feature icon={<Shield />} title="Highly Accurate" desc="95%+ ML accuracy" />
          <Feature icon={<Radar />} title="Real-time Intelligence" desc="Live threat updates" />

        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 mt-20">
        <div className="text-center py-6 text-sm text-slate-500">
          PhishGuard © 2026
        </div>
      </footer>
    </div>
  );
}

/* 🔥 Small reusable component */
function Feature({ icon, title, desc }: any) {
  return (
    <div className="flex gap-4 items-start">
      <div className="text-blue-400">{icon}</div>
      <div>
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-slate-400">{desc}</p>
      </div>
    </div>
  );
}