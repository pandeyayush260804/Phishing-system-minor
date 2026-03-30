import { useState } from 'react';
import { Shield, BarChart3, Database, Flag, Info, Menu, X, LogOut } from 'lucide-react';
import URLScanner from './URLScanner';
import ContentAnalyzer from './ContentAnalyzer';
import ThreatIntelligence from './ThreatIntelligence';
import StatsDashboard from './StatsDashboard';
import ReportForm from './ReportForm';

type TabType = 'scanner' | 'analyzer' | 'stats' | 'intelligence' | 'report';

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('scanner');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const tabs = [
    { id: 'scanner' as const, label: 'URL Scanner', icon: Shield },
    { id: 'analyzer' as const, label: 'Content Analyzer', icon: Info },
    { id: 'stats' as const, label: 'Dashboard', icon: BarChart3 },
    { id: 'intelligence' as const, label: 'Threat Intelligence', icon: Database },
    { id: 'report' as const, label: 'Report Threat', icon: Flag },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2.5 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">PhishGuard</h1>
                <p className="text-xs text-gray-500">Phishing Detection System</p>
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Exit</span>
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-0'
          } bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden lg:w-64`}
        >
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
              <div className="transition-opacity duration-300">
                {activeTab === 'scanner' && <URLScanner />}
                {activeTab === 'analyzer' && <ContentAnalyzer />}
                {activeTab === 'stats' && <StatsDashboard />}
                {activeTab === 'intelligence' && <ThreatIntelligence />}
                {activeTab === 'report' && <ReportForm />}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
