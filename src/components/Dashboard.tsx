import { useState } from 'react';
import {
  Shield,
  LayoutDashboard,
  Link,
  Mail,
  Database,
  Flag,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

import URLScanner from './URLScanner';
import ContentAnalyzer from './ContentAnalyzer';
import ThreatIntelligence from './ThreatIntelligence';
import StatsDashboard from './StatsDashboard';
import ReportForm from './ReportForm';

type PageId =
  | 'overview'
  | 'url-scanner'
  | 'content-analyzer'
  | 'threat-intel'
  | 'report-threat';

interface DashboardProps {
  onLogout: () => void;
}

const PAGE_META: Record<
  PageId,
  {
    title: string;
    breadcrumb: string;
  }
> = {
  overview: {
    title: 'Security Overview',
    breadcrumb: 'PhishGuard / Dashboard',
  },

  'url-scanner': {
    title: 'URL Scanner',
    breadcrumb: 'PhishGuard / URL Scanner',
  },

  'content-analyzer': {
    title: 'Content Analyzer',
    breadcrumb: 'PhishGuard / Content Analyzer',
  },

  'threat-intel': {
    title: 'Threat Intelligence',
    breadcrumb: 'PhishGuard / Threat Intelligence',
  },

  'report-threat': {
    title: 'Report a Threat',
    breadcrumb: 'PhishGuard / Report Threat',
  },
};

type NavItem = {
  id: PageId;
  label: string;
  icon: React.ReactNode;
};

type NavGroup = {
  section: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    section: 'OVERVIEW',
    items: [
      {
        id: 'overview',
        label: 'Dashboard',
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
    ],
  },

  {
    section: 'SECURITY TOOLS',
    items: [
      {
        id: 'url-scanner',
        label: 'URL Scanner',
        icon: <Link className="w-4 h-4" />,
      },

      {
        id: 'content-analyzer',
        label: 'Content Analyzer',
        icon: <Mail className="w-4 h-4" />,
      },
    ],
  },

  {
    section: 'INTELLIGENCE',
    items: [
      {
        id: 'threat-intel',
        label: 'Threat Intelligence',
        icon: <Database className="w-4 h-4" />,
      },
    ],
  },

  {
    section: 'REPORTING',
    items: [
      {
        id: 'report-threat',
        label: 'Report Threat',
        icon: <Flag className="w-4 h-4" />,
      },
    ],
  },
];

export default function Dashboard({ onLogout }: DashboardProps) {
  const [currentPage, setCurrentPage] = useState<PageId>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const meta = PAGE_META[currentPage];

  const navigateTo = (page: PageId) => {
    setCurrentPage(page);
    setSidebarOpen(false);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return <StatsDashboard />;

      case 'url-scanner':
        return <URLScanner />;

      case 'content-analyzer':
        return <ContentAnalyzer />;

      case 'threat-intel':
        return <ThreatIntelligence />;

      case 'report-threat':
        return <ReportForm />;

      default:
        return <StatsDashboard />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#020617] text-white overflow-hidden">

      {/* ================= HEADER ================= */}

      <header className="h-12 flex-shrink-0 flex items-center justify-between px-4 bg-[#0A0F1E]/95 backdrop-blur border-b border-[#1E293B] z-30">

        {/* LEFT */}

        <div className="flex items-center gap-3">

          {/* Mobile menu */}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 rounded text-[#64748B] hover:text-[#94A3B8] hover:bg-[#1E293B] transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>

          {/* Logo */}

          <div className="hidden lg:flex items-center gap-2">

            <div className="w-6 h-6 rounded flex items-center justify-center">
              <Shield className="w-4 h-4 text-blue-500" />
            </div>

            <span className="font-semibold text-xs tracking-widest text-[#F8FAFC]">
              PHISHGUARD
            </span>

            <span className="text-[#1E293B]">
              /
            </span>

          </div>

          {/* Breadcrumb */}

          <span className="font-mono text-xs text-[#64748B]">
            {meta.breadcrumb}
          </span>

        </div>

        {/* RIGHT */}

        <div className="flex items-center gap-3">

          {/* Protection status */}

          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border border-[#22C55E]/20 bg-[#22C55E]/5">

            <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse-glow" />

            <span className="text-[10px] font-medium text-[#22C55E] tracking-wide">
              Protection Active
            </span>

          </div>

          {/* Exit */}

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#64748B] hover:text-[#94A3B8] hover:bg-[#1E293B] border border-transparent hover:border-[#1E293B] transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />

            <span className="hidden sm:inline">
              Exit
            </span>
          </button>

        </div>

      </header>

      {/* ================= BODY ================= */}

      <div className="flex flex-1 overflow-hidden">

        {/* ================= DESKTOP SIDEBAR ================= */}

        <aside className="hidden lg:flex w-56 flex-shrink-0 flex-col bg-[#0A0F1E] border-r border-[#1E293B]">

          {/* Sidebar logo */}

          <div className="flex items-center gap-3 px-4 py-5 border-b border-[#1E293B]">

            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <Shield className="w-4 h-4 text-blue-500" />
            </div>

            <div>
              <div className="font-semibold text-xs tracking-widest text-[#F8FAFC]">
                PHISHGUARD
              </div>

              <div className="text-[10px] text-[#64748B]">
                Phishing Detection
              </div>
            </div>

          </div>

          {/* Navigation */}

          <nav className="flex-1 py-4 overflow-y-auto">

            {NAV_GROUPS.map((group) => (

              <div
                key={group.section}
                className="mb-5"
              >

                <div className="px-4 mb-1">

                  <span className="text-[9px] font-semibold tracking-widest text-[#374151]">
                    {group.section}
                  </span>

                </div>

                {group.items.map((item) => {

                  const active = currentPage === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => navigateTo(item.id)}
                      className={`
                        relative w-full flex items-center gap-3
                        px-4 py-2.5 text-sm text-left
                        transition-all duration-150
                        ${
                          active
                            ? 'text-blue-400 bg-blue-600/10'
                            : 'text-[#64748B] hover:text-[#94A3B8] hover:bg-[#0F172A]'
                        }
                      `}
                    >

                      {/* Active indicator */}

                      {active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-500 rounded-r" />
                      )}

                      <span
                        className={
                          active
                            ? 'text-blue-400'
                            : 'text-[#475569]'
                        }
                      >
                        {item.icon}
                      </span>

                      <span className="font-medium">
                        {item.label}
                      </span>

                    </button>
                  );
                })}

              </div>

            ))}

          </nav>

          {/* Sidebar footer */}

          <div className="border-t border-[#1E293B] px-4 py-4 space-y-3">

            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[#0F172A] border border-[#1E293B]">

              <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse-glow" />

              <span className="text-[10px] text-[#64748B]">
                All systems operational
              </span>

            </div>

            <div className="flex items-center justify-between px-1">

              <span className="text-[10px] text-[#374151] font-mono">
                v1.0.0
              </span>

              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 text-[10px] text-[#475569] hover:text-[#94A3B8] transition-colors"
              >
                <LogOut className="w-3 h-3" />
                Exit
              </button>

            </div>

          </div>

        </aside>

        {/* ================= MOBILE SIDEBAR ================= */}

        {sidebarOpen && (

          <div className="fixed inset-0 z-40 lg:hidden">

            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />

            <aside className="absolute left-0 top-0 bottom-0 z-50 w-56 flex flex-col bg-[#0A0F1E] border-r border-[#1E293B]">

              <div className="flex items-center justify-between px-4 py-5 border-b border-[#1E293B]">

                <div className="flex items-center gap-3">

                  <Shield className="w-5 h-5 text-blue-500" />

                  <span className="font-semibold text-xs tracking-widest">
                    PHISHGUARD
                  </span>

                </div>

                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-[#64748B]"
                >
                  <X className="w-4 h-4" />
                </button>

              </div>

              <nav className="flex-1 py-4">

                {NAV_GROUPS.map((group) => (

                  <div
                    key={group.section}
                    className="mb-5"
                  >

                    <div className="px-4 mb-1">

                      <span className="text-[9px] font-semibold tracking-widest text-[#374151]">
                        {group.section}
                      </span>

                    </div>

                    {group.items.map((item) => {

                      const active =
                        currentPage === item.id;

                      return (
                        <button
                          key={item.id}
                          onClick={() =>
                            navigateTo(item.id)
                          }
                          className={`
                            w-full flex items-center gap-3
                            px-4 py-2.5 text-sm text-left
                            ${
                              active
                                ? 'text-blue-400 bg-blue-600/10'
                                : 'text-[#64748B] hover:text-[#94A3B8]'
                            }
                          `}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </button>
                      );

                    })}

                  </div>

                ))}

              </nav>

            </aside>

          </div>

        )}

        {/* ================= MAIN CONTENT ================= */}

        <main className="flex-1 overflow-y-auto">

          <div className="min-h-full p-6">

            <div className="max-w-7xl mx-auto">

              {renderPage()}

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}