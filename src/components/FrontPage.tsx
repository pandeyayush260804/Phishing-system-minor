import { Shield, Zap, Lock, Radar, TrendingUp, AlertCircle } from 'lucide-react';

interface FrontPageProps {
  onEnter: () => void;
}

export default function FrontPage({ onEnter }: FrontPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <header className="border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">PhishGuard</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Advanced Phishing Detection
            </h2>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Real-time AI/ML-powered protection against phishing attacks. Analyze URLs and content instantly to protect yourself and your organization from cyber threats.
            </p>
            <div className="flex gap-4">
              <button
                onClick={onEnter}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-blue-500/50"
              >
                Enter Dashboard
              </button>
              <button className="px-8 py-4 border border-slate-500 rounded-lg font-semibold hover:border-slate-300 hover:bg-slate-800/50 transition-all duration-200">
                Learn More
              </button>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-4 pt-8 border-t border-slate-700">
              <div>
                <div className="text-3xl font-bold text-blue-400">95%+</div>
                <p className="text-sm text-slate-400 mt-1">Detection Accuracy</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-cyan-400">&lt;100ms</div>
                <p className="text-sm text-slate-400 mt-1">Analysis Speed</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400">24/7</div>
                <p className="text-sm text-slate-400 mt-1">Protection</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-200">
              <div className="bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Radar className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2">URL Scanner</h3>
              <p className="text-sm text-slate-400">Analyze suspicious URLs in real-time</p>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 hover:border-cyan-500/50 transition-all duration-200">
              <div className="bg-cyan-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="font-semibold mb-2">Content Analyzer</h3>
              <p className="text-sm text-slate-400">Check emails and messages instantly</p>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-200">
              <div className="bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2">Dashboard</h3>
              <p className="text-sm text-slate-400">View comprehensive threat analytics</p>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 hover:border-cyan-500/50 transition-all duration-200">
              <div className="bg-cyan-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="font-semibold mb-2">Report Threats</h3>
              <p className="text-sm text-slate-400">Submit suspicious content to database</p>
            </div>
          </div>
        </div>

        <div className="py-16 grid md:grid-cols-3 gap-8 border-t border-slate-700">
          <div className="flex gap-4">
            <Zap className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold mb-2">Lightning Fast</h4>
              <p className="text-sm text-slate-400">Sub-100ms detection with advanced ML models</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Shield className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold mb-2">Highly Accurate</h4>
              <p className="text-sm text-slate-400">95%+ accuracy powered by transformer models</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Radar className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold mb-2">Real-time Intelligence</h4>
              <p className="text-sm text-slate-400">Continuously updated threat intelligence feeds</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-slate-700/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-slate-400">
          <p>PhishGuard - Advanced Phishing Detection System</p>
        </div>
      </footer>
    </div>
  );
}
