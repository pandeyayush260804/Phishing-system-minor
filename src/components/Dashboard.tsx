import { useState } from 'react';
import { Shield, BarChart3, Database, Flag, Info, Menu, X, LogOut } from 'lucide-react';
import URLScanner from './URLScanner';
import ContentAnalyzer from './ContentAnalyzer';
import ThreatIntelligence from './ThreatIntelligence';
import StatsDashboard from './StatsDashboard';
import ReportForm from './ReportForm';
import { Bot } from 'lucide-react';
import AIExplanation from './AIExplanation';
type TabType = 'scanner' | 'analyzer' | 'stats' | 'intelligence' | 'report' | 'ai';

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('scanner');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs = [
    { id: 'scanner' as const, label: 'URL Scanner', icon: Shield },
    { id: 'analyzer' as const, label: 'Content Analyzer', icon: Info },
    { id: 'stats' as const, label: 'Dashboard', icon: BarChart3 },
    { id: 'intelligence' as const, label: 'Threat Intelligence', icon: Database },
    { id: 'report' as const, label: 'Report Threat', icon: Flag },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col">

      {/* HEADER */}
      <header className="bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center justify-between">

          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-slate-800 rounded-lg"
            >
              {sidebarOpen ? <X /> : <Menu />}
            </button>

            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5 rounded-xl shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>

              <div>
                <h1 className="text-xl font-bold">PhishGuard</h1>
                <p className="text-xs text-slate-400">Detection System</p>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-400 transition"
          >
            <LogOut className="w-4 h-4" />
            Exit
          </button>
        </div>
      </header>

      <div className="flex flex-1 relative">

        {/* 🔥 SIDEBAR */}
        <aside
          className={`
            fixed lg:static z-50 h-full
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0
            w-64 bg-[#020617] border-r border-slate-800
            transition-transform duration-300
          `}
        >
          <nav className="p-4 space-y-2">

            {tabs.map((tab) => {
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);

                    // close sidebar only on mobile
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-400'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 group-hover:scale-110 transition" />
                  {tab.label}
                </button>
              );
            })}

          </nav>
        </aside>

        {/* 🔥 OVERLAY (mobile only) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* MAIN */}
        <main className="flex-1 overflow-auto">

          {/* background glow */}
          <div className="absolute w-[400px] h-[400px] bg-blue-500/10 blur-3xl rounded-full top-20 left-20"></div>

          <div className="relative p-6 lg:p-10">
            <div className="max-w-6xl mx-auto animate-fade-in">

              {activeTab === 'scanner' && <URLScanner />}
              {activeTab === 'analyzer' && <ContentAnalyzer />}
              {activeTab === 'stats' && <StatsDashboard />}
              {activeTab === 'intelligence' && <ThreatIntelligence />}
              {activeTab === 'report' && <ReportForm />}
              {activeTab === 'ai' && <AIExplanation />}

            </div>
          </div>

        </main>
      </div>
    </div>
  );
}